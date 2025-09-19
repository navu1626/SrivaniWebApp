import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Gamepad2, Star, Clock, Users, Play } from 'lucide-react';
import JainTriviaGame from '../components/games/JainTriviaGame';
import TirthankaraMemoryGame from '../components/games/TirthankaraMemoryGame';
import JainWordPuzzleGame from '../components/games/JainWordPuzzleGame';
import MindcraftAdventureGame from '../components/games/MindcraftAdventureGame';
import SnakeAndLadderGame from '../components/games/SnakeAndLadderGame';

interface Game {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  players: string;
  icon: string;
  color: string;
  bgGradient: string;
}

export default function ReligiousGamesPage() {
  const { language } = useLanguage();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games: Game[] = [
    {
      id: 'jain-trivia',
      title: 'Jain Trivia Challenge',
      titleHi: 'जैन ज्ञान प्रश्नोत्तरी',
      description: 'Test your knowledge of Jain principles, history, and teachings through interactive questions.',
      descriptionHi: 'जैन सिद्धांतों, इतिहास और शिक्षाओं के बारे में अपने ज्ञान का परीक्षण करें।',
      difficulty: 'Medium',
      estimatedTime: '10-15 मिनट',
      players: '1 खिलाड़ी',
      icon: '🧠',
      color: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      id: 'snake-ladder',
      title: 'Jain Snake and Ladder',
      titleHi: 'जैन साँप-सीढ़ी',
      description: 'Play the classic Snake and Ladder game with Jain teachings and values.',
      descriptionHi: 'जैन शिक्षाओं और मूल्यों के साथ क्लासिक साँप-सीढ़ी खेलें।',
      difficulty: 'Easy',
      estimatedTime: '10-20 मिनट',
      players: '2+ खिलाड़ी',
      icon: '🎲',
      color: 'from-lime-500 to-green-600',
      bgGradient: 'from-lime-50 to-green-50'
    },
    {
      id: 'tirthankara-memory',
      title: 'Tirthankara Memory Game',
      titleHi: 'तीर्थंकर स्मृति खेल',
      description: 'Match pairs of Tirthankara images and learn about their lives and teachings.',
      descriptionHi: 'तीर्थंकर चित्रों के जोड़े मिलाएं और उनके जीवन और शिक्षाओं के बारे में जानें।',
      difficulty: 'Easy',
      estimatedTime: '5-10 मिनट',
      players: '1 खिलाड़ी',
      icon: '🎯',
      color: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      id: 'jain-word-puzzle',
      title: 'Jain Word Puzzle',
      titleHi: 'जैन शब्द पहेली',
      description: 'Find hidden words related to Jain terminology, festivals, and concepts.',
      descriptionHi: 'जैन शब्दावली, त्योहारों और अवधारणाओं से संबंधित छुपे हुए शब्द खोजें।',
      difficulty: 'Hard',
      estimatedTime: '15-20 मिनट',
      players: '1 खिलाड़ी',
      icon: '🔤',
      color: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-violet-50'
    },
    {
      id: 'ahimsa-adventure',
      title: 'Ahimsa Adventure',
      titleHi: 'अहिंसा साहसिक यात्रा',
      description: 'Navigate through scenarios making choices based on Jain principles of non-violence.',
      descriptionHi: 'अहिंसा के जैन सिद्धांतों के आधार पर विकल्प चुनते हुए परिस्थितियों से गुजरें।',
      difficulty: 'Medium',
      estimatedTime: '20-25 मिनट',
      players: '1 खिलाड़ी',
      icon: '🕊️',
      color: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-amber-50'
    },
    {
      id: 'jain-festival-quiz',
      title: 'Jain Festival Quiz',
      titleHi: 'जैन त्योहार प्रश्नोत्तरी',
      description: 'Learn about Jain festivals, their significance, and traditional celebrations.',
      descriptionHi: 'जैन त्योहारों, उनके महत्व और पारंपरिक उत्सवों के बारे में जानें।',
      difficulty: 'Easy',
      estimatedTime: '8-12 मिनट',
      players: '1 खिलाड़ी',
      icon: '🎉',
      color: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-rose-50'
    },
    {
      id: 'meditation-timer',
      title: 'Meditation Timer',
      titleHi: 'ध्यान टाइमर',
      description: 'Guided meditation sessions with Jain mantras and peaceful background sounds.',
      descriptionHi: 'जैन मंत्रों और शांतिपूर्ण पृष्ठभूमि ध्वनियों के साथ निर्देशित ध्यान सत्र।',
      difficulty: 'Easy',
      estimatedTime: '5-30 मिनट',
      players: '1 खिलाड़ी',
      icon: '🧘',
      color: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-cyan-50'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePlayGame = (game: Game) => {
    if (
      game.id === 'jain-trivia' ||
      game.id === 'tirthankara-memory' ||
      game.id === 'jain-word-puzzle'
    ) {
      setActiveGame(game.id);
    } else if (game.id === 'ahimsa-adventure' || game.id === 'snake-ladder') {
      setSelectedGame(game);
    } else {
      setSelectedGame(game);
    }
  };

  return (
    <div className="min-h-screen guruji-bg-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-saffron-500 to-gold-500 p-4 rounded-full shadow-lg">
              <Gamepad2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-maroon-800 mb-4">
            {language === 'hi' ? 'धार्मिक खेल' : 'Religious Games'}
          </h1>
          <p className="text-xl text-maroon-600 max-w-3xl mx-auto">
            {language === 'hi' 
              ? 'जैन धर्म की शिक्षाओं और सिद्धांतों को मजेदार और इंटरैक्टिव खेलों के माध्यम से सीखें'
              : 'Learn Jain teachings and principles through fun and interactive games'
            }
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${game.bgGradient} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50`}
            >
              {/* Game Icon */}
              <div className="text-center mb-4">
                <div className={`bg-gradient-to-r ${game.color} p-4 rounded-full w-fit mx-auto shadow-lg`}>
                  <span className="text-3xl">{game.icon}</span>
                </div>
              </div>

              {/* Game Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-maroon-800 mb-2">
                  {language === 'hi' ? game.titleHi : game.title}
                </h3>
                <p className="text-maroon-600 text-sm mb-4 line-clamp-3">
                  {language === 'hi' ? game.descriptionHi : game.description}
                </p>

                {/* Game Stats */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {game.estimatedTime}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {game.players}
                  </span>
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={() => handlePlayGame(game)}
                className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                <Play className="w-5 h-5" />
                <span>{language === 'hi' ? 'खेलें' : 'Play Game'}</span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-cream-200">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-3 rounded-full">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-maroon-800 mb-2">
              {language === 'hi' ? 'और भी खेल जल्द आ रहे हैं!' : 'More Games Coming Soon!'}
            </h3>
            <p className="text-maroon-600">
              {language === 'hi' 
                ? 'हम और भी रोचक और शिक्षाप्रद खेल विकसित कर रहे हैं। जल्द ही नए खेलों का आनंद लें।'
                : 'We are developing more engaging and educational games. Stay tuned for new additions!'
              }
            </p>
          </div>
        </motion.div>
      </div>

      {/* Game Modal (Placeholder) */}
      {selectedGame && selectedGame.id === 'ahimsa-adventure' && (
        <MindcraftAdventureGame onClose={() => setSelectedGame(null)} />
      )}
      {selectedGame && selectedGame.id === 'snake-ladder' && (
        <SnakeAndLadderGame onClose={() => setSelectedGame(null)} />
      )}
      {selectedGame && selectedGame.id !== 'ahimsa-adventure' && (
        (() => {
          // compute header height (try CSS var --header-height then fallback to measured header)
          const headerHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '';
          const headerHeight = headerHeightStr ? parseInt(headerHeightStr) || 0 : (() => {
            const h = document.querySelector('header');
            return h ? Math.ceil((h as HTMLElement).getBoundingClientRect().height) : 0;
          })();

          const containerPaddingTop = Math.max(12, headerHeight + 12);
          const modalMaxHeight = `calc(100vh - ${containerPaddingTop + 24}px)`;

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: `${containerPaddingTop}px` }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
                style={{ maxHeight: modalMaxHeight, overflowY: 'auto' }}
              >
              <div className="text-center mb-6">
                <div className={`bg-gradient-to-r ${selectedGame.color} p-4 rounded-full w-fit mx-auto mb-4`}>
                  <span className="text-3xl">{selectedGame.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-maroon-800 mb-2">
                  {language === 'hi' ? selectedGame.titleHi : selectedGame.title}
                </h3>
                <p className="text-maroon-600">
                  {language === 'hi' 
                    ? 'यह खेल विकसित किया जा रहा है। जल्द ही उपलब्ध होगा!'
                    : 'This game is under development. Coming soon!'
                  }
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="flex-1 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  {language === 'hi' ? 'सूचना पाएं' : 'Get Notified'}
                </button>
              </div>
              </motion.div>
            </div>
          );
        })()
      )}
      {activeGame === 'jain-trivia' && (
        <JainTriviaGame onClose={() => setActiveGame(null)} />
      )}
      {activeGame === 'tirthankara-memory' && (
        <TirthankaraMemoryGame onClose={() => setActiveGame(null)} />
      )}
      {activeGame === 'jain-word-puzzle' && (
        <JainWordPuzzleGame onClose={() => setActiveGame(null)} />
      )}
    </div>
  );
}
