import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// ─── Model cascade: tries fastest first, falls back on 429 quota errors ───────
export const AI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", hint: "Best balance" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", hint: "Fastest" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", hint: "Highest precision" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", hint: "Legacy stable" },
] as const;

const MODELS: string[] = AI_MODELS.map(model => model.id);
const MODEL_STORAGE_KEY = "rks-preferred-ai-model";

export const getPreferredAIModel = () => {
  if (typeof localStorage === "undefined") return MODELS[0];
  const saved = localStorage.getItem(MODEL_STORAGE_KEY);
  return saved && MODELS.includes(saved) ? saved : MODELS[0];
};

export const setPreferredAIModel = (model: string) => {
  if (typeof localStorage === "undefined") return;
  if (MODELS.includes(model)) localStorage.setItem(MODEL_STORAGE_KEY, model);
};

async function generateWithFallback(params: Parameters<typeof ai.models.generateContent>[0]): Promise<ReturnType<typeof ai.models.generateContent>> {
  let lastError: any;
  const preferredModel = getPreferredAIModel();
  const orderedModels = [preferredModel, ...MODELS.filter(model => model !== preferredModel)];
  for (const model of orderedModels) {
    try {
      return await ai.models.generateContent({ ...params, model });
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
        console.warn(`[AI] Model ${model} unavailable, trying next fallback...`);
        continue; // try next model
      }
      throw err; // non-quota error → rethrow immediately
    }
  }
  throw new Error('⚠️ API quota exceeded on all models. Please wait a few minutes and try again, or upgrade your Gemini API plan at https://ai.google.dev');
}

// Friendly error parser — converts raw Gemini JSON errors into readable messages
export function parseAIError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('429') || raw.includes('quota') || raw.includes('RESOURCE_EXHAUSTED')) {
    return '⚠️ Gemini API quota exceeded. Please wait a few minutes and try again. (Free tier: 20 req/day per model)';
  }
  if (raw.includes('404') || raw.includes('not found') || raw.includes('not supported')) {
    return 'The selected Gemini model is no longer available. The app has been updated to use current Gemini models.';
  }
  if (raw.includes('API_KEY') || raw.includes('API key')) return '🔑 Invalid Gemini API Key. Check your .env file.';
  if (raw.includes('SAFETY')) return '🛡️ Content was blocked by safety filters. Try rephrasing your input.';
  if (raw.includes('network') || raw.includes('fetch')) return '🌐 Network error. Check your internet connection.';
  // Return first 120 chars of unknown errors
  return raw.length > 120 ? raw.substring(0, 120) + '…' : raw;
}



export interface ResumeAnalysisResult {
  score: number;
  summary: string;
  sections: {
    formatting: number;
    experience: number;
    skills: number;
    education: number;
  };
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysisResult> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
    throw new Error("Gemini API Key is not configured. Please add it to the environment variables.");
  }

  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the following resume text for ATS compatibility and quality.
    Provide a score out of 100, a summary, quantitative scores (0-100) for formatting, experience, skills, and education, strengths, improvements, and missing mandatory industry keywords.
    
    Resume Text:
    ${resumeText}
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          sections: {
            type: Type.OBJECT,
            properties: {
              formatting: { type: Type.NUMBER },
              experience: { type: Type.NUMBER },
              skills: { type: Type.NUMBER },
              education: { type: Type.NUMBER }
            },
            required: ["formatting", "experience", "skills", "education"]
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "summary", "sections", "strengths", "improvements", "missingKeywords"]
      }
    }
  });

  let text = response.text || "";
  
  // Robust JSON parsing: AI sometimes wraps JSON in markdown blocks
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  try {
    return JSON.parse(text) as ResumeAnalysisResult;
  } catch (parseError) {
    console.error("AI returned invalid JSON:", text);
    throw new Error("The AI response was not in a valid format. Please try again.");
  }
};

