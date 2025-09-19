import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResultDetailPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const svc = (await import('../services/quizService')).quizService as any;
        const res = await svc.getResultDetail(String(attemptId));
        if (res.success) {
          setData(res.result);
        } else {
          setError(res.message || 'Failed to load result');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load result');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (loading) return <div className="p-6 text-maroon-700">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6 text-maroon-700">No result found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-maroon-800 mb-4">Result</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
        <div className="text-lg font-semibold">{data.TitleHindi || data.Title}</div>
        <div className="text-maroon-700">Attempt ID: {data.AttemptID}</div>
        <div className="text-maroon-700">Total Questions: {data.TotalQuestions}</div>
        <div className="text-maroon-700">Correct Answers: {data.CorrectAnswers}</div>
        {data.Score !== undefined && <div className="text-maroon-700">Score: {data.Score}</div>}
        <div className="text-maroon-700">Completed At: {new Date(data.EndTime).toLocaleString()}</div>
      </div>
      <div className="mt-6">
        <button onClick={() => navigate('/dashboard')} className="bg-maroon-600 hover:bg-maroon-700 text-white px-4 py-2 rounded-lg">Back to Dashboard</button>
      </div>
    </div>
  );
}

