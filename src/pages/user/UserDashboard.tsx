import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Trophy,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  Play,
  Award,
  Target,
  TrendingUp,
  Pause,
  ArrowRight,
  Zap,
  Medal,
  Timer,
  ChevronRight
} from 'lucide-react';

interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  registered: boolean;
  score?: number;
  rank?: number;
  progress?: number; // For ongoing competitions
}

const UserDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registeredCompetitions, setRegisteredCompetitions] = useState<Set<string>>(new Set());
  const [ongoing, setOngoing] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ TotalCompetitions: 0, Completed: 0, AverageScore: 0, BestRank: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const svcQuiz = (await import('../../services/quizService')).quizService as any;
        const svcComp = (await import('../../services/competitionService')).competitionService as any;
        const [og, ac, up, comp, st] = await Promise.all([
          svcQuiz.getOngoing?.() || { success: true, attempts: [] },
          svcComp.getActiveForUser?.() || { success: true, competitions: [] },
          svcComp.getUpcomingForUser?.() || { success: true, competitions: [] },
          svcQuiz.getCompleted?.() || { success: true, attempts: [] },
          svcQuiz.getUserStats?.() || { success: true, stats: { TotalCompetitions: 0, Completed: 0, AverageScore: 0, BestRank: 0 } },
        ]);
        setOngoing(og.attempts || []);
        setActive(ac.competitions || []);
        setUpcoming(up.competitions || []);
        setCompleted(comp.attempts || []);
        setStats(st.stats || {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStartQuiz = async (competitionId: string) => {
    // Redirect to competition detail view as per requirement
    navigate(`/competitions/${competitionId}`);
  };

  const handleContinueQuiz = (attemptId: string) => {
    navigate(`/quiz/${attemptId}`);
  };


  const competitions: Competition[] = [
    {
      id: '1',
      title: language === 'hi' ? 'जैन धर्म मूल सिद्धांत' : 'Jain Dharma Fundamentals',
      description: language === 'hi' ? 'जैन धर्म के मूलभूत सिद्धांतों पर आधारित प्रश्नोत्तरी' : 'Quiz based on fundamental principles of Jainism',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      duration: 30,
      totalQuestions: 25,
      difficulty: 'Medium',
      participants: 234,
      maxParticipants: 500,
      status: 'upcoming',
      registered: false
    },
    {
      id: '2',
      title: language === 'hi' ? 'तीर्थंकर महावीर जीवन चरित्र' : 'Life of Tirthankara Mahavira',
      description: language === 'hi' ? 'भगवान महावीर के जीवन और शिक्षाओं पर प्रश्नोत्तरी' : 'Quiz on the life and teachings of Lord Mahavira',
      startDate: '2024-01-10',
      endDate: '2024-01-25',
      duration: 45,
      totalQuestions: 30,
      difficulty: 'Hard',
      participants: 156,
      maxParticipants: 300,
      status: 'active',
      registered: true,
      progress: 65 // 65% completed
    },
    {
      id: '3',
      title: language === 'hi' ? 'जैन त्योहार और परंपराएं' : 'Jain Festivals and Traditions',
      description: language === 'hi' ? 'जैन त्योहारों और सांस्कृतिक परंपराओं पर आधारित' : 'Based on Jain festivals and cultural traditions',
      startDate: '2023-12-20',
      endDate: '2023-12-25',
      duration: 25,
      totalQuestions: 20,
      difficulty: 'Easy',
      participants: 445,
      maxParticipants: 500,
      status: 'completed',
      registered: true,
      score: 85,
      rank: 12
    }
  ];

  const handleRegisterForCompetition = (competitionId: string) => {
    setRegisteredCompetitions(prev => new Set([...prev, competitionId]));
  };



  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-saffron-600 bg-saffron-100 border-saffron-200';
      case 'Medium': return 'text-gold-600 bg-gold-100 border-gold-200';
      case 'Hard': return 'text-maroon-600 bg-maroon-100 border-maroon-200';
      default: return 'text-maroon-600 bg-cream-100 border-cream-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-gold-600 bg-gold-100 border-gold-200';
      case 'active': return 'text-saffron-600 bg-saffron-100 border-saffron-200';
      case 'completed': return 'text-maroon-600 bg-cream-200 border-cream-300';
      default: return 'text-maroon-600 bg-cream-100 border-cream-200';
    }
  };

  // Map backend data into the three sections
  const activeCompetitions = active.map((c:any)=>({
    id: c.CompetitionID,
    title: c.Title,
    description: c.DescriptionHindi || c.Description,
    startDate: c.StartDate,
    endDate: c.EndDate,
    duration: c.TimeLimitMinutes || 0,
    totalQuestions: c.TotalQuestions || 0,
    difficulty: c.DifficultyLevel || 'Medium',
    participants: c.ParticipantsCount || 0,
    maxParticipants: c.MaxParticipants || 0,
    status: 'active',
    registered: true,
    progress: undefined,
  }));

  const upcomingCompetitions = upcoming.map((c:any)=>({
    id: c.CompetitionID,
    title: c.Title,
    description: c.DescriptionHindi || c.Description,
    startDate: c.StartDate,
    endDate: c.EndDate,
    duration: c.TimeLimitMinutes || 0,
    totalQuestions: c.TotalQuestions || 0,
    difficulty: c.DifficultyLevel || 'Medium',
    participants: c.ParticipantsCount || 0,
    maxParticipants: c.MaxParticipants || 0,
    status: 'upcoming',
    registered: false,
  }));

  const stripHtml = (s?: string) => (s || '').replace(/<[^>]*>/g, '').trim();

  const ongoingCompetitions = ongoing.map((o:any)=>({
    id: o.AttemptID,
    attemptId: o.AttemptID,
    competitionId: o.CompetitionID,
    title: o.TitleHindi || o.Title,
    description: stripHtml(o.DescriptionHindi || o.Description),
    startDate: o.StartDate,
    endDate: o.EndDate,
    duration: o.TimeLimitMinutes || 0,
    totalQuestions: o.TotalQuestions || 0,
    completedQuestions: o.AnsweredCount || 0,
    difficulty: o.DifficultyLevel || 'Medium',
    participants: o.ParticipantsCount || 0,
    maxParticipants: 0,
    status: 'ongoing',
    registered: true,
    progress: Math.round(((o.CurrentQuestionIndex||0) / Math.max(1,(o.TotalQuestions||1))) * 100)
  }));

  const completedCompetitions = completed.map((o:any)=>({
    id: o.AttemptID,
    title: o.TitleHindi || o.Title,
    description: stripHtml(o.DescriptionHindi || o.Description),
    startDate: o.StartDate,
    endDate: o.EndTime || o.EndDate,
    duration: o.TimeLimitMinutes || 0,
    totalQuestions: o.TotalQuestions || 0,
    difficulty: o.DifficultyLevel || 'Medium',
    participants: o.ParticipantsCount || 0,
    maxParticipants: 0,
    status: 'completed',
    registered: true,
    score: o.TotalQuestions ? Math.round(((o.CorrectAnswers||0) / Math.max(1,(o.TotalQuestions||1))) * 100) : undefined,
    rank: undefined,
  }));

  return (
    <div className="min-h-screen guruji-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-l-8 border-gradient-to-b from-saffron-500 to-gold-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-saffron-100 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gold-100 to-transparent rounded-full -ml-12 -mb-12"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-maroon-800 to-saffron-600 bg-clip-text text-transparent mb-3">
                {language === 'hi' ? `नमस्कार, ${user?.name}` : `Welcome back, ${user?.name}`}
              </h1>
              <p className="text-maroon-600 text-lg">
                {language === 'hi'
                  ? 'आपके आध्यात्मिक ज्ञान की यात्रा जारी रखें'
                  : 'Continue your spiritual knowledge journey'
                }
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 bg-saffron-100 px-4 py-2 rounded-full">
                  <Medal className="h-5 w-5 text-saffron-600" />
                  <span className="text-saffron-700 font-semibold">Level: Seeker</span>
                </div>
                <div className="flex items-center space-x-2 bg-gold-100 px-4 py-2 rounded-full">
                  <Zap className="h-5 w-5 text-gold-600" />
                  <span className="text-gold-700 font-semibold">Streak: 5 days</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-saffron-400 via-saffron-500 to-gold-500 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-maroon-600 font-medium">{language === 'hi' ? 'कुल प्रतियोगिताएं' : 'Total Competitions'}</p>
                <p className="text-3xl font-bold text-maroon-800">{stats?.TotalCompetitions ?? 0}</p>
                <p className="text-xs text-green-600 font-medium mt-1">&nbsp;</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-maroon-600 font-medium">{language === 'hi' ? 'पूर्ण किए गए' : 'Completed'}</p>
                <p className="text-3xl font-bold text-maroon-800">{stats?.Completed ?? 0}</p>
                <p className="text-xs text-green-600 font-medium mt-1">&nbsp;</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-maroon-600 font-medium">{language === 'hi' ? 'औसत स्कोर' : 'Average Score'}</p>
                <p className="text-3xl font-bold text-maroon-800">{Math.round(stats?.AverageScore ?? 0)}%</p>
                <p className="text-xs text-yellow-600 font-medium mt-1">&nbsp;</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-maroon-600 font-medium">{language === 'hi' ? 'सर्वश्रेष्ठ रैंक' : 'Best Rank'}</p>
                <p className="text-3xl font-bold text-maroon-800">{stats?.BestRank ? `#${stats.BestRank}` : '-'}</p>
                <p className="text-xs text-purple-600 font-medium mt-1">&nbsp;</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>





        {/* Active Competitions with Continue Option */}
        {/* Ongoing Competitions - placed after stats grid with proper spacing */}
        {ongoingCompetitions.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-maroon-800 flex items-center">
                <div className="hidden md:block bg-orange-100 p-2 rounded-full mr-3">
                  <Pause className="w-6 h-6 text-orange-600" />
                </div>
                {language === 'hi' ? 'चल रही प्रतियोगिताएं' : 'Ongoing Competitions'}
              </h2>
              <span className="bg-orange-100 text-orange-700 font-semibold text-xs md:text-sm px-3 py-1 rounded-full">
                {ongoingCompetitions.length} {language === 'hi' ? 'चल रही' : 'Ongoing'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {ongoingCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-l-8 border-orange-500">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border ${getStatusColor('active')}`}>
                          {language === 'hi' ? 'चल रही' : 'ONGOING'}
                        </span>
                        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border ${getDifficultyColor(competition.difficulty)}`}>
                          {competition.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-maroon-800 mb-1 md:mb-2">{competition.title}</h3>
                      <p className="text-maroon-600 text-sm md:text-base leading-relaxed line-clamp-3">{competition.description}</p>
                    </div>
                  </div>

                  {typeof competition.progress === 'number' && (
                    <div className="mb-4 md:mb-6">
                      <div className="flex justify-between items-center mb-1 md:mb-2">
                        <span className="text-xs md:text-sm font-medium text-maroon-700">
                          {language === 'hi' ? 'प्रगति' : 'Progress'}
                        </span>
                        <span className="text-xs md:text-sm font-bold text-maroon-800">{competition.progress}%</span>
                      </div>
                      <div className="w-full bg-cream-200 rounded-full h-2 md:h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 md:h-3 rounded-full transition-all duration-500"
                          style={{ width: `${competition.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="flex items-center text-xs md:text-sm text-maroon-600 bg-cream-50 p-2 md:p-3 rounded-lg">
                      <BookOpen className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.completedQuestions || competition.progress ? Math.round((competition.progress/100)*(competition.totalQuestions||0)) : 0} / {competition.totalQuestions} {language === 'hi' ? 'पूर्ण' : 'Completed'}</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-maroon-600 bg-cream-50 p-2 md:p-3 rounded-lg">
                      <Timer className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.duration && competition.duration > 0 ? `${competition.duration} ${language === 'hi' ? 'मिनट' : 'min'}` : (language === 'hi' ? 'कोई सीमा नहीं' : 'No limit')}</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-maroon-600 bg-cream-50 p-2 md:p-3 rounded-lg">
                      <BookOpen className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.totalQuestions} {language === 'hi' ? 'प्रश्न' : 'questions'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleContinueQuiz(competition.attemptId || competition.id)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 md:space-x-3 shadow-lg"
                  >
                    <Pause className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">{language === 'hi' ? 'क्विज़ जारी रखें' : 'Continue Quiz'}</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Competitions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-maroon-800 flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              {language === 'hi' ? 'सक्रिय प्रतियोगिताएं' : 'Active Competitions'}
            </h2>
            <div className="bg-green-100 px-4 py-2 rounded-full">
              <span className="text-green-700 font-semibold text-sm">
                {activeCompetitions.length} {language === 'hi' ? 'सक्रिय' : 'Active'}
              </span>
            </div>
          </div>

          {activeCompetitions.length > 0 ? (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white rounded-3xl shadow-xl p-8 border-l-8 border-green-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-100 to-transparent rounded-full -mr-10 -mt-10"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(competition.status)}`}>
                          {language === 'hi' ? 'सक्रिय' : 'ACTIVE'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(competition.difficulty)}`}>
                          {competition.difficulty}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-maroon-800 mb-2">{competition.title}</h3>
                      <p className="text-maroon-600 leading-relaxed">{competition.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar for Ongoing Quiz */}
                  {competition.progress && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-maroon-700">
                          {language === 'hi' ? 'प्रगति' : 'Progress'}
                        </span>
                        <span className="text-sm font-bold text-maroon-800">{competition.progress}%</span>
                      </div>
                      <div className="w-full bg-cream-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${competition.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-maroon-500 mt-1">
                        {(competition.completedQuestions || 0) > 0 ? competition.completedQuestions : Math.round((competition.progress / 100) * (competition.totalQuestions || 0))} of {competition.totalQuestions} questions completed
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Timer className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.duration && competition.duration > 0 ? `${competition.duration} ${language === 'hi' ? 'मिनट' : 'min'}` : (language === 'hi' ? 'कोई सीमा नहीं' : 'No limit')}</span>
                    </div>
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <BookOpen className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.totalQuestions} {language === 'hi' ? 'प्रश्न' : 'questions'}</span>
                    </div>
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Users className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.participants} {language === 'hi' ? 'प्रतिभागी' : 'participants'}</span>
                    </div>
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Calendar className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{new Date(competition.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {competition.registered ? (
                    <div className="space-y-3">
                      {competition.progress ? (
                        <button
                          onClick={() => handleContinueQuiz(competition.id)}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Pause className="w-5 h-5" />
                          <span>{language === 'hi' ? 'क्विज़ जारी रखें' : 'Continue Quiz'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(competition.id)}
                          className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Play className="w-5 h-5" />
                          <span>{language === 'hi' ? 'क्विज़ शुरू करें' : 'Start Quiz'}</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegisterForCompetition(competition.id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {language === 'hi' ? 'प्रतियोगिता के लिए पंजीकरण करें' : 'Register for Competition'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-maroon-800 mb-2">
                {language === 'hi' ? 'कोई सक्रिय प्रतियोगिता नहीं' : 'No Active Competitions'}
              </h3>
              <p className="text-maroon-600">
                {language === 'hi' ? 'फिलहाल कोई सक्रिय प्रतियोगिता उपलब्ध नहीं है।' : 'No active competitions are currently available.'}
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Competitions */}
        {upcomingCompetitions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-maroon-800 flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                {language === 'hi' ? 'आगामी प्रतियोगिताएं' : 'Upcoming Competitions'}
              </h2>
              <div className="bg-blue-100 px-4 py-2 rounded-full">
                <span className="text-blue-700 font-semibold text-sm">
                  {upcomingCompetitions.length} {language === 'hi' ? 'आगामी' : 'Upcoming'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white rounded-3xl shadow-xl p-8 border-l-8 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -mr-10 -mt-10"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(competition.status)}`}>
                          {language === 'hi' ? 'आगामी' : 'UPCOMING'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(competition.difficulty)}`}>
                          {competition.difficulty}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-maroon-800 mb-2">{competition.title}</h3>
                      <p className="text-maroon-600 leading-relaxed">{competition.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Calendar className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{new Date(competition.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Timer className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.duration && competition.duration > 0 ? `${competition.duration} ${language === 'hi' ? 'मिनट' : 'min'}` : (language === 'hi' ? 'कोई सीमा नहीं' : 'No limit')}</span>
                    </div>
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <BookOpen className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.totalQuestions} {language === 'hi' ? 'प्रश्न' : 'questions'}</span>
                    </div>
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Target className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.difficulty}</span>
                    </div>
                  </div>

                  {/* Registration Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-maroon-600 mb-2">
                      <span className="font-medium">{language === 'hi' ? 'पंजीकरण प्रगति' : 'Registration Progress'}</span>
                      <span className="font-bold">{competition.participants}/{competition.maxParticipants}</span>
                    </div>
                    <div className="w-full bg-cream-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-saffron-500 to-gold-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(competition.participants / competition.maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {registeredCompetitions.has(competition.id) ? (
                    <div className="w-full bg-green-100 text-green-800 py-4 px-6 rounded-xl font-bold text-center flex items-center justify-center space-x-3 border-2 border-green-200">
                      <CheckCircle className="w-5 h-5" />
                      <span>{language === 'hi' ? 'सफलतापूर्वक पंजीकृत' : 'Successfully Registered'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegisterForCompetition(competition.id)}
                      className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {language === 'hi' ? 'प्रतियोगिता के लिए पंजीकरण करें' : 'Register for Competition'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Competitions */}
        {completedCompetitions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-maroon-800 flex items-center">
                <div className="bg-gray-100 p-2 rounded-full mr-3">
                  <Trophy className="w-6 h-6 text-gray-600" />
                </div>
                {language === 'hi' ? 'पूर्ण की गई प्रतियोगिताएं' : 'Completed Competitions'}
              </h2>
              <div className="bg-gray-100 px-4 py-2 rounded-full">
                <span className="text-gray-700 font-semibold text-sm">
                  {completedCompetitions.length} {language === 'hi' ? 'पूर्ण' : 'Completed'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white rounded-3xl shadow-xl p-8 border-l-8 border-gray-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-100 to-transparent rounded-full -mr-10 -mt-10"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(competition.status)}`}>
                          {language === 'hi' ? 'पूर्ण' : 'COMPLETED'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(competition.difficulty)}`}>
                          {competition.difficulty}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-maroon-800 mb-2">{competition.title}</h3>
                      <p className="text-maroon-600 leading-relaxed">{competition.description}</p>
                    </div>
                  </div>

                  {competition.score && competition.rank && (
                    <div className="bg-gradient-to-r from-saffron-50 to-gold-50 rounded-2xl p-6 mb-6 border border-saffron-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="bg-saffron-100 p-2 rounded-full">
                            <TrendingUp className="w-5 h-5 text-saffron-600" />
                          </div>
                          <div>
                            <span className="text-sm text-maroon-600 font-medium">
                              {language === 'hi' ? 'आपका स्कोर' : 'Your Score'}
                            </span>
                            <div className="text-2xl font-bold text-maroon-800">{competition.score}%</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gold-100 p-2 rounded-full">
                            <Award className="w-5 h-5 text-gold-600" />
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-maroon-600 font-medium">
                              {language === 'hi' ? 'रैंक' : 'Rank'}
                            </span>
                            <div className="text-2xl font-bold text-maroon-800">#{competition.rank}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Calendar className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{new Date(competition.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-maroon-600 bg-cream-50 p-3 rounded-lg">
                      <Users className="w-4 h-4 mr-2 text-saffron-600" />
                      <span className="font-medium">{competition.participants} {language === 'hi' ? 'प्रतिभागी' : 'participants'}</span>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 py-4 px-6 rounded-xl font-bold cursor-not-allowed"
                    aria-disabled="true"
                    title={language === 'hi' ? 'परिणाम जल्द ही उपलब्ध होंगे' : 'Results will be available soon'}
                  >
                    {language === 'hi' ? 'परिणाम देखें' : 'View Results'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;