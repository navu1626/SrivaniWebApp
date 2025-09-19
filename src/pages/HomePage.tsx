import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Trophy, Users, Sparkles, Heart, Star,
  BookOpen, Award, ChevronRight, Play, ArrowRight, Zap, Target, Crown,
  Sun, Moon, Flame, Gem, Compass, Eye, Flower, Leaf,
  Mountain, Shield
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import FloatingSymbols from '../components/FloatingSymbols';
import { competitionService } from '../services/competitionService';
import type { Competition } from '../services/api';
import { stripHtmlTags } from '../utils/textUtils';
import { getImageUrl } from '../utils/getImageUrl';

export default function HomePage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for competitions
  const [activeCompetitions, setActiveCompetitions] = useState<Competition[]>([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<Competition[]>([]);
  const [completedCompetitions, setCompletedCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Horizontal row refs for carousels
  const activeRowRef = useRef<HTMLDivElement | null>(null);
  const upcomingRowRef = useRef<HTMLDivElement | null>(null);
  const completedRowRef = useRef<HTMLDivElement | null>(null);

  const scrollRowBy = (ref: any, dir: 'left' | 'right') => {
    const el = ref?.current as HTMLDivElement | null;
    if (!el) return;
    const card = el.querySelector('[data-card]') as HTMLElement | null;
    const delta = card ? (card.offsetWidth + 16) * (window.innerWidth >= 1024 ? 3 : 1) : el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'right' ? delta : -delta, behavior: 'smooth' });
  };

  // Animation values
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Custom floating images
  const customFloatingImages: string[] = [
    // We can add custom images here if needed
  ];

  // Fetch competitions data
  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      try {
        const [activeRes, upcomingRes, completedRes] = await Promise.all([
          competitionService.getCompetitionsByStatus('Active', 20),
          competitionService.getCompetitionsByStatus('Upcoming', 20),
          competitionService.getCompetitionsByStatus('Completed', 20)
        ]);

        if (activeRes.success) setActiveCompetitions(activeRes.competitions);
        if (upcomingRes.success) setUpcomingCompetitions(upcomingRes.competitions);
        if (completedRes.success) setCompletedCompetitions(completedRes.competitions);
      } catch (error) {
        console.error('Failed to fetch competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Handle participate button click
  const handleParticipate = (competitionId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate(`/competitions/${competitionId}`);
  };

  // Handle start competition button click - scroll to active competitions section
  const handleStartCompetition = () => {
    const activeSection = document.getElementById('active-competitions');
    if (activeSection) {
      activeSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Floating symbols data
  const floatingSymbols = [
    { icon: Flower, color: '#FF6B35', size: 24 },
    { icon: Star, color: '#FFD700', size: 20 },
    { icon: Flower, color: '#EA580C', size: 18 },
    { icon: Leaf, color: '#F59E0B', size: 22 },
    { icon: Star, color: '#8B0000', size: 16 },
    { icon: Heart, color: '#DC2626', size: 20 },
  ];

  return (
    <div className="min-h-screen guruji-bg relative">
      {/* Enhanced floating symbols */}
      <FloatingSymbols count={40} customImages={customFloatingImages} />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-saffron-300/20 to-orange-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-gold-400/15 to-yellow-400/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 75, 0],
            y: [0, -75, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-red-300/10 to-pink-300/10 rounded-full blur-2xl"
        />

        {/* Sacred geometry patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-saffron-300/30 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-48 h-48 border border-gold-300/30 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/3 w-32 h-32 border border-maroon-300/30 rounded-full"></div>
        </div>
      </div>

      {/* Hero Section with Guruji background */}
      <motion.section
        style={{ y: y1 }}
        className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden"
      >
        {/* Guruji background is already applied via the guruji-bg class on the parent div */}
        {/* We don't need to apply it again here to avoid making it too loud */}

        {/* Animated sacred patterns */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,215,0,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255,165,0,0.2) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, rgba(139,69,19,0.1) 0%, transparent 50%)`,
            backgroundSize: '100% 100%',
          }}
        />

        <div className="relative max-w-7xl mx-auto text-center z-10">
          {/* Main title with sophisticated animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-maroon-800 via-saffron-700 to-gold-600 bg-clip-text text-transparent mb-6 leading-none"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {t('app.title')}
            </motion.h1>

            {/* Animated decorative line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="h-1 bg-gradient-to-r from-transparent via-saffron-500 to-transparent mx-auto max-w-md"
            />
          </motion.div>

          {/* Subtitle with spiritual essence */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-maroon-800 mb-8 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            {language === 'hi'
              ? 'जैन धर्मज्ञान एवं अध्यात्म की आधुनिक प्रश्नोत्तरी यात्रा'
              : 'A modern spiritual journey of knowledge and wisdom'
            }
          </motion.p>

          {/* Enhanced CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              onClick={handleStartCompetition}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(255,107,53,0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden bg-gradient-to-r from-saffron-500 via-orange-500 to-gold-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl border border-orange-400/50"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-saffron-400 via-orange-400 to-gold-400"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5" />
                {language === 'hi' ? 'प्रतियोगिता शुरू करें' : 'Start Competition'}
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/about')}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(251,191,36,0.1)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group border-2 border-saffron-500 text-saffron-700 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {language === 'hi' ? 'और जानें' : 'Learn More'}
              </span>
            </motion.button>
          </motion.div>

          {/* Floating stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: BookOpen, title: language === 'hi' ? 'धार्मिक ज्ञान' : 'Religious Knowledge', description: language === 'hi' ? 'प्राचीन ग्रंथों से प्रेरित' : 'Inspired by ancient texts' },
              { icon: Trophy, title: language === 'hi' ? 'प्रतियोगिताएं' : 'Competitions', description: language === 'hi' ? 'विविध विषयों पर' : 'On various subjects' },
              { icon: Award, title: language === 'hi' ? 'प्रमाणपत्र' : 'Certificates', description: language === 'hi' ? 'उपलब्धि की पहचान' : 'Recognition of achievement' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.05,
                  rotateY: 10,
                  boxShadow: "0 15px 35px rgba(255,107,53,0.2)"
                }}
                className="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/50 shadow-xl"
              >
                <stat.icon className="w-8 h-8 text-saffron-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-maroon-800 mb-1">{stat.title}</div>
                <div className="text-saffron-700 text-sm">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronRight className="w-8 h-8 text-saffron-600 rotate-90" />
        </motion.div>
      </motion.section>

      {/* Features Section - Completely Redesigned */}
      <motion.section
        style={{ y: y2 }}
        className="relative py-20 px-4"
      >
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-cream-50/60 to-saffron-50/80" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-maroon-800 to-saffron-700 bg-clip-text text-transparent mb-4">
              {language === 'hi' ? 'मुख्य विशेषताएं' : 'Key Features'}
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {language === 'hi'
                ? 'आधुनिक तकनीक के साथ पारंपरिक ज्ञान का मिश्रण'
                : 'Blending traditional wisdom with modern technology'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Calendar,
                title: language === 'hi' ? 'नियमित प्रतियोगिताएं' : 'Regular Competitions',
                description: language === 'hi' ? 'धार्मिक ज्ञान पर आधारित साप्ताहिक प्रतियोगिताएं' : 'Weekly competitions based on religious knowledge',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-50'
              },
              {
                icon: Trophy,
                title: language === 'hi' ? 'पुरस्कार और सम्मान' : 'Awards & Recognition',
                description: language === 'hi' ? 'विजेताओं के लिए डिजिटल प्रमाणपत्र और पुरस्कार' : 'Digital certificates and rewards for winners',
                color: 'from-saffron-500 to-orange-500',
                bgColor: 'bg-saffron-50'
              },
              {
                icon: Users,
                title: language === 'hi' ? 'समुदायिक नेटवर्क' : 'Community Network',
                description: language === 'hi' ? 'विश्वव्यापी जैन समुदाय से जुड़ें' : 'Connect with global Jain community',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-50'
              },
              {
                icon: Sparkles,
                title: language === 'hi' ? 'इंटरैक्टिव अनुभव' : 'Interactive Experience',
                description: language === 'hi' ? 'आकर्षक मल्टीमीडिया प्रश्नोत्तरी' : 'Engaging multimedia quizzes',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.1)"
                }}
                className={`${feature.bgColor} rounded-3xl p-8 border border-white/50 shadow-xl backdrop-blur-sm group cursor-pointer relative overflow-hidden`}
              >
                {/* Animated background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow relative z-10`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-saffron-700 transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors relative z-10">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="mt-6 flex items-center text-saffron-600 font-semibold relative z-10"
                >
                  <span className="mr-2">Learn More</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Competitions Section - Innovative Design */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Animated background with spiritual patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-saffron-50 via-cream-50 to-white">
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,215,0,0.3) 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, rgba(255,165,0,0.2) 0%, transparent 50%),
                               radial-gradient(circle at 40% 40%, rgba(139,69,19,0.1) 0%, transparent 50%)`,
              backgroundSize: '100% 100%',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-3xl font-bold text-center text-maroon-800 mb-12"
          >
            {language === 'hi' ? 'प्रतियोगिताएं' : 'Competitions'}
          </motion.h2>

          {loading ? (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block w-16 h-16 border-4 border-saffron-200 border-t-saffron-600 rounded-full"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-maroon-600 text-lg"
              >
                {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
              </motion.p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Active Competitions Card */}
              <motion.div
                id="active-competitions"
                initial={{ opacity: 0, x: -100, rotateY: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="group relative"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-br from-white/80 to-saffron-50/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-saffron-200/50 h-full relative overflow-hidden"
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-24 h-24 border border-saffron-300/30 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 border border-saffron-300/30 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-saffron-300/20 rounded-full"></div>
                  </div>

                  {/* Header with icon and title */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-saffron-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-maroon-800">
                          {language === 'hi' ? 'सक्रिय प्रतियोगिताएं' : 'Active Competitions'}
                        </h3>
                        <p className="text-saffron-600 text-sm font-medium">
                          {language === 'hi' ? 'अभी भाग लें' : 'Join Now'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-saffron-100 text-saffron-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {activeCompetitions.length}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => scrollRowBy(activeRowRef, 'left')} className="inline-flex p-2 rounded-full bg-saffron-100 text-saffron-700 hover:bg-saffron-200 shadow z-20">◀</button>
                      <button onClick={() => scrollRowBy(activeRowRef, 'right')} className="inline-flex p-2 rounded-full bg-saffron-100 text-saffron-700 hover:bg-saffron-200 shadow z-20">▶</button>
                    </div>
                    <div ref={activeRowRef} className="flex gap-4 overflow-hidden snap-x snap-mandatory pb-2" style={{ scrollBehavior: 'smooth' }}>
                      {activeCompetitions.map((competition, i) => (
                        <motion.div
                          data-card
                          key={competition.CompetitionID}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(i, 6) * 0.05, type: 'spring' }}
                          whileHover={{ scale: 1.02 }}
                          className="min-w-[260px] max-w-[280px] snap-start bg-saffron-50/50 rounded-xl p-4 border border-saffron-200/30"
                        >
          {competition.BannerImageURL && (
                            <div className="mb-3 -mx-1">
                              <img
            src={getImageUrl(competition.BannerImageURL)}
                                alt={stripHtmlTags(language === 'hi' && competition.TitleHindi ? competition.TitleHindi : competition.Title)}
                                className="w-[261px] h-[210px] object-cover rounded-md border border-saffron-200/30"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-saffron-200 text-saffron-800 text-xs font-medium px-2 py-1 rounded-full">
                              {competition.DifficultyLevel}
                            </span>
                            <Sparkles className="w-4 h-4 text-saffron-600" />
                          </div>
                          <h4 className="text-sm font-semibold text-maroon-800 mb-2 line-clamp-2">
                            {stripHtmlTags(language === 'hi' && competition.TitleHindi ? competition.TitleHindi : competition.Title)}
                          </h4>
                          <div
                            className="text-xs text-gray-700 mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: language === 'hi' && competition.DescriptionHindi ? competition.DescriptionHindi : competition.Description
                            }}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <span>{competition.TotalQuestions || 0} {language === 'hi' ? 'प्रश्न' : 'Questions'}</span>
                            <span>
                              {competition.HasTimeLimit && competition.TimeLimitMinutes
                                ? `${competition.TimeLimitMinutes} ${language === 'hi' ? 'मिनट' : 'mins'}`
                                : (language === 'hi' ? 'कोई सीमा नहीं' : 'No limit')
                              }
                            </span>
                          </div>
                          <button
                            onClick={() => handleParticipate(competition.CompetitionID)}
                            className="w-full bg-gradient-to-r from-saffron-500 to-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:from-saffron-600 hover:to-orange-600 transition-all duration-300 shadow-sm"
                          >
                            {language === 'hi' ? 'भाग लें' : 'Participate'}
                          </button>
                        </motion.div>
                      ))}
                      {activeCompetitions.length === 0 && (
                        <p className="text-center text-maroon-600 py-4">
                          {language === 'hi' ? 'कोई सक्रिय प्रतियोगिता नहीं' : 'No active competitions'}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Upcoming Competitions Card */}
              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100, delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-br from-white/80 to-gold-50/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gold-200/50 h-full relative overflow-hidden"
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-24 h-24 border border-gold-300/30 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 border border-gold-300/30 rounded-full"></div>
                  </div>

                  {/* Header with icon and title */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-gold-500 to-yellow-500 p-3 rounded-2xl shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-maroon-800">
                          {language === 'hi' ? 'आगामी प्रतियोगिताएं' : 'Upcoming Competitions'}
                        </h3>
                        <p className="text-gold-600 text-sm font-medium">
                          {language === 'hi' ? 'जल्द आ रहा है' : 'Coming Soon'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {upcomingCompetitions.length}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => scrollRowBy(upcomingRowRef, 'left')} className="inline-flex p-2 rounded-full bg-gold-100 text-gold-700 hover:bg-gold-200 shadow z-20">◀</button>
                      <button onClick={() => scrollRowBy(upcomingRowRef, 'right')} className="inline-flex p-2 rounded-full bg-gold-100 text-gold-700 hover:bg-gold-200 shadow z-20">▶</button>
                    </div>
                    <div ref={upcomingRowRef} className="flex gap-4 overflow-hidden snap-x snap-mandatory pb-2" style={{ scrollBehavior: 'smooth' }}>
                      {upcomingCompetitions.map((competition, i) => (
                        <motion.div
                          data-card
                          key={competition.CompetitionID}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(i, 6) * 0.05, type: 'spring' }}
                          whileHover={{ scale: 1.02 }}
                          className="min-w-[260px] max-w-[280px] snap-start bg-gold-50/50 rounded-xl p-4 border border-gold-200/30"
                        >
          {competition.BannerImageURL && (
                            <div className="mb-3 -mx-1">
                              <img
            src={getImageUrl(competition.BannerImageURL)}
                                alt={stripHtmlTags(language === 'hi' && competition.TitleHindi ? competition.TitleHindi : competition.Title)}
                                className="w-[261px] h-[210px] object-cover rounded-md border border-gold-200/30"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-gold-200 text-gold-800 text-xs font-medium px-2 py-1 rounded-full">
                              {competition.DifficultyLevel}
                            </span>
                            <Calendar className="w-4 h-4 text-gold-600" />
                          </div>
                          <h4 className="text-sm font-semibold text-maroon-800 mb-2 line-clamp-2">
                            {stripHtmlTags(language === 'hi' && competition.TitleHindi ? competition.TitleHindi : competition.Title)}
                          </h4>
                          <div
                            className="text-xs text-gray-700 mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: language === 'hi' && competition.DescriptionHindi ? competition.DescriptionHindi : competition.Description
                            }}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <span>{competition.TotalQuestions || 0} {language === 'hi' ? 'प्रश्न' : 'Questions'}</span>
                            <span>
                              {competition.HasTimeLimit && competition.TimeLimitMinutes
                                ? `${competition.TimeLimitMinutes} ${language === 'hi' ? 'मिनट' : 'mins'}`
                                : (language === 'hi' ? 'कोई सीमा नहीं' : 'No limit')
                              }
                            </span>
                          </div>
                          <div className="text-center text-xs text-gold-700 font-medium">
                            {language === 'hi' ? 'जल्द आ रहा है' : 'Coming Soon'}
                          </div>
                        </motion.div>
                      ))}
                      {upcomingCompetitions.length === 0 && (
                        <p className="text-center text-marून-600 py-4">
                          {language === 'hi' ? 'कोई आगामी प्रतियोगिता नहीं' : 'No upcoming competitions'}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Completed Competitions Card */}
              <motion.div
                initial={{ opacity: 0, x: 100, rotateY: 15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100, delay: 0.4 }}
                whileHover={{ scale: 1.05, rotateY: -5 }}
                className="group relative"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-gradient-to-br from-white/80 to-cream-50/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-cream-200/50 h-full relative overflow-hidden"
                >
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-24 h-24 border border-cream-300/30 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 border border-cream-300/30 rounded-full"></div>
                  </div>

                  {/* Header with icon and title */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-maroon-800">
                          {language === 'hi' ? 'पूर्ण प्रतियोगिताएं' : 'Completed Competitions'}
                        </h3>
                        <p className="text-green-600 text-sm font-medium">
                          {language === 'hi' ? 'परिणाम देखें' : 'View Results'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {completedCompetitions.length}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => scrollRowBy(completedRowRef, 'left')} className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow z-20">◀</button>
                      <button onClick={() => scrollRowBy(completedRowRef, 'right')} className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow z-20">▶</button>
                    </div>
                    <div ref={completedRowRef} className="flex gap-4 overflow-hidden snap-x snap-mandatory pb-2" style={{ scrollBehavior: 'smooth' }}>
                      {completedCompetitions.map((competition, i) => (
                        <motion.div
                          data-card
                          key={competition.CompetitionID}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(i, 6) * 0.05, type: 'spring' }}
                          whileHover={{ scale: 1.02 }}
                          className="min-w-[260px] max-w-[280px] snap-start bg-cream-50/50 rounded-xl p-4 border border-cream-200/30"
                        >
          {competition.BannerImageURL && (
                            <div className="mb-3 -mx-1">
                              <img
            src={getImageUrl(competition.BannerImageURL)}
                                alt={stripHtmlTags(language === 'hi' && competition.TitleHindi ? competition.TitleHindi : competition.Title)}
                                className="w-[261px] h-[210px] object-cover rounded-md border border-cream-200/30"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <span className="bg-cream-200 text-maroon-700 text-xs font-medium px-2 py-1 rounded-full">
                              {competition.DifficultyLevel}
                            </span>
                            <Trophy className="w-4 h-4 text-green-600" />
                          </div>
                          <h4 className="text-sm font-semibold text-maroon-800 mb-2 line-clamp-2">
                            {stripHtmlTags(language === 'hi' && competition.TitleHindi ? competition.TitleHindi : competition.Title)}
                          </h4>
                          <div
                            className="text-xs text-gray-700 mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: language === 'hi' && competition.DescriptionHindi ? competition.DescriptionHindi : competition.Description
                            }}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <span>{competition.TotalQuestions || 0} {language === 'hi' ? 'प्रश्न' : 'Questions'}</span>
                            <span>
                              {competition.HasTimeLimit && competition.TimeLimitMinutes
                                ? `${competition.TimeLimitMinutes} ${language === 'hi' ? 'मिनट' : 'mins'}`
                                : (language === 'hi' ? 'कोई सीमा नहीं' : 'No limit')
                              }
                            </span>
                          </div>
                          <div className="text-center text-xs text-green-700 font-medium">
                            {language === 'hi' ? 'पूर्ण हो गया' : 'Completed'}
                          </div>
                        </motion.div>
                      ))}
                      {completedCompetitions.length === 0 && (
                        <p className="text-center text-maroon-600 py-4">
                          {language === 'hi' ? 'कोई पूर्ण प्रतियोगिता नहीं' : 'No completed competitions'}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="bg-saffron-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-saffron-600" />
              </div>
              <h3 className="text-2xl font-bold text-maroon-800 mb-2">
                {language === 'hi' ? 'लॉगिन आवश्यक' : 'Login Required'}
              </h3>
              <p className="text-maroon-600">
                {language === 'hi'
                  ? 'प्रतियोगिता में भाग लेने के लिए कृपया लॉगिन करें या रजिस्टर करें।'
                  : 'Please sign in or register to participate in competitions.'
                }
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login');
                }}
                className="flex-1 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {language === 'hi' ? 'लॉगिन करें' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/register');
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
              >
                {language === 'hi' ? 'रजिस्टर करें' : 'Register'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}