// ─── ADVANCED RESUME INTELLIGENCE ANALYZER ─────────────────────────────────────
// Uses Gemini 2.5 Flash + Google Search grounding for live 2025 market data.
// Supports plain text (PDF/DOCX) and base64 image (PNG/JPG scanned resumes).
export interface AdvancedResumeAnalysis {
  atsScore: number;
  atsGrade: string;
  percentileRank: string;
  executiveSummary: string;
  atsSections: {
    formatting: number;
    keywords: number;
    experience: number;
    skills: number;
    education: number;
    impact: number;
  };
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  targetCompanies: Array<{
    name: string;
    matchScore: number;
    reason: string;
    hiringStatus: string;
  }>;
  marketTrends: Array<{
    skill: string;
    trend: string;
    demand: string;
  }>;
  careerAdvice: string[];
  colorAdvice: {
    recommended: string;
    reason: string;
    avoid: string;
  };
  industryBenchmark: string;
  immediateActions: string[];
}

export const analyzeResumeAdvanced = async (
  resumeText: string,
  imageBase64?: string,
  mimeType?: string
): Promise<AdvancedResumeAnalysis> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'undefined') {
    throw new Error("Gemini API Key is not configured.");
  }

  const model = "gemini-2.5-flash";

  const systemPrompt = `You are an elite 2025 Career Intelligence AI — a combination of senior ATS engineer, Fortune 500 recruiter, and live market analyst.

Perform a comprehensive multi-dimensional analysis of the resume using:
1. Deep ATS calibration (parse, score, grade — like Workday, Greenhouse, Lever ATS systems)
2. Live 2025 market data via Google Search — find trending skills on LinkedIn, Reddit, job boards
3. Real company intelligence — which companies are actively hiring for this profile in 2025
4. Actionable career advice based on current industry standards

Be brutally honest and data-driven. Calibrate scores properly (most resumes score 50-75, not 85+).
Extract: role/title, years of experience, skills, education, and achievements from the resume.

Return ONLY a valid JSON object. No markdown, no explanation. Just pure JSON.`;

  const userPrompt = `${imageBase64 ? 'This resume was uploaded as an image. Read ALL text from the image carefully.' : ''}

Resume Content:
${resumeText || '[See attached image]'}

Search the web for:
- Top companies hiring for this person's role in 2025
- Most in-demand skills in this industry right now
- Current ATS best practices 2025
- Career growth trends for this role

Return a JSON with these exact keys: atsScore, atsGrade, percentileRank, executiveSummary, atsSections (object with: formatting, keywords, experience, skills, education, impact), strengths (array), improvements (array), missingKeywords (array), targetCompanies (array of: name, matchScore, reason, hiringStatus), marketTrends (array of: skill, trend, demand), careerAdvice (array), colorAdvice (object with: recommended, reason, avoid), industryBenchmark, immediateActions (array of top 3 strings).`;

  const contents: any[] = [];
  
  if (imageBase64 && mimeType) {
    contents.push({
      role: "user",
      parts: [
        { text: userPrompt },
        { inlineData: { mimeType, data: imageBase64 } }
      ]
    });
  } else {
    contents.push({ role: "user", parts: [{ text: userPrompt }] });
  }

  const response = await generateWithFallback({
    model,
    contents,
    config: {
      systemInstruction: systemPrompt,
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
    }
  });

  let rawText = response.text || "";
  // Strip markdown fences if present
  rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return valid JSON analysis.");
  
  try {
    return JSON.parse(jsonMatch[0]) as AdvancedResumeAnalysis;
  } catch {
    const fixPrompt = `Fix this broken JSON and return ONLY valid JSON with all required fields. If a value is missing, use a sensible default:\n${jsonMatch[0].substring(0, 4000)}`;
    const fixResponse = await generateWithFallback({ model, contents: fixPrompt, config: { temperature: 0 } });
    const fixRaw = (fixResponse.text || "").replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const fixText = fixRaw.match(/\{[\s\S]*\}/);
    if (fixText) return JSON.parse(fixText[0]) as AdvancedResumeAnalysis;
    throw new Error("Could not parse AI analysis. Please try again.");
  }
};



