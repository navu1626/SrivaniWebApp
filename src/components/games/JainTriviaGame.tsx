import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface JainTriviaGameProps {
  onClose: () => void;
}

export default function JainTriviaGame({ onClose }: JainTriviaGameProps) {
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  useEffect(() => {
    // Try CSS var first, fallback to measuring header element
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    if (cssVar) {
      const parsed = parseInt(cssVar.replace('px', '').trim(), 10);
      if (!isNaN(parsed) && parsed > 0) {
        setHeaderHeight(parsed);
        return;
      }
    }

    const headerEl = document.querySelector('header');
    if (headerEl && headerEl.getBoundingClientRect) {
      setHeaderHeight(Math.ceil(headerEl.getBoundingClientRect().height));
    }
  }, []);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const questions: Question[] = [
    {
      id: 1,
      question: "जैन धर्म के संस्थापक कौन हैं?",
      options: ["महावीर स्वामी", "ऋषभनाथ", "पार्श्वनाथ", "नेमिनाथ"],
      correct: 1,
      explanation: "ऋषभनाथ जैन धर्म के प्रथम तीर्थंकर और संस्थापक हैं।"
    },
    {
      id: 2,
      question: "जैन धर्म में कुल कितने तीर्थंकर हैं?",
      options: ["22", "23", "24", "25"],
      correct: 2,
      explanation: "जैन धर्म में कुल 24 तीर्थंकर हैं।"
    },
    {
      id: 3,
      question: "अहिंसा का क्या अर्थ है?",
      options: ["सत्य बोलना", "किसी को हानि न पहुंचाना", "चोरी न करना", "ब्रह्मचर्य"],
      correct: 1,
      explanation: "अहिंसा का अर्थ है किसी भी जीव को मन, वचन और कर्म से हानि न पहुंचाना।"
    },
    {
      id: 4,
      question: "जैन धर्म के पांच मुख्य व्रत कौन से हैं?",
      options: ["पंचशील", "अष्टांग मार्ग", "पंच महाव्रत", "चतुर्दश गुणस्थान"],
      correct: 2,
      explanation: "अहिंसा, सत्य, अस्तेय, ब्रह्मचर्य और अपरिग्रह - ये पंच महाव्रत हैं।"
    },
    {
      id: 5,
      question: "पर्युषण पर्व कितने दिन का होता है?",
      options: ["5 दिन", "8 दिन", "10 दिन", "15 दिन"],
      correct: 1,
      explanation: "पर्युषण पर्व 8 दिन का होता है और यह जैन धर्म का सबसे महत्वपूर्ण त्योहार है।"
    }
  ];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer();
    }
  }, [timeLeft, showResult, gameComplete]);

  const handleAnswer = () => {
    if (selectedAnswer !== null) {
      if (selectedAnswer === questions[currentQuestion].correct) {
        setScore(score + 1);
      }
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setGameComplete(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setGameComplete(false);
    setTimeLeft(30);
  };

  if (gameComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
          style={{ marginTop: headerHeight ? headerHeight + 12 : undefined, maxHeight: `calc(100vh - ${headerHeight || 0}px)`, overflowY: 'auto' }}
        >
          <div className="mb-6">
            <div className="bg-gradient-to-r from-gold-400 to-yellow-500 p-4 rounded-full w-fit mx-auto mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-maroon-800 mb-2">खेल समाप्त!</h3>
            <p className="text-lg text-maroon-600 mb-4">
              आपका स्कोर: {score}/{questions.length}
            </p>
            <p className="text-maroon-600">
              {score === questions.length ? "बहुत बढ़िया! आप जैन धर्म के बारे में बहुत जानते हैं।" :
               score >= questions.length * 0.7 ? "अच्छा! आपका ज्ञान अच्छा है।" :
               "कोई बात नहीं! अभ्यास से आप और बेहतर हो सकते हैं।"}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={restartGame}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-5 w-5" />
              <span>फिर खेलें</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
            >
              बंद करें
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
        style={{ marginTop: headerHeight ? headerHeight + 12 : undefined, maxHeight: `calc(100vh - ${headerHeight || 0}px)`, overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-maroon-800">जैन ज्ञान प्रश्नोत्तरी</h3>
            <p className="text-maroon-600">प्रश्न {currentQuestion + 1} / {questions.length}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
              {timeLeft}s
            </div>
            <div className="text-sm text-gray-600">स्कोर: {score}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-saffron-500 to-gold-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-maroon-800 mb-4">
            {questions[currentQuestion].question}
          </h4>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                  showResult
                    ? index === questions[currentQuestion].correct
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : index === selectedAnswer && index !== questions[currentQuestion].correct
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    : selectedAnswer === index
                    ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                    : 'border-gray-200 hover:border-saffron-300 hover:bg-saffron-25'
                }`}
              >
                <div className="flex items-center">
                  <span className="font-medium">{option}</span>
                  {showResult && index === questions[currentQuestion].correct && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                  {showResult && index === selectedAnswer && index !== questions[currentQuestion].correct && (
                    <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <h5 className="font-semibold text-blue-800 mb-2">व्याख्या:</h5>
            <p className="text-blue-700">{questions[currentQuestion].explanation}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            बंद करें
          </button>
          
          {!showResult ? (
            <button
              onClick={handleAnswer}
              disabled={selectedAnswer === null}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                selectedAnswer !== null
                  ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              उत्तर दें
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
            >
              {currentQuestion < questions.length - 1 ? 'अगला प्रश्न' : 'परिणाम देखें'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
