import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Play, 
  Mic, 
  Settings, 
  History,
  Timer as TimerIcon,
  ChevronRight,
  TrendingUp,
  Award,
  Loader2,
  CheckCircle2,
  XCircle,
  SkipForward,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Briefcase,
  BarChart,
  Layers,
  ChevronDown
} from 'lucide-react';
import { getInterviewQuestions, evaluateInterview, InterviewEvaluation } from '../../services/aiService';
import { useUserStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function MockInterview() {
  const location = useLocation();
  const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup');
  const [config, setConfig] = useState({
    role: location.state?.role || '',
    company: '',
    difficulty: 'Medium',
    count: 5
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const { user } = useUserStore();
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (step === 'interview' && questions[currentIndex]) {
      speak(questions[currentIndex].question);
    }
  }, [currentIndex, step, questions]);

  useEffect(() => {
    let timer: any;
    if (step === 'interview' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === 'interview') {
      nextQuestion();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setCurrentAnswer(prev => prev + ' ' + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const startInterview = async () => {
    if (!config.role) {
      alert("Please specify a target role.");
      return;
    }
    setLoading(true);
    try {
      const data = await getInterviewQuestions(config.role, config.difficulty, config.count, config.company);
      setQuestions(data);
      setAnswers([]);
      setCurrentIndex(0);
      setCurrentAnswer('');
      setTimeLeft(config.count * 120); // 2 minutes per question
      setStep('interview');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async (overrideAnswer?: string) => {
    const answerToStore = overrideAnswer !== undefined ? overrideAnswer : currentAnswer;
    const finalAnswers = [...answers, answerToStore];
    setAnswers(finalAnswers);
    setCurrentAnswer('');
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishInterview(finalAnswers);
    }
  };

  const finishInterview = async (finalAnswers: string[]) => {
    setEvaluating(true);
    setStep('results');
    try {
      const results = questions.map((q, i) => ({
        question: q.question,
        answer: finalAnswers[i] || "No answer provided."
      }));

      const evalData = await evaluateInterview(config.role, results);
      setEvaluation(evalData);

      // Save to API
      const interviewData = {
        id: Date.now(),
        role: config.role,
        difficulty: config.difficulty,
        results,
        evaluation: evalData,
        status: 'completed',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'interview'
      };

      try {
        await api.post('/interviews', interviewData);
      } catch (apiErr) {
        console.warn("API save failed, using localStorage", apiErr);
        const existing = JSON.parse(localStorage.getItem('rks-activity-history') || '[]');
        localStorage.setItem('rks-activity-history', JSON.stringify([interviewData, ...existing]));
      }
    } catch (err) {
      console.error("Failed to finish interview", err);
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exportTranscription = () => {
    const rows = questions.map((question, index) => {
      const answer = answers[index] || evaluation?.questionAnalysis?.[index]?.answer || 'No answer provided.';
      return `Q${index + 1}: ${question.question}\nA${index + 1}: ${answer}`;
    });
    const content = [
      `RKS Mock Interview Transcript`,
      `Role: ${config.role || 'Not specified'}`,
      `Difficulty: ${config.difficulty}`,
      `Score: ${evaluation?.overallScore ?? 'Pending'}%`,
      '',
      ...rows
    ].join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rks-interview-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-32">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-primary flex items-center gap-3">
             <MessageCircle className="text-accent w-7 h-7 md:w-8 md:h-8" />
             Interview Architect
          </h1>
          <p className="text-text-secondary mt-1 text-sm md:text-base">Refine your technical narrative with AI-driven behavioral analysis.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/app/settings')}
            aria-label="Interview settings"
            className="flex-1 sm:flex-none flex items-center justify-center p-3 glass rounded-xl text-text-secondary hover:text-text-primary transition-colors border border-border"
          >
            <Settings size={20}/>
          </button>
          <button
            onClick={() => navigate('/app/history')}
            aria-label="Interview history"
            className="flex-1 sm:flex-none flex items-center justify-center p-3 glass rounded-xl text-text-secondary hover:text-text-primary transition-colors border border-border"
          >
            <History size={20}/>
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            <div className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-border space-y-6 md:space-y-8">
              <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-text-primary">Configuration</h2>
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 md:mb-3">Target Role</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-accent pointer-events-none group-hover:scale-110 transition-transform hidden xs:block" size={18} />
                      <input 
                        type="text"
                        list="roles-list"
                        className="w-full bg-bg-card/50 border border-border rounded-xl md:rounded-2xl pl-4 xs:pl-14 pr-6 py-3 md:py-4 outline-none focus:border-accent/40 transition-all text-text-primary font-bold tracking-wide placeholder:text-text-muted/30 text-sm"
                        placeholder="e.g. AI Engineer"
                        value={config.role}
                        onChange={(e) => setConfig({...config, role: e.target.value})}
                      />
                      <datalist id="roles-list">
                        <option value="Frontend Developer" />
                        <option value="Backend Developer" />
                        <option value="Fullstack Engineer" />
                        <option value="Data Scientist" />
                        <option value="iOS Developer" />
                        <option value="Android Developer" />
                        <option value="UI/UX Designer" />
                        <option value="Product Manager" />
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 md:mb-3">Target Company <span className="opacity-40 italic">(Optional)</span></label>
                    <div className="relative group">
                      <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none group-hover:scale-110 transition-transform hidden xs:block" size={18} />
                      <input 
                        type="text"
                        className="w-full bg-bg-card/50 border border-border rounded-xl md:rounded-2xl pl-4 xs:pl-14 pr-6 py-3 md:py-4 outline-none focus:border-accent/40 transition-all text-text-primary font-bold tracking-wide placeholder:text-text-muted/30 text-sm"
                        placeholder="e.g. Google, Stripe"
                        value={config.company}
                        onChange={(e) => setConfig({...config, company: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4">Level of Difficulty</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Easy', 'Medium', 'Hard', 'FAANG'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setConfig({...config, difficulty: lvl})}
                        className={`py-3 rounded-xl border font-black text-[10px] uppercase tracking-tighter transition-all ${
                          config.difficulty === lvl 
                            ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/5' 
                            : 'bg-bg-card/30 border-border text-text-muted hover:bg-bg-hover'
                        }`}
                      >
                        {lvl === 'FAANG' ? 'FAANG+' : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4">Questions Count</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setConfig({...config, count: num})}
                        className={`py-3 rounded-xl border font-black text-[10px] uppercase tracking-tighter transition-all ${
                          config.count === num
                            ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/5' 
                            : 'bg-bg-card/30 border-border text-text-muted hover:bg-bg-hover'
                        }`}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={startInterview}
                disabled={loading}
                className="w-full bg-accent text-white py-5 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-accent/20 text-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Enter Simulation <Play fill="currentColor" size={18} /></>
                )}
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] flex items-center gap-6 md:gap-8 border border-border">
                 <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="text-accent w-6 h-6 md:w-7 md:h-7" />
                 </div>
                 <div>
                    <h4 className="font-black text-base md:text-lg italic uppercase tracking-tighter text-text-primary">Real-time Analysis</h4>
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed mt-1">Our AI tracks your confidence score and technical precision across every response.</p>
                 </div>
              </div>
              <div className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] flex items-center gap-6 md:gap-8 border border-border">
                 <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Award className="text-purple-500 w-6 h-6 md:w-7 md:h-7" />
                 </div>
                 <div>
                    <h4 className="font-black text-base md:text-lg italic uppercase tracking-tighter text-text-primary">AI Feedback Loop</h4>
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed mt-1">Get instant feedback on how to transform "good" answers into "world-class" ones.</p>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'interview' && (
          <motion.div 
            key="interview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center glass px-6 md:px-10 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] border border-border gap-4">
              <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                 <div className="flex flex-col gap-0.5 md:gap-1">
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-text-muted">Progress</span>
                    <div className="text-xs md:text-sm font-bold text-text-primary uppercase italic tracking-tighter">QUESTION {currentIndex + 1} / {questions.length}</div>
                 </div>
                 <div className="h-1 flex-1 sm:w-48 bg-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                      className="h-full bg-accent" 
                    />
                 </div>
              </div>
              <div className={`flex items-center gap-2 font-mono text-lg md:text-xl font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
                <TimerIcon className="w-4.5 h-4.5 md:w-5 md:h-5" /> {formatTime(timeLeft)}
              </div>
            </div>

            <div className="glass p-8 md:p-16 rounded-2xl md:rounded-[3rem] border border-border flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6 md:mb-10 border transition-all ${isListening ? 'bg-red-500/20 border-red-500/40 animate-pulse' : 'bg-accent/20 border-accent/40'}`}>
                <Mic className={`${isListening ? 'text-red-500' : 'text-accent'} w-7 h-7 md:w-10 md:h-10`} />
              </div>
              <h2 className="text-xl md:text-3xl font-black max-w-3xl leading-tight text-text-primary mb-4 italic tracking-tight">
                "{questions[currentIndex]?.question}"
              </h2>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Awaiting your response...</div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="relative">
                <textarea 
                  placeholder="Articulate your response here, or use the mic for voice-to-text..."
                  className="w-full bg-bg-card border border-border rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 outline-none focus:border-accent/40 transition-all min-h-[200px] md:min-h-[250px] text-base md:text-lg leading-relaxed shadow-2xl text-center text-text-primary"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
                <button 
                  onClick={toggleListening}
                  className={`absolute bottom-4 right-4 md:bottom-8 md:right-8 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-xl flex items-center gap-2 font-bold text-[10px] md:text-xs uppercase tracking-widest ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-bg-secondary text-text-primary hover:bg-bg-hover border border-border'
                  }`}
                >
                  <Mic size={16} /> {isListening ? 'Stop' : 'Voice'}
                </button>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-end gap-3 md:gap-4">
                <button 
                  onClick={() => nextQuestion('Skipped')}
                  className="px-6 py-4 md:px-8 md:py-5 border border-border rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-muted hover:text-text-primary transition-all flex items-center gap-2"
                >
                  <SkipForward size={14} /> Skip
                </button>
                <button 
                  onClick={() => setCurrentAnswer('')}
                  className="px-6 py-4 md:px-8 md:py-5 border border-border rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-muted hover:text-text-primary transition-all flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Clear
                </button>
                <button 
                  onClick={() => nextQuestion()}
                  className="w-full sm:w-auto bg-text-primary text-bg-primary px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  {currentIndex === questions.length - 1 ? 'Evaluate Session' : 'Submit Response'} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 md:space-y-12"
          >
            {evaluating ? (
              <div className="flex flex-col items-center py-20 md:py-40 text-center gap-6 md:gap-8">
                 <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto text-accent animate-pulse w-7 h-7 md:w-8 md:h-8" />
                 </div>
                 <div className="space-y-2 px-4">
                    <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-text-primary">Architecting Appraisal</h2>
                    <p className="text-text-secondary text-base md:text-lg">Our AI is analyzing your answers for technical precision and soft skills...</p>
                 </div>
              </div>
            ) : evaluation ? (
              <div className="space-y-8 md:space-y-12">
                <div className="glass p-8 md:p-16 rounded-2xl md:rounded-[3rem] border border-border flex flex-col items-center text-center gap-6 md:gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 md:p-20 opacity-5 pointer-events-none rotate-12">
                    <Award className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 md:gap-4 relative z-10">
                    <div className={`text-5xl md:text-7xl font-black italic tracking-tighter ${evaluation.overallScore >= 80 ? 'text-success' : evaluation.overallScore >= 60 ? 'text-accent' : 'text-red-500'}`}>
                      {evaluation.overallScore}%
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted leading-tight">Aggregated Readiness Score</div>
                  </div>

                  <p className="text-base md:text-xl text-text-secondary max-w-2xl font-medium leading-relaxed italic">
                    "{evaluation.feedback}"
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button 
                      onClick={() => setStep('setup')}
                      className="bg-text-primary text-bg-primary px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                      Start New Simulation
                    </button>
                    <button
                      onClick={exportTranscription}
                      className="glass px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs border border-border hover:bg-bg-hover transition-all text-text-primary"
                    >
                      Export Transcription
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-green-500/20 bg-green-500/5">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-widest text-success flex items-center gap-3 mb-4 md:mb-6 italic">
                      <ThumbsUp className="w-4.5 h-4.5 md:w-5 md:h-5" /> Core Strengths
                    </h3>
                    <ul className="space-y-3 md:space-y-4">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="flex gap-3 md:gap-4 text-xs md:text-sm text-text-secondary leading-relaxed">
                          <CheckCircle2 className="text-success shrink-0 mt-0.5 w-4 h-4 md:w-4.5 md:h-4.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-red-500/20 bg-red-500/5">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-widest text-red-500 flex items-center gap-3 mb-4 md:mb-6 italic">
                      <ThumbsDown className="w-4.5 h-4.5 md:w-5 md:h-5" /> Expansion Areas
                    </h3>
                    <ul className="space-y-3 md:space-y-4">
                      {evaluation.weaknesses.map((w, i) => (
                        <li key={i} className="flex gap-3 md:gap-4 text-xs md:text-sm text-text-secondary leading-relaxed">
                          <XCircle className="text-red-500 shrink-0 mt-0.5 w-4 h-4 md:w-4.5 md:h-4.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase ml-2 md:ml-4">Full Breakdown</h2>
                  {evaluation.questionAnalysis.map((item, i) => (
                    <div key={i} className="glass p-6 md:p-12 rounded-2xl md:rounded-[2.5rem] border border-border space-y-6 md:space-y-10 group hover:border-accent/30 transition-all">
                       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-1 md:space-y-2 max-w-3xl">
                             <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-text-muted">Question {i + 1}</span>
                             <h4 className="text-lg md:text-2xl font-bold tracking-tight text-text-primary leading-snug">{item.question}</h4>
                          </div>
                          <div className={`text-2xl md:text-3xl font-black italic shrink-0 ${item.score >= 8 ? 'text-success' : 'text-accent'}`}>{item.score}/10</div>
                       </div>
                       
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pt-6 md:pt-8 border-t border-border italic">
                          <div className="space-y-3 md:space-y-4">
                             <h5 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                               <MessageCircle size={12} /> Your Narrative
                             </h5>
                             <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                               {item.answer || "No response recorded."}
                             </p>
                          </div>
                          <div className="space-y-3 md:space-y-4">
                             <h5 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                               <Sparkles size={12} /> AI Optimization
                             </h5>
                             <p className="text-accent text-xs md:text-sm leading-relaxed font-medium">
                               {item.betterAlternative}
                             </p>
                             <div className="p-3 md:p-4 bg-accent/5 rounded-xl md:rounded-2xl border border-accent/10 text-[10px] md:text-[11px] text-accent font-semibold leading-relaxed">
                                {item.feedback}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted italic">Evaluation data unavailable. Please restart the simulation.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
