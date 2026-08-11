import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  HelpCircle, Plus, Sparkles, Loader2, 
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Award
} from 'lucide-react';
import subjectService from '../services/subjectService';
import quizService from '../services/quizService';
import { MockQuiz, MockQuestion } from '../services/mockDb';

export const Quiz: React.FC = () => {
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Flow State: 'config' | 'taking' | 'result'
  const [flowState, setFlowState] = useState<'config' | 'taking' | 'result'>('config');

  // Config Form State
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<MockQuiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { question_id: "A/B/C/D" }
  const [submitting, setSubmitting] = useState(false);

  // Result State
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizTotal, setQuizTotal] = useState<number>(0);
  const [quizPercentage, setQuizPercentage] = useState<number>(0);
  const [quizBreakdown, setQuizBreakdown] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAll();
      setSubjects(data);
      if (data.length > 0) {
        setSubjectId(data[0].id);
      }
    } catch (err) {
      showToast('Failed to load courses for quiz associations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Please enter a quiz topic.', 'warning');
      return;
    }

    setGenerating(true);
    try {
      const generated = await quizService.generate({
        subject_id: subjectId || undefined,
        topic,
        difficulty,
        num_questions: numQuestions
      });

      setActiveQuiz(generated);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setFlowState('taking');
      showToast('AI Quiz generated successfully! Good luck!', 'success');
    } catch (err) {
      showToast('Failed to generate quiz questions.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId.toString()]: optionLetter
    }));
  };

  const handleNext = () => {
    if (!activeQuiz) return;
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    // Check if all questions are answered
    const totalQs = activeQuiz.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < totalQs) {
      const confirmSubmit = window.confirm(`You answered ${answeredCount} of ${totalQs} questions. Submit anyway?`);
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const evaluation = await quizService.submit(activeQuiz.id, selectedAnswers);
      setQuizScore(evaluation.correct_count);
      setQuizTotal(totalQs);
      setQuizPercentage(evaluation.result.percentage);
      setQuizBreakdown(evaluation.breakdown);
      
      setFlowState('result');
      setShowReview(false);
      showToast('Quiz evaluated! Check your score.', 'success');
    } catch (err) {
      showToast('Failed to submit quiz results.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setFlowState('config');
    setActiveQuiz(null);
    setSelectedAnswers({});
    setTopic('');
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          AI Quiz Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
          Validate your knowledge with custom, AI-synthesized practice questions
        </p>
      </div>

      {/* 1. Configuration State */}
      {flowState === 'config' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm text-left max-w-xl mx-auto">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <span className="text-sm font-bold text-slate-850 dark:text-slate-200">Generating your quiz...</span>
              <p className="text-xs text-slate-400 max-w-xs text-center leading-relaxed mt-1">
                AI is compiling subject descriptions and formulating custom MCQ options and explanations.
              </p>
            </div>
          ) : (
            <form onSubmit={handleGenerateQuiz} className="space-y-5">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Configure Test Options</span>
              </div>

              {/* Subject associations */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Course</label>
                <select
                  value={subjectId || ''}
                  onChange={(e) => setSubjectId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  <option value="">No Associated Subject (General)</option>
                </select>
              </div>

              {/* Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Polymorphism, OSI Layer, Lambda Functions"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Number of questions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Number of Questions</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
                  >
                    <option value={2}>2 Questions</option>
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer mt-6"
              >
                <Sparkles className="w-4 h-4" />
                Generate Quiz
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. Taking the Quiz Screen */}
      {flowState === 'taking' && activeQuiz && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-sm text-left max-w-2xl mx-auto flex flex-col justify-between min-h-[400px]">
          {/* Header metrics */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-4 border-b border-slate-50 dark:border-slate-800/60 pb-3 uppercase tracking-wide">
              <span>{activeQuiz.title}</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
              </span>
            </div>

            {/* Progress indicator bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="text-base font-extrabold text-slate-850 dark:text-slate-100 mb-6">
              {activeQuiz.questions[currentQuestionIdx].question}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((optKey) => {
                const optText = 
                  optKey === 'A' ? activeQuiz.questions[currentQuestionIdx].option_a :
                  optKey === 'B' ? activeQuiz.questions[currentQuestionIdx].option_b :
                  optKey === 'C' ? activeQuiz.questions[currentQuestionIdx].option_c :
                  activeQuiz.questions[currentQuestionIdx].option_d;

                const qId = activeQuiz.questions[currentQuestionIdx].id;
                const isSelected = selectedAnswers[qId.toString()] === optKey;

                return (
                  <button
                    key={optKey}
                    type="button"
                    onClick={() => handleSelectOption(qId, optKey)}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all focus:outline-none cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/20 text-indigo-750 dark:text-indigo-400 dark:bg-indigo-950/20' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                        : 'border-slate-350 dark:border-slate-700 text-slate-450'
                    }`}>
                      {optKey}
                    </div>
                    <span className="mt-0.5">{optText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Steppers & Submit controls */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIdx === 0}
              className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 disabled:opacity-40 disabled:hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Scorecard Result Screen */}
      {flowState === 'result' && (
        <div className="space-y-6 max-w-xl mx-auto">
          {/* Card Score banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-slate-850 dark:text-slate-150">Quiz Completed!</h3>
              <p className="text-slate-400 text-xs font-medium">Your score results have been stored.</p>
            </div>

            {/* Percentage Display */}
            <div className="py-4">
              <div className="text-4xl sm:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {quizPercentage}%
              </div>
              <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                Correct Answers: <span className="text-slate-700 dark:text-slate-200">{quizScore}</span> / {quizTotal}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                onClick={() => setShowReview(!showReview)}
                className="flex-1 border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                {showReview ? 'Hide Review' : 'Review Answers'}
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                Try Another Topic
              </button>
            </div>
          </div>

          {/* Optional: Review section dropdown */}
          {showReview && quizBreakdown.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 px-1">Reviewing Answers</h3>
              {quizBreakdown.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm text-left space-y-3"
                >
                  <div className="flex items-start gap-2 justify-between">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {idx + 1}. {item.question}
                    </div>
                    {item.is_correct ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-transparent uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-transparent uppercase">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-semibold text-slate-500 space-y-1 bg-slate-50/50 dark:bg-slate-850/40 p-3 rounded-xl">
                    <div>
                      Submitted Option: <strong className={item.is_correct ? 'text-emerald-600' : 'text-rose-500'}>{item.submitted || '[No Answer]'}</strong>
                    </div>
                    <div>
                      Correct Option: <strong className="text-emerald-600">{item.correct_answer}</strong>
                    </div>
                  </div>

                  {item.explanation && (
                    <p className="text-xs text-slate-400 leading-relaxed pl-1 pt-1 border-l-2 border-indigo-500/30">
                      💡 <strong>Explanation:</strong> {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Quiz;
