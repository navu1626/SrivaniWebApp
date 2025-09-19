import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Clock } from 'lucide-react';

interface Card {
  id: number;
  name: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface TirthankaraMemoryGameProps {
  onClose: () => void;
}

export default function TirthankaraMemoryGame({ onClose }: TirthankaraMemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // NOTE: Using emoji placeholders for Digambar emblems; replace with authoritative SVGs/icons if required.
  // TODO: Verify Digambar society emblems and replace these emoji placeholders with exact icons.
  const tirthankaras = [
    { name: "ऋषभनाथ", symbol: "🐂" }, // 1
    { name: "अजितनाथ", symbol: "🐘" }, // 2
    { name: "संभवानाथ", symbol: "🐎" }, // 3
    { name: "अभिनन्दननाथ", symbol: "🐒" }, // 4
    { name: "सुमतिनाथ", symbol: "🕊️" }, // 5 (placeholder)
    { name: "पद्मप्रभु", symbol: "🌸" }, // 6
    { name: "सुपार्श्वनाथ", symbol: "🐍" }, // 7
    { name: "चंद्रप्रभु", symbol: "🌙" }, // 8
    { name: "पूर्ववर्ण", symbol: "🐊" }, // 9 (placeholder)
    { name: "शीतलनाथ", symbol: "❄️" }, // 10 (placeholder)
    { name: "श्रेयांसनाथ", symbol: "🦏" }, // 11 (placeholder)
    { name: "वसुपूज्य", symbol: "🐃" }, // 12 (placeholder)
    { name: "विमलनाथ", symbol: "🐗" }, // 13 (placeholder)
    { name: "अन्तनाथ", symbol: "🦅" }, // 14 (placeholder)
    { name: "धर्मनाथ", symbol: "⚖️" }, // 15 (placeholder)
    { name: "शांतिनाथ", symbol: "🦌" }, // 16
    { name: "कुंथुनाथ", symbol: "🐢" }, // 17 (placeholder)
    { name: "अरानाथ", symbol: "🐠" }, // 18 (placeholder)
    { name: "मल्लिनाथ", symbol: "🌺" }, // 19 (placeholder)
    { name: "मुनिसुव्रतनाथ", symbol: "🐢" }, // 20 (placeholder)
    { name: "नमिनाथ", symbol: "🔷" }, // 21 (placeholder)
    { name: "नेमिनाथ", symbol: "🐚" }, // 22
    { name: "पार्श्वनाथ", symbol: "🐍" }, // 23 (commonly serpent)
    { name: "महावीर", symbol: "🦁" } // 24
  ];

  // Initialize game
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

  // Timer effect
  useEffect(() => {
    if (!gameComplete) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameComplete]);

  const initializeGame = () => {
    const gameCards: Card[] = [];
    tirthankaras.forEach((tirthankara, index) => {
      // Add name card
      gameCards.push({
        id: index * 2,
        name: tirthankara.name,
        symbol: tirthankara.name,
        isFlipped: false,
        isMatched: false
      });
      // Add symbol card
      gameCards.push({
        id: index * 2 + 1,
        name: tirthankara.name,
        symbol: tirthankara.symbol,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
    setTimeElapsed(0);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find(card => card.id === cardId)?.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard && secondCard && firstCard.name === secondCard.name) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.name === firstCard.name ? { ...card, isMatched: true } : card
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is complete
          if (matchedPairs + 1 === tirthankaras.length) {
            setGameComplete(true);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <p className="text-lg text-maroon-600 mb-4">आपने सभी तीर्थंकरों को सफलतापूर्वक मिलाया!</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">समय:</span>
                <span className="font-semibold text-maroon-800">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">चालें:</span>
                <span className="font-semibold text-maroon-800">{moves}</span>
              </div>
            </div>
            
            <p className="text-maroon-600">
              {moves <= tirthankaras.length ? "उत्कृष्ट! आपकी स्मृति बहुत तेज है।" :
               moves <= tirthankaras.length * 1.5 ? "बहुत अच्छा! आपने अच्छा प्रदर्शन किया।" :
               "अच्छी कोशिश! अभ्यास से आप और बेहतर हो सकते हैं।"}
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
  className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
  style={{ marginTop: headerHeight ? headerHeight + 12 : undefined, maxHeight: `calc(100vh - ${headerHeight || 0}px)`, overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-maroon-800">तीर्थंकर स्मृति खेल</h3>
            <p className="text-maroon-600">तीर्थंकरों के नाम और प्रतीकों को मिलाएं</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div>चालें: {moves}</div>
              <div>जोड़े: {matchedPairs}/{tirthankaras.length}</div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        {/* denser responsive grid for 24 tirthankaras (48 cards) - smaller tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-6">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-md border-2 cursor-pointer transition-all duration-200 flex items-center justify-center p-1 ${
                card.isMatched
                  ? 'border-green-500 bg-green-50'
                  : card.isFlipped || flippedCards.includes(card.id)
                  ? 'border-saffron-500 bg-saffron-50'
                  : 'border-gray-300 bg-gray-100 hover:border-saffron-300'
              }`}
            >
              {card.isMatched || card.isFlipped || flippedCards.includes(card.id) ? (
                <div className="text-center">
                      {/* Show either name (small) or symbol (large), never both */}
                      {card.symbol.match(/^[\u0900-\u097F]+$/) ? (
                        <div className="mb-1 text-xs sm:text-sm md:text-base leading-tight">{card.symbol}</div>
                      ) : (
                        <div className="mb-1 text-4xl sm:text-5xl md:text-6xl leading-none">{card.symbol}</div>
                      )}
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl text-gray-400">?</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h5 className="font-semibold text-blue-800 mb-2">खेल के नियम:</h5>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• दो कार्ड पर क्लिक करें</li>
            <li>• तीर्थंकर के नाम और उनके प्रतीक को मिलाएं</li>
            <li>• सभी जोड़े मिलाने पर खेल समाप्त हो जाएगा</li>
            <li>• कम चालों में खेल पूरा करने की कोशिश करें</li>
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