export const getInterviewQuestions = async (role: string, difficulty: string, count: number, company?: string) => {
  const model = "gemini-2.5-flash";
  const companyContext = company ? ` at ${company}` : "";
  const prompt = `Generate ${count} interview questions for a ${role} position${companyContext} at ${difficulty} difficulty level. Return only a JSON array of objects with a "question" field.`;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING }
          },
          required: ["question"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export interface InterviewEvaluation {
  overallScore: number;
  feedback: string;
  questionAnalysis: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
    betterAlternative: string;
  }[];
  strengths: string[];
  weaknesses: string[];
}

export const evaluateInterview = async (role: string, results: { question: string, answer: string }[]): Promise<InterviewEvaluation> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Conduct a detailed evaluation of an interview for a ${role} role.
    Analyze each question and answer pair.
    Provide an overall score (0-100), general feedback, strengths, weaknesses, and a specific analysis for each question including a better alternative response.
    
    Session Data:
    ${JSON.stringify(results)}
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          questionAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING },
                betterAlternative: { type: Type.STRING }
              },
              required: ["question", "answer", "score", "feedback", "betterAlternative"]
            }
          }
        },
        required: ["overallScore", "feedback", "strengths", "weaknesses", "questionAnalysis"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as InterviewEvaluation;
};

export interface RoadmapOutput {
  user_analysis: {
    level: 'beginner' | 'intermediate' | 'advanced';
    suggested_domain: string;
    reason: string;
  };
  roadmap: {
    phase: string;
    duration: string;
    topics: string[];
    skills_learned: string[];
    projects: string[];
    resources: string[];
  }[];
  career_outcome: {
    job_roles: string[];
    freelancing_opportunities: string[];
    expected_salary_india: string;
    future_scope: string;
  };
  ai_next_step_suggestions: string[];
  admin_data: {
    roadmap_id: string;
    category: string;
    version: string;
    is_personalized: boolean;
  };
}

export interface CareerResult {
  title: string;
  why_this_career: string;
  roadmap: {
    beginner_level: string[];
    intermediate_level: string[];
    advanced_level: string[];
  };
  required_skills: string[];
  free_resources: { name: string; url: string }[];
  youtube_resources: { title: string; channelName: string; url: string }[];
  salary_in_india: string;
  job_opportunities: string[];
  future_scope: string;
}

export interface CareerPathOutput {
  user_id: string;
  education: string;
  skills: string[];
  interests: string[];
  location: string;
  generated_at: string;
  careers: CareerResult[];
  admin_meta: {
    status: string;
    version: string;
    saved_to_admin_panel: boolean;
  };
}

export const generateRoadmap = async (userData: {
  education: string;
  skills: string;
  interests: string;
  location: string;
  goal: string;
}): Promise<RoadmapOutput> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are a Senior AI Learning Architect and Career Roadmap Designer.
    Your task is to generate a highly accurate, personalized, and industry-standard learning roadmap for users based on their profile.

    ========================
    USER INPUT
    ========================
    - User Education: ${userData.education}
    - Current Skills: ${userData.skills}
    - Interests: ${userData.interests}
    - Location: ${userData.location}
    - Target Goal (if any): ${userData.goal}

    ========================
    YOUR OBJECTIVE
    ========================
    Create a COMPLETE, REAL-WORLD LEARNING ROADMAP that is industry relevant (2025 standards), job-oriented, step-by-step, personalized, and progressive.

    Return ONLY a JSON object following the schema provided.
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          user_analysis: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING, enum: ["beginner", "intermediate", "advanced"] },
              suggested_domain: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["level", "suggested_domain", "reason"]
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                duration: { type: Type.STRING },
                topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                skills_learned: { type: Type.ARRAY, items: { type: Type.STRING } },
                projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["phase", "duration", "topics", "skills_learned", "projects", "resources"]
            }
          },
          career_outcome: {
            type: Type.OBJECT,
            properties: {
              job_roles: { type: Type.ARRAY, items: { type: Type.STRING } },
              freelancing_opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              expected_salary_india: { type: Type.STRING },
              future_scope: { type: Type.STRING }
            },
            required: ["job_roles", "freelancing_opportunities", "expected_salary_india", "future_scope"]
          },
          ai_next_step_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          admin_data: {
            type: Type.OBJECT,
            properties: {
              roadmap_id: { type: Type.STRING },
              category: { type: Type.STRING },
              version: { type: Type.STRING },
              is_personalized: { type: Type.BOOLEAN }
            },
            required: ["roadmap_id", "category", "version", "is_personalized"]
          }
        },
        required: ["user_analysis", "roadmap", "career_outcome", "ai_next_step_suggestions", "admin_data"]
      }
    }
  });

  let text = response.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];

  return JSON.parse(text) as RoadmapOutput;
};

