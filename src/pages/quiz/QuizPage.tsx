import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { quizService } from '../../services/quizService';
import type { Question } from '../../services/api';
import { getImageUrl } from '../../utils/getImageUrl';

const QuizPage: React.FC = () => {
  const { id: attemptId } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionIndex?: number; answerText?: string }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [attempt, setAttempt] = useState<any>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState<null | number[]>(null);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Warn on navigation away for time-limited quizzes
  useEffect(() => {
    if (!attempt?.TimeLimitMinutes) return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Intercept anchor clicks
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (anchor && anchor.getAttribute('href')) {
        e.preventDefault();
        setPendingHref(anchor.getAttribute('href'));
        setShowLeaveModal(true);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [attempt?.TimeLimitMinutes, currentIndex, timeLeft, answers]);

  const savingRef = useRef(false);

  // Load attempt and questions
  useEffect(() => {
    (async () => {
      if (!attemptId) return;
      setLoading(true);
      setError(null);
      try {
        const attemptRes = await quizService.getQuizAttempt(attemptId);
        const qRes = await quizService.getQuizQuestions(attemptId);
        if (!attemptRes.success) throw new Error(attemptRes.message);
        if (!qRes.success) throw new Error(qRes.message);
        // Preload answers into state for binding
        const qList = qRes.questions || [];
        const pre: Record<string, { selectedOptionIndex?: number; answerText?: string }> = {};
        qList.forEach((q: any) => {
          if (q.SelectedOptionIndex !== undefined && q.SelectedOptionIndex !== null) {
            pre[String(q.QuestionID)] = { selectedOptionIndex: q.SelectedOptionIndex };
          }
          if (q.AnswerText) {
            pre[String(q.QuestionID)] = { ...(pre[String(q.QuestionID)]||{}), answerText: q.AnswerText };
          }
        });
        setQuestions(qList);
        setAnswers(pre);
        setAttempt(attemptRes.attempt);
        // Initialize timer (RemainingSeconds if provided; fallback 0 => no timer)
        const rs: any = attemptRes.attempt as any;
        const initialRemaining = (rs?.RemainingSeconds ?? rs?.remainingSeconds ?? 0) as number;
        setTimeLeft(Math.max(0, initialRemaining));
        setCurrentIndex((rs?.CurrentQuestionIndex ?? 0) as number);
      } catch (e: any) {
        setError(e?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  // Auto save every 15 seconds
  useEffect(() => {
    if (!attemptId) return;
    // Disable autosave for timed quizzes (must submit in one go)
    const isTimed = !!attempt?.TimeLimitMinutes || (timeLeft && timeLeft > 0);
    if (isTimed) return;

    const iv = setInterval(async () => {
      if (savingRef.current) return;
      savingRef.current = true;
      await quizService.saveProgress(attemptId, {
        currentIndex,
        remainingSeconds: timeLeft,
      });
      savingRef.current = false;
    }, 15000);
    return () => clearInterval(iv);
  }, [attemptId, currentIndex, timeLeft]);

  // Timer effect (only if timeLeft > 0)
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    const timer = setInterval(async () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // When timer hits 0, finalize submission and show modal
  useEffect(() => {
    const finalizeOnTimeUp = async () => {
      if (!attemptId) return;
      // Save snapshot then submit
      const answersArray = Object.entries(answers).map(([qid, a]) => ({
        questionId: qid,
        selectedOptionIndex: a.selectedOptionIndex,
        answerText: a.answerText
      }));
      try {
        await quizService.saveProgress(attemptId, { currentIndex, remainingSeconds: 0, answers: answersArray });
        await quizService.submitQuiz(attemptId);
      } catch (e) {
        // swallow; we'll still show modal
      }
      setShowTimeUpModal(true);
    };
    if (timeLeft === 0 && attempt?.TimeLimitMinutes) {
      finalizeOnTimeUp();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, update: { selectedOptionIndex?: number; answerText?: string }) => {
    // Enforce 500-character limit for descriptive answers
    if (update.answerText !== undefined) {
      if (update.answerText.length > 500) {
        update.answerText = update.answerText.slice(0, 500);
      }
    }
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], ...update } }));
  };

  const persistIndex = async (idx: number) => {
    if (!attemptId) return;
    await quizService.saveProgress(attemptId, { currentIndex: idx, remainingSeconds: timeLeft });
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      await persistIndex(next);
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      await persistIndex(prev);
    }
  };
  // Save progress explicitly from header button
  const handleSaveProgress = async () => {
    if (!attemptId) return;
    try {
      const answersArray = Object.entries(answers).map(([qid, a]) => ({
        questionId: qid,
        selectedOptionIndex: a.selectedOptionIndex,
        answerText: a.answerText
      }));
      const result = await quizService.saveProgress(attemptId, { currentIndex, remainingSeconds: timeLeft, answers: answersArray });
      if (result.success) {
        setShowSavedModal(true);
        setTimeout(() => setShowSavedModal(false), 1500);
      } else {
        console.error('Failed to save progress:', result.message);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };


  const handleSubmit = async (auto = false) => {
    if (!attemptId) return;
    // Validation: require at least one selection for each MCQ
    const missing: number[] = [];
    questions.forEach((q, idx) => {
      if (q.QuestionType === 'MCQ') {
        const sel = answers[q.QuestionID]?.selectedOptionIndex;
        if (sel === undefined || sel === null) missing.push(idx + 1);
      }
    });
    if (!auto && missing.length) {
      setShowValidationModal(missing);
      return;
    }

    // Save snapshot (progress only)
    const answersArray = Object.entries(answers).map(([qid, a]) => ({
      questionId: qid,
      selectedOptionIndex: a.selectedOptionIndex,
      answerText: a.answerText
    }));
    await quizService.saveProgress(attemptId, { currentIndex, remainingSeconds: timeLeft, answers: answersArray });

    if (auto) {
      try {
        const res = await quizService.submitQuiz(attemptId);
        if (res.success) {
          navigate('/dashboard', { state: { quizCompleted: true } });
        } else {
          console.error('Failed to submit quiz:', res.message);
        }
      } catch (error) {
        console.error('Error submitting quiz:', error);
      }
      return;
    }

    setShowSubmitDialog(true);
  };


  const currentQ = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const quizTitle = (attemptId && (attempt as any)?.TitleHindi) || (attemptId && (attempt as any)?.Title) || (language==='hi' ? 'क्विज़' : 'Quiz');

  if (loading) {
    return (
      <div className="min-h-screen guruji-bg-light py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8">Loading quiz...</div>
        </div>
      </div>
    );
  }
  if (error || !currentQ) {
    return (
      <div className="min-h-screen guruji-bg-light py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-red-600">{error || 'Quiz not available'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen guruji-bg-light py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Quiz Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-maroon-800">{quizTitle}</h1>
            <div className="flex items-center space-x-4">
              {!!timeLeft && timeLeft > 0 ? (
                <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className="font-mono text-red-600 font-semibold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-maroon-600">No time limit</div>
              )}
              {timeLeft > 0 ? null : (
              <button
                onClick={handleSaveProgress}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <Flag className="h-4 w-4" />
                <span>{language === 'hi' ? 'प्रगति सहेजें' : 'Save Progress'}</span>
              </button>
              )}

              {/* Saved toast */}
              {showSavedModal && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                  {language === 'hi' ? 'सहेजा गया!' : 'Saved!'}
                </div>
              )}
            </div>


          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-maroon-600 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-cream-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-saffron-500 to-gold-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
          {currentQ.QuestionImageURL && (
            <div className="mb-4">
              <img
                src={getImageUrl(currentQ.QuestionImageURL)}
                alt="Question"
                className="max-h-64 object-contain rounded-lg mx-auto"
              />
            </div>
          )}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-maroon-800 mb-4">
              {currentQ.QuestionTextHindi || currentQ.QuestionText}
            </h2>

            {currentQ.QuestionType === 'MCQ' ? (
              <div className="space-y-3">
                {currentQ.Options?.map((option, index) => (
                  <label key={option.OptionID || index} className="flex items-center p-4 border border-cream-200 rounded-lg hover:bg-cream-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={`question-${currentIndex}`}
                      value={index}
                      checked={(answers[currentQ.QuestionID]?.selectedOptionIndex ?? -1) === index}
                      onChange={() => handleAnswerChange(currentQ.QuestionID, { selectedOptionIndex: index })}
                      className="w-4 h-4 text-saffron-600 border-2 border-cream-300 focus:ring-saffron-500"
                    />
                    <span className="ml-3 text-maroon-700">{option.OptionTextHindi || option.OptionText}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <textarea
                  value={answers[currentQ.QuestionID]?.answerText || ''}
                  onChange={(e) => handleAnswerChange(currentQ.QuestionID, { answerText: e.target.value })}
                  placeholder="Write your answer here..."
                  className="w-full h-40 p-4 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors resize-none"
                />
                <div className="text-sm text-maroon-500 mt-2">
                  Maximum 500 characters allowed.
                </div>
                <div className="text-xs text-maroon-400 mt-1 text-right">
                  {(() => {
                    const text = (answers[currentQ.QuestionID]?.answerText || '') || '';
                    const chars = text.length;
                    return `${chars} / 500`;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              currentIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-cream-100 hover:bg-cream-200 text-maroon-700'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{t('common.previous')}</span>
          </button>

          {/* Question Navigator */}
          <div className="flex items-center space-x-2">
            {questions.map((q, index) => (
              <button
                key={q.QuestionID || index}
                onClick={() => setCurrentIndex(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-saffron-500 text-white'
                    : answers[(q as any).QuestionID] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-cream-100 text-maroon-600 hover:bg-cream-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={currentIndex === questions.length - 1 ? () => setShowSubmitDialog(true) : handleNext}
            className="flex items-center space-x-2 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <span>
              {currentIndex === questions.length - 1 ? (language==='hi' ? 'क्विज़ जमा करें' : 'Submit Quiz') : t('common.next')}
            </span>
            {currentIndex !== questions.length - 1 && <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Submit Dialog */}
        {showSubmitDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
              <div className="text-center mb-6">
                <div className="bg-yellow-100 p-4 rounded-full w-fit mx-auto mb-4">

                  <Flag className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-maroon-800 mb-2">Submit Quiz?</h3>
                <p className="text-maroon-600">
                  Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
                </p>
              </div>

              <div className="bg-cream-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-maroon-600">
                  <div className="flex justify-between mb-1">
                    <span>Questions Answered:</span>
                    <span className="font-semibold">{Object.keys(answers).length}/{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Remaining:</span>
                    <span className="font-semibold">{timeLeft > 0 ? formatTime(timeLeft) : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button onClick={() => setShowSubmitDialog(false)} className="flex-1 bg-cream-100 hover:bg-cream-200 text-maroon-700 py-3 rounded-lg font-semibold transition-colors">Continue Quiz</button>
                <button
                  onClick={async () => {
                    if (!attemptId) return;
                    const missing: number[] = [];

                    questions.forEach((q, idx) => {
                      if ((q as any).QuestionType === 'MCQ') {
                        const sel = answers[(q as any).QuestionID]?.selectedOptionIndex;
                        if (sel === undefined || sel === null) missing.push(idx + 1);
                      }
                    });
                    if (missing.length) { setShowValidationModal(missing); return; }
                    try {
                      const res = await quizService.submitQuiz(attemptId);
                      if (res.success) {
                        navigate('/dashboard', { state: { quizCompleted: true } });
                      } else {
                        console.error('Failed to submit quiz:', res.message);
                      }
                    } catch (error) {
                      console.error('Error submitting quiz:', error);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default QuizPage;