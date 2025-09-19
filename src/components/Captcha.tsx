import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export default function Captcha({ onVerify, className = '' }: CaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Generate new CAPTCHA challenge
  const generateChallenge = () => {
    const operators = ['+', '-', '*'];
    const selectedOperator = operators[Math.floor(Math.random() * operators.length)];
    
    let n1, n2;
    
    switch (selectedOperator) {
      case '+':
        n1 = Math.floor(Math.random() * 50) + 1;
        n2 = Math.floor(Math.random() * 50) + 1;
        break;
      case '-':
        n1 = Math.floor(Math.random() * 50) + 25; // Ensure positive result
        n2 = Math.floor(Math.random() * 25) + 1;
        break;
      case '*':
        n1 = Math.floor(Math.random() * 12) + 1;
        n2 = Math.floor(Math.random() * 12) + 1;
        break;
      default:
        n1 = 1;
        n2 = 1;
    }
    
    setNum1(n1);
    setNum2(n2);
    setOperator(selectedOperator);
    setUserAnswer('');
    setIsValid(false);
    onVerify(false);
  };

  // Calculate correct answer
  const getCorrectAnswer = () => {
    switch (operator) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '*':
        return num1 * num2;
      default:
        return 0;
    }
  };

  // Verify user answer
  const verifyAnswer = (answer: string) => {
    const userNum = parseInt(answer);
    const correctAnswer = getCorrectAnswer();
    const valid = !isNaN(userNum) && userNum === correctAnswer;
    
    setIsValid(valid);
    onVerify(valid);
    
    return valid;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserAnswer(value);
    
    if (value.trim()) {
      verifyAnswer(value);
    } else {
      setIsValid(false);
      onVerify(false);
    }
  };

  // Generate initial challenge
  useEffect(() => {
    generateChallenge();
  }, []);

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          सत्यापन (CAPTCHA)
        </label>
        <button
          type="button"
          onClick={generateChallenge}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="नया प्रश्न / New Question"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Math Problem Display */}
        <div className="bg-white border border-gray-300 rounded px-3 py-2 font-mono text-lg font-bold text-gray-800 min-w-[120px] text-center">
          {num1} {operator} {num2} = ?
        </div>
        
        {/* Answer Input */}
        <input
          type="number"
          value={userAnswer}
          onChange={handleInputChange}
          placeholder="उत्तर"
          className={`w-20 px-3 py-2 border rounded-lg text-center font-mono text-lg transition-colors ${
            userAnswer && isValid
              ? 'border-green-500 bg-green-50 text-green-700'
              : userAnswer && !isValid
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200'
          }`}
        />
        
        {/* Status Indicator */}
        <div className="w-6 h-6 flex items-center justify-center">
          {userAnswer && (
            <div className={`w-4 h-4 rounded-full ${
              isValid ? 'bg-green-500' : 'bg-red-500'
            }`} />
          )}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        कृपया ऊपर दिए गए गणित के प्रश्न का उत्तर दें / Please solve the math problem above
      </p>
    </div>
  );
}