export const generateCareerPath = async (userData: {
  userId: string;
  education: string;
  skills: string;
  interests: string;
  location: string;
}): Promise<CareerPathOutput> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an advanced Career Guidance AI.
    Analyze the user profile and suggest exactly 3 best career options suited for the user.
    For each career, generate a complete roadmap from beginner to advanced level.
    Ensure suggestions are practical, job-oriented, and relevant to India.
    Include exactly 3 high-quality YouTube Video Tutorials (direct video links only, NOT channels).
    For each video, include: video title, channel name, and the direct YouTube URL.
    Include 3 free resources with real URLs (like MDN, freeCodeCamp, etc).

    USER INPUT DATA:
    - User ID: ${userData.userId}
    - Education: ${userData.education}
    - Skills: ${userData.skills}
    - Interests: ${userData.interests}
    - Location: ${userData.location}

    Return ONLY valid JSON according to the specified structure.
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          user_id: { type: Type.STRING },
          education: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          interests: { type: Type.ARRAY, items: { type: Type.STRING } },
          location: { type: Type.STRING },
          generated_at: { type: Type.STRING },
          careers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                why_this_career: { type: Type.STRING },
                roadmap: {
                  type: Type.OBJECT,
                  properties: {
                    beginner_level: { type: Type.ARRAY, items: { type: Type.STRING } },
                    intermediate_level: { type: Type.ARRAY, items: { type: Type.STRING } },
                    advanced_level: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["beginner_level", "intermediate_level", "advanced_level"]
                },
                required_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                free_resources: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["name", "url"]
                  }
                },
                youtube_resources: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      channelName: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "channelName", "url"]
                  }
                },
                salary_in_india: { type: Type.STRING },
                job_opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                future_scope: { type: Type.STRING }
              },
              required: ["title", "why_this_career", "roadmap", "required_skills", "free_resources", "youtube_resources", "salary_in_india", "job_opportunities", "future_scope"]
            }
          },
          admin_meta: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              version: { type: Type.STRING },
              saved_to_admin_panel: { type: Type.BOOLEAN }
            },
            required: ["status", "version", "saved_to_admin_panel"]
          }
        },
        required: ["user_id", "education", "skills", "interests", "location", "generated_at", "careers", "admin_meta"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as CareerPathOutput;
};

export interface LabExercise {
  mcqs: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  practicalTasks: {
    title: string;
    description: string;
    hints: string[];
    solutionSteps: string[];
  }[];
}

export interface LabExercise {
  mcqs: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  practicalTasks: {
    title: string;
    description: string;
    hints: string[];
    solutionSteps: string[];
  }[];
}

export const generateLabExercises = async (subject: string): Promise<LabExercise> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Generate a high-quality practice lab for the subject: "${subject}".
    Focus on skill development.
    
    Requirements:
    1. 5 Technical Multiple Choice Questions (MCQs) with 4 options and clear explanations.
    2. 3 Practical Exercises/Tasks that require hands-on implementation or problem-solving.
    
    Ensure the content is challenging but educational.
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mcqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          },
          practicalTasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hints: { type: Type.ARRAY, items: { type: Type.STRING } },
                solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "description", "hints", "solutionSteps"]
            }
          }
        },
        required: ["mcqs", "practicalTasks"]
      }
    }
  });

  let text = response.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) text = jsonMatch[0];

  return JSON.parse(text) as LabExercise;
};

