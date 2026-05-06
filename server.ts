import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "node:fs/promises";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Could not set DNS servers, proceeding with defaults.");
}
import { User } from "./src/models/User";
import { Resume } from "./src/models/Resume";
import { Interview } from "./src/models/Interview";
import { Lead } from "./src/models/Lead";
import { SkillsLabResult } from "./src/models/SkillsLabResult";
import { CareerPathResult } from "./src/models/CareerPathResult";
import { Enrollment } from "./src/models/Enrollment";
import { Campaign } from "./src/models/Campaign";
import { EmailTemplate } from "./src/models/EmailTemplate";
import { Settings as SettingsModel } from "./src/models/Settings";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const aiClient = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET environment variable is not defined.");
}
const MONGODB_URI = process.env.MONGODB_URI;
const COMPANY_TRENDS_PATH = path.join(process.cwd(), "data", "company-trends.json");
const TREND_REFRESH_INTERVAL_SECONDS = 5;

type CompanyTrendSnapshot = {
  updatedAt: string;
  refreshIntervalSeconds: number;
  marketIndex: {
    label: string;
    value: string;
    direction: "up" | "down";
  };
  companySignals: Array<{
    id: string;
    growth: string;
    hiringStatus: "High" | "Moderate" | "Low";
    rating: number;
  }>;
  marketTrends: Array<{
    label: string;
    value: string;
    direction: "up" | "down";
  }>;
  salaryBenchmarks: Array<{
    label: string;
    value: string;
    sector: string;
  }>;
  parser?: {
    status: "online" | "fallback";
    query: string;
    summary: string;
    source: string;
  };
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const signedPercent = (value: number) => `${value >= 0 ? "+" : ""}${value}%`;
let companyTrendCache: CompanyTrendSnapshot | null = null;
let trendWorkerStarted = false;
let trendRefreshInFlight: Promise<CompanyTrendSnapshot> | null = null;

const MARKET_SEARCH_QUERIES = [
  "software engineering hiring market trend 2026",
  "AI engineering demand market trend 2026",
  "remote software developer jobs trend 2026",
  "SaaS venture funding market trend 2026",
  "product engineering roles hiring trend 2026",
];

function cleanSearchQuery(query: string) {
  return query
    .toLowerCase()
    .replace(/[?,$]/g, "")
    .replace("who is", "")
    .replace("what is", "")
    .trim();
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 3500): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "User-Agent": "RakeshCareerAI/1.0 market-trend-parser",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json() as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTextWithTimeout(url: string, timeoutMs = 3500): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "text/html,application/rss+xml,text/plain",
        "User-Agent": "RakeshCareerAI/1.0 market-trend-parser",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function firstDuckDuckGoTopicText(topics: any[]): string {
  for (const topic of topics || []) {
    if (typeof topic?.Text === "string" && topic.Text.length > 20) return topic.Text;
    const nested = firstDuckDuckGoTopicText(topic?.Topics || []);
    if (nested) return nested;
  }
  return "";
}

async function searchInternetSummary(query: string) {
  const cleaned = cleanSearchQuery(query);

  try {
    const rss = await fetchTextWithTimeout(
      `https://www.bing.com/news/search?q=${encodeURIComponent(cleaned)}&format=rss&mkt=en-IN`
    );
    const itemMatch = rss.match(/<item>[\s\S]*?<\/item>/i);
    const title = itemMatch?.[0]?.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
    const description = itemMatch?.[0]?.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
    const summary = decodeHtml(`${title}. ${description}`);
    if (summary.length > 20) {
      return { summary, source: "Bing News", query: cleaned };
    }
  } catch (err) {
    console.warn("Bing News trend lookup failed:", err instanceof Error ? err.message : err);
  }

  try {
    const data = await fetchJsonWithTimeout<any>(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(cleaned)}&format=json&no_html=1&skip_disambig=1`
    );
    const summary = data.AbstractText || firstDuckDuckGoTopicText(data.RelatedTopics);
    if (summary && summary.length > 10) {
      return { summary, source: "DuckDuckGo", query: cleaned };
    }
  } catch (err) {
    console.warn("DuckDuckGo trend lookup failed:", err instanceof Error ? err.message : err);
  }

  try {
    const wikiData = await fetchJsonWithTimeout<any>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleaned)}`
    );
    if (wikiData.extract) {
      return { summary: wikiData.extract, source: "Wikipedia", query: cleaned };
    }
  } catch (err) {
    console.warn("Wikipedia trend lookup failed:", err instanceof Error ? err.message : err);
  }

  return { summary: "", source: "fallback", query: cleaned };
}

