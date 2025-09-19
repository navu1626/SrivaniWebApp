import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, BookOpen, Shield, Play } from 'lucide-react';
import { stripHtmlTags } from '../utils/textUtils';
import { getImageUrl } from '../utils/getImageUrl';

const CompetitionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competition, setCompetition] = useState<any | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const svc = (await import('../services/competitionService')).competitionService as any;
        const res = await svc.getCompetitionById(id);
        if (res.success && res.competition) {
          setCompetition(res.competition);

          // Fetch questions to get total count
          try {
            const questionsRes = await svc.getCompetitionQuestions(id);
            if (questionsRes.success && questionsRes.questions) {
              setTotalQuestions(questionsRes.questions.length);
            }
          } catch (questionsError) {
            console.warn('Failed to fetch questions count:', questionsError);
            // Don't set error for questions count failure, just use 0
          }
        } else {
          setError(res.message || 'Failed to load competition');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load competition');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBeginQuiz = async () => {
    if (!id) return;
    try {
      const svcQuiz = (await import('../services/quizService')).quizService as any;
      const res = await svcQuiz.startQuiz(id);
      const attemptId = res.attemptId || res.attempt?.AttemptID || res.attempt?.attemptId || res.attempt?.id;
      if (res.success && attemptId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/quiz/${attemptId}`);
      } else {
        alert(res.message || 'Unable to start quiz');
      }
    } catch (e: any) {
      alert(e?.message || 'Unable to start quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-cream-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-red-600">{error || 'Not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {competition.BannerImageURL && (
            <img src={getImageUrl(competition.BannerImageURL)} alt="Banner" className="w-full h-56 object-cover" />
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-maroon-800 mb-2">
              {stripHtmlTags(competition.TitleHindi || competition.Title)}
            </h1>
            {competition.DescriptionHindi && (
              <p className="text-maroon-700 text-lg mb-4">{competition.DescriptionHindi}</p>
            )}
            {competition.Description && (
              <div className="text-maroon-700 prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: competition.Description }} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center bg-cream-100 p-4 rounded-xl">
                <Clock className="w-5 h-5 text-saffron-600 mr-2" />
                <div>
                  <div className="text-sm text-maroon-600">Time Limit</div>
                  <div className="font-semibold text-maroon-800">{competition.TimeLimitMinutes || 0} min</div>
                </div>
              </div>
              <div className="flex items-center bg-cream-100 p-4 rounded-xl">
                <BookOpen className="w-5 h-5 text-saffron-600 mr-2" />
                <div>
                  <div className="text-sm text-maroon-600">Total Questions</div>
                  <div className="font-semibold text-maroon-800">{totalQuestions}</div>
                </div>
              </div>
              <div className="flex items-center bg-cream-100 p-4 rounded-xl">
                <Shield className="w-5 h-5 text-saffron-600 mr-2" />
                <div>
                  <div className="text-sm text-maroon-600">Difficulty</div>
                  <div className="font-semibold text-maroon-800">{competition.DifficultyLevel || 'Medium'}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBeginQuiz}
              className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5" />
              <span>{competition?.TitleHindi || competition?.Title || 'Begin Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetail;