export interface PolishedResume {
  fullName: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    links: string[];
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    school: string;
    degree: string;
    duration: string;
    details?: string;
  }[];
  skills: {
    category: string;
    list: string[];
  }[];
  certifications?: string[];
  projects?: {
    name: string;
    description: string;
    tech: string[];
  }[];
  photoUrl?: string;
}

export const generateResume = async (userData: any): Promise<PolishedResume> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Act as an elite executive recruiter and ATS-optimization expert for top-tier tech and Fortune 500 companies in 2025.
    Your goal is to rewrite the user's input data into an ultra-premium, job-ready resume in JSON format that passes strict Applicant Tracking Systems (ATS) and wows human hiring managers.
    
    CRITICAL RULES FOR 2025 ATS SUCCESS:
    1. STAR Method: Rewrite ALL experience bullet points using the STAR method (Situation, Task, Action, Result). 
    2. Quantify Achievements: Every bullet point MUST include specific metrics, percentages (%), dollar amounts ($), or time saved. If raw data lacks metrics, infer reasonable industry-standard improvements (e.g., "improved efficiency by 20%").
    3. Action Verbs: Start every single bullet point with a powerful action verb (e.g., Architected, Spearheaded, Optimized, Orchestrated). Do NOT use weak verbs like "Helped", "Worked on", or "Responsible for".
    4. Keyword Density: Naturally weave in modern hard skills and industry keywords relevant to their role to ensure ATS matching. Do not keyword stuff.
    5. Conciseness: Remove generic buzzwords. Keep the summary professional, engaging, and under 4 sentences.
    6. Strict Output: If a section is missing in the user data, skip it—do not hallucinate fake schools or jobs. Keep standard headers.

    User Input Data:
    ${JSON.stringify(userData)}
    
    Output strictly as structured JSON matching the requested schema:
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          contact: {
            type: Type.OBJECT,
            properties: {
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              links: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["email", "phone", "location", "links"]
          },
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                duration: { type: Type.STRING },
                highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["company", "role", "duration", "highlights"]
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                school: { type: Type.STRING },
                degree: { type: Type.STRING },
                duration: { type: Type.STRING },
                details: { type: Type.STRING }
              },
              required: ["school", "degree", "duration"]
            }
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                list: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["category", "list"]
            }
          },
          certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                tech: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "description", "tech"]
            }
          }
        },
        required: ["fullName", "contact", "summary", "experience", "education", "skills"]
      }
    }
  });

  let text = response.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];

  return JSON.parse(text) as PolishedResume;
};

export interface SkillsLabOutput {
  user_profile: {
    education: string;
    skills: string[];
    interests: string[];
    location: string;
  };
  recommended_courses: {
    course_id: string;
    title: string;
    category: string;
    level: string;
    duration: string;
    why_this_course: string;
    skills_gained: string[];
    prerequisites: string[];
    roadmap: {
      beginner: string[];
      intermediate: string[];
      advanced: string[];
    };
    projects: string[];
  }[];
  enrollment_model: {
    user_id: string;
    course_id: string;
    status: string;
    progress: number;
    completed_modules: string[];
  };
  progress_tracking: {
    lesson_progress: any[];
    completion_percentage: number;
  };
  certificate_system: {
    enabled: boolean;
    format: string;
    certificate_fields: string[];
  };
  admin_panel: {
    course_management: boolean;
    user_tracking: boolean;
    analytics: boolean;
  };
}