function scoreMarketText(text: string, fallbackBase: number, offset: number) {
  const lower = text.toLowerCase();
  const positiveTerms = ["growth", "demand", "hiring", "jobs", "investment", "expansion", "surge", "increase", "strong"];
  const negativeTerms = ["layoff", "slowdown", "decline", "cut", "weak", "risk", "downturn", "freeze", "uncertain"];
  const positive = positiveTerms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
  const negative = negativeTerms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
  const pulse = Math.floor(Date.now() / 1000);
  const liveWave = Math.round(Math.sin((pulse + offset) / 17) * 4);
  return fallbackBase + (positive - negative) * 4 + liveWave;
}

function createCompanyTrendSnapshot(): CompanyTrendSnapshot {
  const now = new Date();
  const pulse = Math.floor(now.getTime() / 1000);
  const wave = (offset: number, spread: number) => Math.round(Math.sin((pulse + offset) / 37) * spread);
  const rating = (base: number, offset: number) => Number(clamp(base + wave(offset, 3) / 10, 3.8, 5).toFixed(1));
  const hiringStatus = (score: number): "High" | "Moderate" | "Low" => score >= 20 ? "High" : score >= 4 ? "Moderate" : "Low";

  const signals = [
    { id: "1", base: 12, rating: 4.8 },
    { id: "2", base: 45, rating: 4.9 },
    { id: "3", base: -2, rating: 4.5 },
    { id: "4", base: 8, rating: 4.6 },
    { id: "5", base: 210, rating: 4.7 },
    { id: "6", base: 25, rating: 4.4 },
  ].map((item, index) => {
    const growthScore = item.base + wave(index * 11, item.base > 100 ? 18 : 7);
    return {
      id: item.id,
      growth: signedPercent(growthScore),
      hiringStatus: hiringStatus(growthScore),
      rating: rating(item.rating, index * 17),
    };
  });

  const aiDemand = 120 + wave(3, 24);
  const remoteDemand = 20 + wave(9, 9);
  const funding = -8 + wave(15, 7);
  const productRoles = 16 + wave(21, 8);

  return {
    updatedAt: now.toISOString(),
    refreshIntervalSeconds: TREND_REFRESH_INTERVAL_SECONDS,
    marketIndex: {
      label: "Tech Talent Index",
      value: signedPercent(1 + wave(2, 2)),
      direction: wave(2, 2) >= -1 ? "up" : "down",
    },
    companySignals: signals,
    marketTrends: [
      { label: "Remote Software Roles", value: signedPercent(remoteDemand), direction: remoteDemand >= 0 ? "up" : "down" },
      { label: "AI Engineering Demand", value: signedPercent(aiDemand), direction: aiDemand >= 0 ? "up" : "down" },
      { label: "Venture Funding (SaaS)", value: signedPercent(funding), direction: funding >= 0 ? "up" : "down" },
      { label: "Product Engineering Roles", value: signedPercent(productRoles), direction: productRoles >= 0 ? "up" : "down" },
    ],
    salaryBenchmarks: [
      { label: "Senior Frontend Dev", value: `$${140 + wave(6, 8)}k - $${220 + wave(8, 10)}k`, sector: "US-West" },
      { label: "AI/ML Scientist", value: `$${180 + wave(12, 12)}k - $${310 + wave(14, 18)}k`, sector: "US-Remote" },
      { label: "Product Designer", value: `$${110 + wave(18, 6)}k - $${190 + wave(20, 8)}k`, sector: "Global" },
    ],
    parser: {
      status: "fallback",
      query: "local market model",
      summary: "Using deterministic local market model until online search returns usable trend text.",
      source: "local",
    },
  };
}

