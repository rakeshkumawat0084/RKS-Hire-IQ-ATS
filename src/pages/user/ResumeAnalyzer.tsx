import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp, Search, CheckCircle2, AlertCircle, RefreshCcw, Zap,
  TrendingUp, Building2, Palette, Lightbulb, BarChart3,
  AlertTriangle, Tag, Globe, X, FileText, Image as ImageIcon, Brain
} from 'lucide-react';
import { analyzeResumeAdvanced, AdvancedResumeAnalysis } from '../../services/aiService';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { useResumeStore } from '../../store';
import { extractTextFromFile } from '../../lib/fileParser';

const GRADE_COLOR: Record<string, string> = {
  'A+': 'text-emerald-600',
  A: 'text-green-600',
  B: 'text-blue-600',
  C: 'text-amber-600',
  D: 'text-orange-600',
  F: 'text-red-600'
};

const STAGE_LABELS = [
  'Parsing resume...',
  'Searching live market data...',
  'Scoring ATS compliance...',
  'Identifying target companies...',
  'Generating career advice...',
];

const supportedFormats = 'PDF, DOCX, TXT, PNG, JPG';

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : fallback;
};

const toText = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

const toTextArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(item => toText(item)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/\n|;|,(?=\s*[A-Z0-9])/)
      .map(item => item.replace(/^[-*\d.)\s]+/, '').trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeAnalysis = (raw: AdvancedResumeAnalysis): AdvancedResumeAnalysis => {
  const data = raw as any;
  const sections = data?.atsSections || {};

  return {
    atsScore: toNumber(data?.atsScore),
    atsGrade: toText(data?.atsGrade, 'C'),
    percentileRank: toText(data?.percentileRank, 'Benchmark unavailable'),
    executiveSummary: toText(data?.executiveSummary, 'Analysis completed, but the AI did not return a summary.'),
    atsSections: {
      formatting: toNumber(sections.formatting),
      keywords: toNumber(sections.keywords),
      experience: toNumber(sections.experience),
      skills: toNumber(sections.skills),
      education: toNumber(sections.education),
      impact: toNumber(sections.impact),
    },
    strengths: toTextArray(data?.strengths),
    improvements: toTextArray(data?.improvements),
    missingKeywords: toTextArray(data?.missingKeywords),
    targetCompanies: Array.isArray(data?.targetCompanies)
      ? data.targetCompanies.map((company: any) => ({
          name: toText(company?.name, 'Company'),
          matchScore: toNumber(company?.matchScore),
          reason: toText(company?.reason, 'Relevant match based on resume profile.'),
          hiringStatus: toText(company?.hiringStatus, 'Review roles'),
        }))
      : [],
    marketTrends: Array.isArray(data?.marketTrends)
      ? data.marketTrends.map((trend: any) => ({
          skill: toText(trend?.skill, 'Skill'),
          trend: toText(trend?.trend, 'Market demand is changing.'),
          demand: toText(trend?.demand, 'Moderate'),
        }))
      : [],
    careerAdvice: toTextArray(data?.careerAdvice),
    colorAdvice: {
      recommended: toText(data?.colorAdvice?.recommended, 'Clean professional palette'),
      reason: toText(data?.colorAdvice?.reason, 'Use a restrained layout with strong contrast.'),
      avoid: toText(data?.colorAdvice?.avoid, 'Avoid low contrast and decorative clutter.'),
    },
    industryBenchmark: toText(data?.industryBenchmark, 'Industry benchmark unavailable'),
    immediateActions: toTextArray(data?.immediateActions).slice(0, 3),
  };
};

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AdvancedResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [useStored, setUseStored] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { resumeText, hasResume, setResumeData } = useResumeStore();

  const cycleStages = () => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i < STAGE_LABELS.length) setStage(i);
      else clearInterval(id);
    }, 2200);
    return id;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResults(null);
      setError(null);
      setUseStored(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setStage(0);
    const stageTimer = cycleStages();

    try {
      let text = '';
      let imageBase64: string | undefined;
      let imageMime: string | undefined;

      if (useStored && hasResume) {
        text = resumeText;
      } else if (file) {
        const isImage = file.type.startsWith('image/');
        if (isImage) {
          imageMime = file.type;
          imageBase64 = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res((reader.result as string).split(',')[1]);
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });
        } else {
          text = await extractTextFromFile(file);
          if (!text || text.trim().length < 50) {
            throw new Error('Could not extract enough text. Try uploading a clearer PDF/DOCX/TXT, or use PNG/JPG for scanned resumes.');
          }
          setResumeData(text);
        }
      } else {
        throw new Error('Please upload a file or use your saved resume.');
      }

      const data = await analyzeResumeAdvanced(text, imageBase64, imageMime);
      setResults(normalizeAnalysis(data));
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(stageTimer);
      setIsAnalyzing(false);
    }
  };

  const ScoreBar = ({ label, val }: { label: string; val: number }) => (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="capitalize font-semibold text-slate-500">{label}</span>
        <span className="font-black text-slate-950">{val}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${val >= 75 ? 'bg-emerald-500' : val >= 50 ? 'bg-indigo-500' : 'bg-orange-500'}`}
        />
      </div>
    </div>
  );

  const AnalysisCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 pt-2">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 shadow-[0_30px_120px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.24),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(99,102,241,0.24),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.18),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-50" />

        <div className="relative grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 p-4 md:p-6 lg:p-8 items-start">
        <aside className="space-y-5">
          <header className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">
              <Brain size={14} />
              Career Intelligence
            </div>
            <div>
              <h1 className="mt-5 text-3xl md:text-4xl font-serif font-bold leading-[0.95] tracking-normal text-white">
                Analyze your resume with market context.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
                ATS scoring, keyword gaps, company fit, design feedback, and practical next actions in one clean report.
              </p>
            </div>
          </header>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-2xl space-y-4">
            {hasResume && (
              <button
                type="button"
                onClick={() => { setUseStored(!useStored); if (!useStored) setFile(null); }}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  useStored ? 'border-cyan-300/50 bg-cyan-300/10' : 'border-white/10 bg-slate-950/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${useStored ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">Use saved resume</p>
                    <p className="text-[11px] text-slate-400">From Resume Maker</p>
                  </div>
                  {useStored && <CheckCircle2 size={18} className="text-cyan-300" />}
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`w-full rounded-[1.5rem] border-2 border-dashed p-8 text-center transition-all ${
                file ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/15 bg-slate-950/35 hover:border-cyan-300/45 hover:bg-white/10'
              }`}
            >
              <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={handleFile} />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
                {file?.type.startsWith('image/') ? <ImageIcon size={26} /> : <FileUp size={26} />}
              </div>
              {file ? (
                <>
                  <p className="truncate text-sm font-black text-white">{file.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{(file.size / 1024).toFixed(0)} KB ready</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-white">Upload resume</p>
                  <p className="mt-1 text-[11px] text-slate-400">{supportedFormats}</p>
                </>
              )}
            </button>

            <button
              onClick={runAnalysis}
              disabled={(!file && !useStored) || isAnalyzing}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 px-5 py-4 text-sm font-black text-white shadow-[0_18px_55px_rgba(99,102,241,0.35)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600 disabled:text-slate-300 disabled:shadow-none flex items-center justify-center gap-3"
            >
              {isAnalyzing ? <RefreshCcw className="animate-spin" size={18} /> : <Zap size={18} className="fill-current" />}
              {isAnalyzing ? STAGE_LABELS[stage] : 'Analyze Resume'}
            </button>

            {error && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-xs text-red-200 flex gap-3 items-start">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {!results && !isAnalyzing && (
            <div className="grid grid-cols-1 gap-2">
              {['Google Search grounding', 'Image and scan OCR', 'Live company targets', 'Color and design advice', '2025 market trends'].map(f => (
                <div key={f} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-semibold text-slate-300 backdrop-blur-xl">
                  {f}
                </div>
              ))}
            </div>
          )}
        </aside>

        <main>
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="min-h-[620px] rounded-[1.75rem] border border-cyan-300/20 bg-slate-950/40 flex flex-col items-center justify-center text-center p-10 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-cyan-300/15 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-t-4 border-cyan-300 animate-spin" />
                  <Globe className="absolute inset-0 m-auto text-cyan-200" size={28} />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-white">{STAGE_LABELS[stage]}</p>
                <p className="mt-2 text-sm text-slate-400">Gemini analysis with live market context</p>
              </motion.div>
            ) : results ? (
              <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <AnalysisCard className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="relative shrink-0">
                    <CircularProgress percentage={results.atsScore} size={128} strokeWidth={10} color="#4f46e5" />
                    <div className={`absolute inset-0 flex items-center justify-center text-3xl font-black ${GRADE_COLOR[results.atsGrade] || 'text-indigo-600'}`}>
                      {results.atsGrade}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-600">ATS score</p>
                    <div className="mt-1 text-5xl font-black text-slate-950">{results.atsScore}<span className="text-2xl text-slate-400">%</span></div>
                    <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{results.percentileRank}</p>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">{results.executiveSummary}</p>
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{results.industryBenchmark}</p>
                  </div>
                </AnalysisCard>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-950"><BarChart3 size={16} className="text-indigo-600" /> ATS Breakdown</h3>
                    {Object.entries(results.atsSections || {}).map(([k, v]) => <ScoreBar key={k} label={k} val={v as number} />)}
                  </AnalysisCard>

                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-emerald-600"><CheckCircle2 size={16} /> Strengths</h3>
                    <ul className="space-y-2">
                      {results.strengths.length ? results.strengths.map((s, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-emerald-600 shrink-0">✓</span>{s}</li>) : <li className="text-sm text-slate-500">No strengths returned.</li>}
                    </ul>
                  </AnalysisCard>

                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-orange-600"><AlertTriangle size={16} /> Improvements</h3>
                    <ul className="space-y-2">
                      {results.improvements.length ? results.improvements.map((s, i) => <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-orange-600 shrink-0">!</span>{s}</li>) : <li className="text-sm text-slate-500">No improvements returned.</li>}
                    </ul>
                  </AnalysisCard>

                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-950"><Tag size={16} className="text-indigo-600" /> Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.missingKeywords.length ? results.missingKeywords.map((k, i) => (
                        <button key={i} onClick={() => navigator.clipboard.writeText(k)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-600 transition-all hover:border-indigo-300 hover:text-indigo-600"
                          title="Click to copy">{k}</button>
                      )) : <span className="text-sm text-slate-500">No missing keywords returned.</span>}
                    </div>
                  </AnalysisCard>

                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-950"><Building2 size={16} className="text-indigo-600" /> Target Companies</h3>
                    <div className="space-y-2">
                      {results.targetCompanies.length ? results.targetCompanies.map((c, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black shrink-0">{c.name?.[0] || '?'}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm text-slate-950">{c.name}</span>
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-600">{c.matchScore}% match</span>
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">{c.hiringStatus}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{c.reason}</p>
                          </div>
                        </div>
                      )) : <p className="text-sm text-slate-500">No target companies returned.</p>}
                    </div>
                  </AnalysisCard>

                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-950"><TrendingUp size={16} className="text-indigo-600" /> Market Trends</h3>
                    <div className="space-y-2">
                      {results.marketTrends.length ? results.marketTrends.map((t, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">{t.skill}</p>
                            <p className="text-xs text-slate-500">{t.trend}</p>
                          </div>
                          <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black text-white">{t.demand}</span>
                        </div>
                      )) : <p className="text-sm text-slate-500">No market trends returned.</p>}
                    </div>
                  </AnalysisCard>

                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-violet-600"><Palette size={16} /> Design Advice</h3>
                    <p className="text-sm text-slate-600"><span className="font-black text-slate-950">Recommended:</span> {results.colorAdvice?.recommended}</p>
                    <p className="text-sm text-slate-600">{results.colorAdvice?.reason}</p>
                    <p className="flex items-center gap-2 text-sm text-red-600"><X size={14} /> {results.colorAdvice?.avoid}</p>
                  </AnalysisCard>

                  <AnalysisCard className="space-y-3">
                    <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-950"><Lightbulb size={16} className="text-amber-500" /> Career Advice</h3>
                    <ol className="space-y-2">
                      {results.careerAdvice.length ? results.careerAdvice.map((a, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                          <span className="text-indigo-600 font-black shrink-0">{i + 1}.</span>{a}
                        </li>
                      )) : <li className="text-sm text-slate-500">No career advice returned.</li>}
                    </ol>
                  </AnalysisCard>
                </div>

                <AnalysisCard className="space-y-4 bg-amber-50 border-amber-200">
                  <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-amber-700"><Zap size={16} className="fill-current" /> Immediate Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {results.immediateActions.length ? results.immediateActions.map((a, i) => (
                      <div key={i} className="rounded-xl border border-amber-200 bg-white p-4">
                        <span className="text-lg font-black text-amber-600">{i + 1}</span>
                        <p className="mt-2 text-sm text-slate-600">{a}</p>
                      </div>
                    )) : <p className="text-sm text-slate-500">No immediate actions returned.</p>}
                  </div>
                </AnalysisCard>

                <button onClick={() => { setResults(null); setFile(null); setUseStored(false); }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 flex items-center justify-center gap-2">
                  <RefreshCcw size={14} /> Analyze Another Resume
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative min-h-[620px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/38 flex flex-col items-center justify-center text-center p-10 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_64%_62%,rgba(168,85,247,0.14),transparent_30%)]" />
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_45px_rgba(34,211,238,0.18)]">
                  <Search size={34} className="text-cyan-200" />
                </div>
                <h2 className="relative text-2xl font-black text-white">Your report appears here.</h2>
                <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
                  Upload a resume or use the one you made earlier, then run the analysis.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        </div>
      </div>
    </div>
  );
}
