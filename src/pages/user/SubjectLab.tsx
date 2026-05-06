import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft, 
  Loader2, 
  ChevronRight, 
  Code2, 
  Lightbulb,
  Trophy
} from 'lucide-react';
import { generateLabExercises, LabExercise } from '../../services/aiService';

export default function SubjectLab() {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState<LabExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [labFinished, setLabFinished] = useState(false);

  useEffect(() => {
    if (subjectName) {
      loadLab();
    }
  }, [subjectName]);

  const loadLab = async () => {
    setLoading(true);
    try {
      const data = await generateLabExercises(subjectName!);
      setLab(data);
    } catch (error) {
      console.error("Failed to load lab:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === lab?.mcqs[currentMcqIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentMcqIndex < (lab?.mcqs.length || 0) - 1) {
      setCurrentMcqIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setLabFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-medium italic">Setting up your Lab for {subjectName}...</p>
        </div>
      </div>
    );
  }

  if (labFinished) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-secondary border border-border rounded-3xl p-12 text-center"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-text-primary mb-4">MCQ Session Completed!</h2>
          <div className="text-6xl font-black text-accent mb-6">{score} / {lab?.mcqs.length}</div>
          <p className="text-text-secondary mb-8">Great job practicing! Now proceed to the Practical Tasks below to master {subjectName}.</p>
          
          <div className="grid gap-6 text-left">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Code2 className="text-accent" />
              Practical Exercises
            </h3>
            {lab?.practicalTasks.map((task, idx) => (
              <div key={idx} className="bg-bg-hover border border-border rounded-2xl p-6">
                <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center">{idx + 1}</span>
                  {task.title}
                </h4>
                <p className="text-text-secondary text-sm mb-4">{task.description}</p>
                <div className="flex gap-4">
                  <details className="group flex-1">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider group-open:mb-4">
                      <Lightbulb size={14} /> View Hints
                    </summary>
                    <ul className="space-y-2 text-xs text-text-muted italic border-l-2 border-accent/20 pl-4">
                      {task.hints.map((hint, i) => <li key={i}>• {hint}</li>)}
                    </ul>
                  </details>
                  <details className="group flex-1">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider group-open:mb-4">
                      <CheckCircle2 size={14} /> Solution Steps
                    </summary>
                    <ol className="space-y-2 text-xs text-text-muted italic border-l-2 border-green-500/20 pl-4">
                      {task.solutionSteps.map((step, i) => <li key={i}>{i+1}. {step}</li>)}
                    </ol>
                  </details>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/app/skills')}
            className="mt-12 bg-bg-hover border border-border px-8 py-3 rounded-xl font-bold hover:bg-bg-secondary transition-all"
          >
            Back to Skills Lab
          </button>
        </motion.div>
      </div>
    );
  }

  const mcq = lab?.mcqs[currentMcqIndex];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/app/skills')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-all font-medium"
        >
          <ArrowLeft size={20} />
          Back to Lab
        </button>
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest bg-bg-secondary px-4 py-2 rounded-full border border-border">
            Progress: {currentMcqIndex + 1} / {lab?.mcqs.length}
          </div>
          <div className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
            Score: {score}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-black text-text-primary tracking-tight mb-2 flex items-center gap-4">
          <Terminal className="text-accent" />
          {subjectName} Lab
        </h1>
        <p className="text-text-secondary italic">Master the concepts through interaction.</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMcqIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-bg-secondary border border-border rounded-3xl p-8 md:p-12"
        >
          <div className="flex items-start gap-4 mb-8">
            <HelpCircle className="w-8 h-8 text-accent shrink-0 mt-1" />
            <h2 className="text-2xl font-bold text-text-primary leading-tight">
              {mcq?.question}
            </h2>
          </div>

          <div className="grid gap-4">
            {mcq?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={selectedOption !== null}
                className={`
                  w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group
                  ${selectedOption === null 
                    ? 'border-border bg-bg-hover hover:border-accent/40 hover:bg-bg-secondary' 
                    : idx === mcq.correctAnswer
                      ? 'border-green-500/50 bg-green-500/10'
                      : selectedOption === idx
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-border bg-bg-hover opacity-50'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all
                    ${selectedOption === null 
                      ? 'bg-bg-primary text-text-muted group-hover:bg-accent/20 group-hover:text-accent' 
                      : idx === mcq.correctAnswer
                        ? 'bg-green-500 text-white'
                        : selectedOption === idx
                          ? 'bg-red-500 text-white'
                          : 'bg-bg-primary text-text-muted'
                    }
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium text-text-primary">{option}</span>
                </div>
                {selectedOption !== null && idx === mcq.correctAnswer && (
                  <CheckCircle2 className="text-green-500" />
                )}
              </button>
            ))}
          </div>

          {showExplanation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-accent/5 border border-accent/20"
            >
              <div className="flex items-center gap-2 text-accent font-bold uppercase text-xs tracking-widest mb-2">
                <Lightbulb size={16} /> Explanation
              </div>
              <p className="text-text-secondary text-sm leading-relaxed italic">
                {mcq?.explanation}
              </p>
              
              <button
                onClick={nextQuestion}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-accent text-white py-4 rounded-xl font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
              >
                {currentMcqIndex === (lab?.mcqs.length || 0) - 1 ? 'Finish MCQs' : 'Next Question'}
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