async function createLiveCompanyTrendSnapshot(): Promise<CompanyTrendSnapshot> {
  const base = createCompanyTrendSnapshot();
  const lookups = await Promise.all(MARKET_SEARCH_QUERIES.map(query => searchInternetSummary(query)));
  const usableLookups = lookups.filter(item => item.summary);
  const joinedText = usableLookups.map(item => item.summary).join(" ");

  if (!joinedText) {
    return base;
  }

  const remoteDemand = scoreMarketText(lookups[2]?.summary || joinedText, 20, 9);
  const aiDemand = scoreMarketText(lookups[1]?.summary || joinedText, 120, 3);
  const funding = scoreMarketText(lookups[3]?.summary || joinedText, -8, 15);
  const productRoles = scoreMarketText(lookups[4]?.summary || joinedText, 16, 21);
  const softwareHiring = scoreMarketText(lookups[0]?.summary || joinedText, 1, 2);

  const companyBias = [softwareHiring, productRoles, remoteDemand, softwareHiring, aiDemand, productRoles];
  const companySignals = base.companySignals.map((signal, index) => {
    const score = parseInt(signal.growth.replace("%", ""), 10) + Math.round(companyBias[index] / 12);
    return {
      ...signal,
      growth: signedPercent(score),
      hiringStatus: score >= 20 ? "High" as const : score >= 4 ? "Moderate" as const : "Low" as const,
    };
  });

  const primaryLookup = usableLookups[0];
  return {
    ...base,
    companySignals,
    marketIndex: {
      label: "Live Tech Talent Index",
      value: signedPercent(softwareHiring),
      direction: softwareHiring >= 0 ? "up" : "down",
    },
    marketTrends: [
      { label: "Remote Software Roles", value: signedPercent(remoteDemand), direction: remoteDemand >= 0 ? "up" : "down" },
      { label: "AI Engineering Demand", value: signedPercent(aiDemand), direction: aiDemand >= 0 ? "up" : "down" },
      { label: "Venture Funding (SaaS)", value: signedPercent(funding), direction: funding >= 0 ? "up" : "down" },
      { label: "Product Engineering Roles", value: signedPercent(productRoles), direction: productRoles >= 0 ? "up" : "down" },
    ],
    parser: {
      status: "online",
      query: primaryLookup.query,
      summary: primaryLookup.summary.slice(0, 260),
      source: primaryLookup.source,
    },
  };
}

async function readCompanyTrendSnapshot() {
  try {
    const raw = await fs.readFile(COMPANY_TRENDS_PATH, "utf8");
    return JSON.parse(raw) as CompanyTrendSnapshot;
  } catch {
    return null;
  }
}

async function writeCompanyTrendSnapshot(snapshot: CompanyTrendSnapshot) {
  await fs.mkdir(path.dirname(COMPANY_TRENDS_PATH), { recursive: true });
  await fs.writeFile(COMPANY_TRENDS_PATH, JSON.stringify(snapshot, null, 2), "utf8");
}