export const generateSkillsLab = async (userData: {
  education: string;
  skills: string;
  interests: string;
  location: string;
}): Promise<SkillsLabOutput> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are a Senior Full-Stack Architect and AI System Designer.
    Design and power a complete advanced "Skills Lab" learning platform.

    ========================
    USER CONTEXT (INPUT)
    ========================
    - User Profile:
      - Education: ${userData.education}
      - Skills: ${userData.skills}
      - Interests: ${userData.interests}
      - Location: ${userData.location}

    ========================
    YOUR TASK
    ========================
    Generate exactly 4 relevant courses for the user. Return data in the specified JSON structure.
    Include titles, roadmaps, and why each course is recommended.
    - Status for enrollment_model should be "available" (not yet enrolled by default in generation)
    - progress should be 0

    Return ONLY valid JSON.
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          user_profile: {
            type: Type.OBJECT,
            properties: {
              education: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              interests: { type: Type.ARRAY, items: { type: Type.STRING } },
              location: { type: Type.STRING }
            },
            required: ["education", "skills", "interests", "location"]
          },
          recommended_courses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                course_id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                level: { type: Type.STRING },
                duration: { type: Type.STRING },
                why_this_course: { type: Type.STRING },
                skills_gained: { type: Type.ARRAY, items: { type: Type.STRING } },
                prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                roadmap: {
                  type: Type.OBJECT,
                  properties: {
                    beginner: { type: Type.ARRAY, items: { type: Type.STRING } },
                    intermediate: { type: Type.ARRAY, items: { type: Type.STRING } },
                    advanced: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["beginner", "intermediate", "advanced"]
                },
                projects: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["course_id", "title", "category", "level", "duration", "why_this_course", "skills_gained", "prerequisites", "roadmap", "projects"]
            }
          },
          enrollment_model: {
            type: Type.OBJECT,
            properties: {
              user_id: { type: Type.STRING },
              course_id: { type: Type.STRING },
              status: { type: Type.STRING },
              progress: { type: Type.NUMBER },
              completed_modules: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["user_id", "course_id", "status", "progress", "completed_modules"]
          },
          progress_tracking: {
            type: Type.OBJECT,
            properties: {
              lesson_progress: { type: Type.ARRAY, items: { type: Type.STRING } },
              completion_percentage: { type: Type.NUMBER }
            },
            required: ["lesson_progress", "completion_percentage"]
          },
          certificate_system: {
            type: Type.OBJECT,
            properties: {
              enabled: { type: Type.BOOLEAN },
              format: { type: Type.STRING },
              certificate_fields: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["enabled", "format", "certificate_fields"]
          },
          admin_panel: {
            type: Type.OBJECT,
            properties: {
              course_management: { type: Type.BOOLEAN },
              user_tracking: { type: Type.BOOLEAN },
              analytics: { type: Type.BOOLEAN }
            },
            required: ["course_management", "user_tracking", "analytics"]
          }
        },
        required: ["user_profile", "recommended_courses", "enrollment_model", "progress_tracking", "certificate_system", "admin_panel"]
      }
    }
  });

  let text = response.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) text = jsonMatch[0];

  return JSON.parse(text) as SkillsLabOutput;
};

export const autofillResumeData = async (role: string): Promise<any> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Act as an industry expert and career coach.
    Generate a complete, highly professional dummy resume profile for a "${role}".
    
    The response must strictly follow this JSON structure:
    {
      "summary": "A powerful 3-4 sentence professional summary for this role.",
      "experience": [
        { "company": "Tech Corp (Example)", "role": "${role}", "duration": "2020 - Present", "description": "Developed key features..." },
        { "company": "Innovate LLC", "role": "Junior ${role}", "duration": "2018 - 2020", "description": "Assisted in building..." }
      ],
      "education": [
        { "school": "University of Technology", "degree": "Bachelors in Computer Science (or relevant degree)", "duration": "2014 - 2018", "details": "Graduated with Honors." }
      ],
      "skills": [
        { "category": "Technical Skills", "list": "Skill 1, Skill 2, Skill 3" },
        { "category": "Soft Skills", "list": "Leadership, Communication, Agile" }
      ]
    }
    
    Make the experience descriptions realistic and detailed using action verbs.
  `;

  const response = await generateWithFallback({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                duration: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["company", "role", "duration", "description"]
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                school: { type: Type.STRING },
                degree: { type: Type.STRING },
                duration: { type: Type.STRING },
                details: { type: Type.STRING }
              },
              required: ["school", "degree", "duration", "details"]
            }
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                list: { type: Type.STRING }
              },
              required: ["category", "list"]
            }
          }
        },
        required: ["summary", "experience", "education", "skills"]
      }
    }
  });

  let text = response.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];

  return JSON.parse(text);
};

