import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Lightbulb, CheckCircle } from 'lucide-react';

interface Word {
  word: string;
  hint: string;
  found: boolean;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

interface JainWordPuzzleGameProps {
  onClose: () => void;
}

export default function JainWordPuzzleGame({ onClose }: JainWordPuzzleGameProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [gameComplete, setGameComplete] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const jainWords = [
    { word: "अहिंसा", hint: "जैन धर्म का मुख्य सिद्धांत - किसी को हानि न पहुंचाना" },
    { word: "तीर्थंकर", hint: "जैन धर्म के आध्यात्मिक गुरु" },
    { word: "कर्म", hint: "कार्यों का फल" },
    { word: "मोक्ष", hint: "आत्मा की मुक्ति" },
    { word: "जिन", hint: "विजेता, जिन्होंने इंद्रियों को जीता हो" },
    { word: "व्रत", hint: "धार्मिक नियम या संकल्प" },
    { word: "दान", hint: "दूसरों की सहायता करना" },
    { word: "ध्यान", hint: "मन की एकाग्रता" }
  ];

  const gridSize = 12;

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
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

  const initializeGame = () => {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    const newWords: Word[] = [];

    // Place words in grid
    jainWords.forEach((wordData) => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 50) {
        const direction = ['horizontal', 'vertical', 'diagonal'][Math.floor(Math.random() * 3)] as 'horizontal' | 'vertical' | 'diagonal';
        const word = wordData.word;
        
        let startRow, startCol, endRow, endCol;
        
        if (direction === 'horizontal') {
          startRow = Math.floor(Math.random() * gridSize);
          startCol = Math.floor(Math.random() * (gridSize - word.length));
          endRow = startRow;
          endCol = startCol + word.length - 1;
        } else if (direction === 'vertical') {
          startRow = Math.floor(Math.random() * (gridSize - word.length));
          startCol = Math.floor(Math.random() * gridSize);
          endRow = startRow + word.length - 1;
          endCol = startCol;
        } else { // diagonal
          startRow = Math.floor(Math.random() * (gridSize - word.length));
          startCol = Math.floor(Math.random() * (gridSize - word.length));
          endRow = startRow + word.length - 1;
          endCol = startCol + word.length - 1;
        }

        // Check if position is available
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          let row, col;
          if (direction === 'horizontal') {
            row = startRow;
            col = startCol + i;
          } else if (direction === 'vertical') {
            row = startRow + i;
            col = startCol;
          } else {
            row = startRow + i;
            col = startCol + i;
          }
          
          if (newGrid[row][col] !== '' && newGrid[row][col] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          // Place the word
          for (let i = 0; i < word.length; i++) {
            let row, col;
            if (direction === 'horizontal') {
              row = startRow;
              col = startCol + i;
            } else if (direction === 'vertical') {
              row = startRow + i;
              col = startCol;
            } else {
              row = startRow + i;
              col = startCol + i;
            }
            newGrid[row][col] = word[i];
          }
          
          newWords.push({
            word: wordData.word,
            hint: wordData.hint,
            found: false,
            startRow,
            startCol,
            direction
          });
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells with random letters
    const hindiLetters = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ओ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'];
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = hindiLetters[Math.floor(Math.random() * hindiLetters.length)];
        }
      }
    }

    setGrid(newGrid);
    setWords(newWords);
    setSelectedCells(new Set());
    setFoundWords(new Set());
    setGameComplete(false);
    setShowHints(false);
  };

  const handleCellClick = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const newSelectedCells = new Set(selectedCells);
    
    if (selectedCells.has(cellKey)) {
      newSelectedCells.delete(cellKey);
    } else {
      newSelectedCells.add(cellKey);
    }
    
    setSelectedCells(newSelectedCells);
    
    // Check if selected cells form a word
    checkForWord(newSelectedCells);
  };

  const checkForWord = (selectedCells: Set<string>) => {
    if (selectedCells.size < 2) return;
    
    const cells = Array.from(selectedCells).map(key => {
      const [row, col] = key.split('-').map(Number);
      return { row, col, letter: grid[row][col] };
    });
    
    // Sort cells to form a line
    cells.sort((a, b) => a.row === b.row ? a.col - b.col : a.row - b.row);
    
    // Check if cells form a straight line and spell a word
    const selectedWord = cells.map(cell => cell.letter).join('');
    
    words.forEach((wordData, index) => {
      if (wordData.word === selectedWord && !foundWords.has(wordData.word)) {
        setFoundWords(prev => new Set([...prev, wordData.word]));
        setWords(prev => prev.map((w, i) => i === index ? { ...w, found: true } : w));
        
        if (foundWords.size + 1 === words.length) {
          setGameComplete(true);
        }
      }
    });
  };

  const clearSelection = () => {
    setSelectedCells(new Set());
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
            <h3 className="text-2xl font-bold text-maroon-800 mb-2">बधाई हो!</h3>
            <p className="text-lg text-maroon-600 mb-4">आपने सभी जैन शब्द खोज लिए!</p>
            <p className="text-maroon-600">
              आपने जैन धर्म की महत्वपूर्ण शब्दावली सीखी है।
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={initializeGame}
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
  className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
  style={{ marginTop: headerHeight ? headerHeight + 12 : undefined, maxHeight: `calc(100vh - ${headerHeight || 0}px)`, overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-maroon-800">जैन शब्द पहेली</h3>
            <p className="text-maroon-600">जैन धर्म से संबंधित शब्द खोजें</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              मिले: {foundWords.size}/{words.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-12 gap-1 mb-4">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const isSelected = selectedCells.has(cellKey);
                  
                  return (
                    <button
                      key={cellKey}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`aspect-square text-sm font-semibold border rounded transition-all duration-200 ${
                        isSelected
                          ? 'bg-saffron-200 border-saffron-500 text-saffron-800'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cell}
                    </button>
                  );
                })
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={clearSelection}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                चयन साफ़ करें
              </button>
              <button
                onClick={() => setShowHints(!showHints)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
              >
                <Lightbulb className="h-4 w-4" />
                <span>{showHints ? 'संकेत छुपाएं' : 'संकेत दिखाएं'}</span>
              </button>
            </div>
          </div>

          {/* Word List */}
          <div>
            <h4 className="text-lg font-semibold text-maroon-800 mb-4">खोजने वाले शब्द:</h4>
            <div className="space-y-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    word.found
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${
                      word.found ? 'text-green-700 line-through' : 'text-maroon-800'
                    }`}>
                      {word.word}
                    </span>
                    {word.found && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  {showHints && (
                    <p className="text-xs text-gray-600 mt-1">{word.hint}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 mb-6">
          <h5 className="font-semibold text-blue-800 mb-2">खेल के नियम:</h5>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• ग्रिड में छुपे हुए जैन शब्दों को खोजें</li>
            <li>• शब्द क्षैतिज, लंबवत या तिरछे हो सकते हैं</li>
            <li>• अक्षरों पर क्लिक करके शब्द बनाएं</li>
            <li>• संकेत देखने के लिए "संकेत दिखाएं" बटन दबाएं</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            बंद करें
          </button>
          <button
            onClick={initializeGame}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span>नया खेल</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