async function refreshCompanyTrendSnapshot(force = false) {
  if (trendRefreshInFlight) return trendRefreshInFlight;

  trendRefreshInFlight = (async () => {
    const existing = companyTrendCache || await readCompanyTrendSnapshot();
    const isFresh = existing && Date.now() - new Date(existing.updatedAt).getTime() < TREND_REFRESH_INTERVAL_SECONDS * 1000;
    if (existing && isFresh && !force) {
      companyTrendCache = existing;
      return existing;
    }

    try {
      const snapshot = await createLiveCompanyTrendSnapshot();
      companyTrendCache = snapshot;
      await writeCompanyTrendSnapshot(snapshot);
      return snapshot;
    } catch (err) {
      console.error("Live trend parser failed, using fallback:", err);
      const fallback = createCompanyTrendSnapshot();
      companyTrendCache = fallback;
      await writeCompanyTrendSnapshot(fallback);
      return fallback;
    }
  })();

  try {
    return await trendRefreshInFlight;
  } finally {
    trendRefreshInFlight = null;
  }
}

function startCompanyTrendParser() {
  if (trendWorkerStarted) return;
  trendWorkerStarted = true;

  const tick = () => {
    refreshCompanyTrendSnapshot(true).catch(err => {
      console.error("Background trend parser tick failed:", err);
    });
  };

  tick();
  setInterval(tick, TREND_REFRESH_INTERVAL_SECONDS * 1000);
  console.log(`>>> Live market trend parser running every ${TREND_REFRESH_INTERVAL_SECONDS}s`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(helmet({ contentSecurityPolicy: false }));

  // Global Mongoose Config
  mongoose.set('bufferCommands', false);

  // Middleware to check DB connection
  const checkDb = (req: any, res: any, next: any) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: "Database not connected. This is often because the IP address of the server isn't whitelisted in MongoDB Atlas. Please ensure 0.0.0.0/0 is allowed in your Atlas Network Security settings." 
      });
    }
    next();
  };

  // Helper for consistent responses
  const sendUserResponse = (res: any, user: any, token: string) => {
    res.json({ 
      user: { 
        uid: user._id.toString(), 
        email: user.email, 
        fullName: user.fullName || "", 
        isAdmin: Boolean(user.isAdmin),
        plan: user.plan || "free",
        preferredModel: user.preferredModel || "gemini-2.5-flash",
        avatarDataUrl: user.avatarDataUrl || ""
      }, 
      token 
    });
  };

  async function aiGenerate(params: { model: string; contents: string; config?: any; fallbackModels?: string[] }) {
    if (!aiClient) {
      throw new Error('Gemini API Key is not configured on the backend.');
    }

    const { model, fallbackModels = [], ...body } = params;
    const orderedModels = [model, ...fallbackModels].filter(Boolean);
    let lastError: any;

    for (const candidate of orderedModels) {
      try {
        return await aiClient.models.generateContent({ ...body, model: candidate });
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (
          msg.includes('429') ||
          msg.includes('quota') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('404') ||
          msg.includes('not found') ||
          msg.includes('not supported')
        ) {
          lastError = err;
          console.warn(`[AI] Model ${candidate} unavailable, trying next fallback...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('AI generation failed');
  }

  app.post('/api/ai/generate', checkDb, async (req, res) => {
    try {
      const { model, contents, config, fallbackModels } = req.body;
      if (!model || !contents) {
        return res.status(400).json({ error: 'AI request requires model and contents.' });
      }

      const response = await aiGenerate({ model, contents, config, fallbackModels });
      res.json({ response });
    } catch (err: any) {
      console.error('[AI] proxy error:', err?.message || err);
      res.status(500).json({ error: err?.message || 'AI generation failed' });
    }
  });

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", checkDb, async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "User already exists. Please sign in instead." });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ 
        email, 
        password: hashedPassword, 
        fullName: fullName || "",
        isAdmin: email === process.env.INITIAL_ADMIN_EMAIL
      });
      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      sendUserResponse(res, user, token);
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(500).json({ error: err.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", checkDb, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "User not found" });

      // Automatically promote specific user to admin if not already
      if (process.env.INITIAL_ADMIN_EMAIL && email === process.env.INITIAL_ADMIN_EMAIL && !user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      sendUserResponse(res, user, token);
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message || "Login failed" });
    }
  });

  app.post("/api/auth/forgot-password", checkDb, async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.json({ message: "If an account exists, a reset link has been sent." });
      }

      // Generate a simple token (in real app, use something secure and save to DB)
      const token = jwt.sign({ userId: user._id, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
      
      // In a real app, send an email. For now, we'll log the link to the console for the developer.
      const resetLink = `${req.get('origin')}/reset-password/${token}`;
      console.log(`\n[AUTH] PASSWORD RESET LINK FOR ${email}:`);
      console.log(resetLink);
      console.log(`\n`);
      
      res.json({ message: "If an account exists, a reset link has been sent. Check the server console for the link." });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", checkDb, async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ error: "Token and password are required" });

      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'reset') throw new Error("Invalid token type");

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: "Invalid or expired token" });
    }
  });

  // --- API MIDDLEWARE ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = decoded;
      next();
    });
  };

  // --- DATA ROUTES ---
  app.get("/api/resumes", authenticate, checkDb, async (req: any, res) => {
    try {
      const resumes = await Resume.find({ userId: req.user.userId }).sort({ createdAt: -1 });
      res.json(resumes);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch resumes" });
    }
  });

  app.post("/api/resumes", authenticate, checkDb, async (req: any, res) => {
    try {
      const resume = new Resume({ ...req.body, userId: req.user.userId });
      await resume.save();
      res.json(resume);
    } catch (err) {
      res.status(500).json({ error: "Failed to create resume" });
    }
  });

  app.get("/api/user/profile", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/user/profile", authenticate, checkDb, async (req: any, res) => {
    try {
      const { fullName, email, phone, location, targetRole, skills, preferredModel, avatarDataUrl } = req.body;
      const currentUser = await User.findById(req.user.userId);
      if (!currentUser) return res.status(404).json({ error: "User not found" });

      if (email && email !== currentUser.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
        if (existingUser) return res.status(400).json({ error: "Email is already in use" });
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { fullName, email, phone, location, targetRole, skills, preferredModel, avatarDataUrl },
        { new: true, runValidators: true }
      ).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.put("/api/user/password", authenticate, checkDb, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password are required" });
      if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });

      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: "Current password is incorrect" });

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.get("/api/interviews", authenticate, checkDb, async (req: any, res) => {
    try {
      const interviews = await Interview.find({ userId: req.user.userId }).sort({ createdAt: -1 });
      res.json(interviews);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews", authenticate, checkDb, async (req: any, res) => {
    try {
      const interview = new Interview({ ...req.body, userId: req.user.userId });
      await interview.save();
      res.json(interview);
    } catch (err) {
      res.status(500).json({ error: "Failed to create interview" });
    }
  });

  app.post("/api/leads", checkDb, async (req, res) => {
    try {
      const lead = new Lead(req.body);
      await lead.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/company-insights/trends", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === "true";
      const snapshot = await refreshCompanyTrendSnapshot(forceRefresh);

      res.json(snapshot);
    } catch (err) {
      console.error("Company trend snapshot error:", err);
      res.status(500).json({ error: "Failed to load company trend snapshot" });
    }
  });

  // Skills Lab Results
  app.get("/api/skills-lab", authenticate, checkDb, async (req: any, res) => {
    try {
      const results = await SkillsLabResult.findOne({ userId: req.user.userId }).sort({ createdAt: -1 });
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch skills lab results" });
    }
  });

  app.post("/api/skills-lab", authenticate, checkDb, async (req: any, res) => {
    try {
      const result = new SkillsLabResult({ ...req.body, userId: req.user.userId });
      await result.save();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to save skills lab result" });
    }
  });

  // Career Path Results
  app.get("/api/career-path", authenticate, checkDb, async (req: any, res) => {
    try {
      const results = await CareerPathResult.findOne({ userId: req.user.userId }).sort({ createdAt: -1 });
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch career path results" });
    }
  });

  app.post("/api/career-path", authenticate, checkDb, async (req: any, res) => {
    try {
      const result = new CareerPathResult({ ...req.body, userId: req.user.userId });
      await result.save();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to save career path result" });
    }
  });

  // Enrollments
  app.get("/api/enrollments", authenticate, checkDb, async (req: any, res) => {
    try {
      const enrollments = await Enrollment.find({ userId: req.user.userId });
      res.json(enrollments);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/enrollments", authenticate, checkDb, async (req: any, res) => {
    try {
      const { courseId, courseTitle } = req.body;
      const enrollment = await Enrollment.findOneAndUpdate(
        { userId: req.user.userId, courseId },
        { courseTitle, enrolledAt: new Date() },
        { upsert: true, new: true }
      );
      res.json(enrollment);
    } catch (err) {
      res.status(500).json({ error: "Failed to enroll in course" });
    }
  });

  app.patch("/api/enrollments/:courseId", authenticate, checkDb, async (req: any, res) => {
    try {
      const { progress, status, completedModules } = req.body;
      const enrollment = await Enrollment.findOneAndUpdate(
        { userId: req.user.userId, courseId: req.params.courseId },
        { progress, status, completedModules },
        { new: true }
      );
      res.json(enrollment);
    } catch (err) {
      res.status(500).json({ error: "Failed to update enrollment" });
    }
  });

  // --- ADMIN ROUTES ---
  app.get("/api/admin/stats", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const [userCount, resumeCount, interviewCount, leadCount] = await Promise.all([
        User.countDocuments(),
        Resume.countDocuments(),
        Interview.countDocuments(),
        Lead.countDocuments()
      ]);
      res.json({ userCount, resumeCount, interviewCount, leadCount });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, select: '-password' });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      
      if (req.params.id === req.user.userId) {
        return res.status(400).json({ error: "You cannot delete your own admin account" });
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/leads", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const leads = await Lead.find().sort({ createdAt: -1 });
      res.json(leads);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.patch("/api/admin/leads/:id", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(lead);
    } catch (err) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/admin/leads/:id", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      await Lead.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  app.post("/api/admin/leads/:id/reply", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: "Reply message is required" });

      const lead = await Lead.findByIdAndUpdate(req.params.id, { 
        replyMessage: message,
        repliedAt: new Date(),
        status: 'contacted'
      }, { new: true });

      console.log(`[EMAIL] Reply sent to ${lead?.email}: ${message}`);
      res.json(lead);
    } catch (err) {
      res.status(500).json({ error: "Failed to send reply" });
    }
  });

  app.get("/api/admin/campaigns", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const campaigns = await Campaign.find().sort({ createdAt: -1 });
      res.json(campaigns);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/admin/campaigns", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const campaign = new Campaign({ ...req.body, createdBy: req.user.userId });
      await campaign.save();
      res.json(campaign);
    } catch (err) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.delete("/api/admin/campaigns/:id", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      await Campaign.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.get("/api/admin/templates", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const templates = await EmailTemplate.find().sort({ updatedAt: -1 });
      res.json(templates);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/admin/templates", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const template = new EmailTemplate({ ...req.body, lastEditedBy: req.user.userId });
      await template.save();
      res.json(template);
    } catch (err) {
      res.status(500).json({ error: "Failed to save template" });
    }
  });

  app.patch("/api/admin/templates/:id", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const template = await EmailTemplate.findByIdAndUpdate(req.params.id, { 
        ...req.body, 
        lastEditedBy: req.user.userId,
        updatedAt: new Date()
      }, { new: true });
      res.json(template);
    } catch (err) {
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/admin/templates/:id", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      await EmailTemplate.findByIdAndDelete(req.params.id);
      res.json({ message: "Template deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.get("/api/admin/settings", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      let settings = await SettingsModel.findOne();
      if (!settings) {
        settings = new SettingsModel({});
        await settings.save();
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", authenticate, checkDb, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });
      const settings = await SettingsModel.findOneAndUpdate({}, req.body, { upsert: true, new: true });
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: mongoose.connection.readyState === 1 });
  });

  // Handling 404 for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Serving Web App
  if (process.env.NODE_ENV !== "production") {
    console.log(">>> Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    let distExists = false;

    try {
      await fs.access(distPath);
      distExists = true;
    } catch (err) {
      console.warn(`>>> No dist folder found at ${distPath}; backend will run API-only.`);
    }

    if (distExists) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Start Server Listener
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> Server is ACTIVE on port ${PORT}`);
    console.log(`>>> Environment: ${process.env.NODE_ENV || 'development'}`);
    startCompanyTrendParser();
    
    // Non-blocking MongoDB Connection
    if (MONGODB_URI && (MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://"))) {
      console.log(">>> Connecting to MongoDB Atlas...");
      mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
        .then(async () => {
          console.log(">>> SUCCESS: Connected to MongoDB Atlas");
          
          // --- ADMIN INITIALIZATION ---
          try {
            const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
            const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

            if (!adminEmail || !adminPassword) {
              console.warn(">>> WARNING: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD not set in .env. Initial admin setup skipped.");
            } else {
              const hashedPassword = await bcrypt.hash(adminPassword, 10);
              
              let admin = await User.findOne({ email: adminEmail });
              if (admin) {
                admin.password = hashedPassword;
                admin.isAdmin = true;
                await admin.save();
                console.log(`[AUTH] Admin user ${adminEmail} updated successfully.`);
              } else {
                admin = new User({
                  email: adminEmail,
                  password: hashedPassword,
                  fullName: "Platform Admin",
                  isAdmin: true
                });
                await admin.save();
                console.log(`[AUTH] Initial admin user ${adminEmail} created successfully.`);
              }
            }

            // --- SEED EMAIL TEMPLATES ---
            const templateCount = await EmailTemplate.countDocuments();
            if (templateCount === 0) {
              const defaultTemplates = [
                {
                  name: "Welcome Onboard",
                  subject: "Welcome to RKS - Let's accelerate your career!",
                  body: "Hello {{name}},\n\nWelcome to RKS! We are thrilled to have you part of our community. Explore our career tools and AI resume analyzer to get started.\n\nBest,\nThe RKS Team",
                  category: "onboarding"
                },
                {
                  name: "Inquiry Reply",
                  subject: "Re: Your message to RKS Support",
                  body: "Hi,\n\nThanks for reaching out! We received your message and our team is looking into it. We'll get back to you within 24 hours.\n\nRegards,\nRKS Team",
                  category: "support"
                }
              ];
              await EmailTemplate.insertMany(defaultTemplates);
              console.log("[SEED] Initial email templates created.");
            }

            // --- SEED INITIAL CAMPAIGN ---
            const campaignCount = await Campaign.countDocuments();
            if (campaignCount === 0) {
              await Campaign.create({
                title: "Platform Launch Announcement",
                subject: "RKS is now live! 🚀",
                content: "We're excited to announce that RKS is officially open to all users. Check out our new AI-powered career growth platform.",
                status: "sent",
                recipientsCount: 1250,
                sentAt: new Date()
              });
              console.log("[SEED] Initial campaign created.");
            }
          } catch (err) {
            console.error("Initialization error:", err);
          }
        })
        .catch(err => {
          console.error(">>> ERROR: MongoDB connection failed.");
          console.error(">>> PLEASE CHECK: Is your IP whitelisted in MongoDB Atlas? (Set 0.0.0.0/0)");
          console.error(err.message);
        });
    } else {
      console.warn(">>> WARNING: MONGODB_URI not found or invalid format.");
    }
  });
}

startServer();
