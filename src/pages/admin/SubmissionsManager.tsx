import React, { useEffect, useState } from 'react';
import { Calendar, Users, Trophy, CheckCircle } from 'lucide-react';

export default function SubmissionsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const svc = (await import('../../services/competitionService')).competitionService as any;
        const res = await svc.getCompetitions(1, 50);
        if (res.success) {
          setItems((res.competitions || []).map((c: any) => ({
            id: c.CompetitionID,
            title: c.TitleHindi || c.Title,
            description: c.DescriptionHindi || c.Description,
            startDate: c.StartDate,
            endDate: c.EndDate,
            participants: (c as any).ParticipantsCount || 0,
            status: (c.Status || 'Draft').toLowerCase(),
            totalQuestions: c.TotalQuestions || 0,
            resultAnnounceDate: (c as any).ResultAnnounceDate || null,
          })));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDeclare = async (competitionId: string) => {
    const svc = (await import('../../services/competitionService')).competitionService as any;
    const res = await svc.declareResult(competitionId);
    if (res.success) {
      alert('Result declared');
      // Refresh
      const list = await svc.getCompetitions(1, 50);
      if (list.success) {
        setItems((list.competitions || []).map((c: any) => ({
          id: c.CompetitionID,
          title: c.TitleHindi || c.Title,
          description: c.DescriptionHindi || c.Description,
          startDate: c.StartDate,
          endDate: c.EndDate,
          participants: (c as any).ParticipantsCount || 0,
          status: (c.Status || 'Draft').toLowerCase(),
          totalQuestions: c.TotalQuestions || 0,
          resultAnnounceDate: (c as any).ResultAnnounceDate || null,
        })));
      }
    } else {
      alert(res.message || 'Failed to declare result');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-maroon-800 mb-6">Submission Management</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="text-maroon-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((c) => (
              <div key={c.id} className="bg-cream-50 rounded-2xl p-6 border border-cream-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-maroon-800 line-clamp-2">{c.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{c.status}</span>
                </div>
                <p className="text-sm text-maroon-600 mb-4 line-clamp-2">{c.description?.replace(/<[^>]*>/g, '')}</p>
                <div className="space-y-2 text-sm text-maroon-700 mb-4">
                  <div className="flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</span></div>
                  <div className="flex items-center space-x-2"><Users className="h-4 w-4" /><span>{c.participants} participants</span></div>
                  <div className="flex items-center space-x-2"><Trophy className="h-4 w-4" /><span>{c.totalQuestions} questions</span></div>
                  {c.resultAnnounceDate && (
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span>Result declared: {new Date(c.resultAnnounceDate).toLocaleString()}</span></div>
                  )}
                </div>
                <div className="flex space-x-3">
                  {!c.resultAnnounceDate ? (
                    <button onClick={() => handleDeclare(c.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold">Declare Result</button>
                  ) : (
                    <button className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold" disabled>Result Declared</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

