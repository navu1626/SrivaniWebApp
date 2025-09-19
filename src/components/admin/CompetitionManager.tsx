import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Users, Trophy, Copy } from 'lucide-react';
import CompetitionCreator from './CompetitionCreator';
import { stripHtmlTags } from '../../utils/textUtils';

const CompetitionManager: React.FC = () => {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const svc = (await import('../../services/competitionService')).competitionService;
      const res = await svc.getCompetitions(1, 20);
      if (res.success) {
        setCompetitions((res.competitions || []).map((c:any)=>({
          id: c.CompetitionID,
          title: c.Title,
          titleHi: c.TitleHindi,
          description: c.Description,
          descriptionHi: c.DescriptionHindi,
          startDate: c.StartDate,
          endDate: c.EndDate,
          participants: c.ParticipantsCount || 0,
          status: (c.Status || 'Draft').toLowerCase(),
          type: 'mixed',
          questions: c.TotalQuestions || 0,
          hasTimeLimit: c.HasTimeLimit,
          timeLimitMinutes: c.TimeLimitMinutes,
          questionsPerPage: c.QuestionsPerPage,
          difficultyLevel: c.DifficultyLevel,
          allowedQuestionTypes: c.AllowedQuestionTypes
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(()=>{ loadCompetitions(); },[]);

  const handleSaveCompetition = async (competition: any) => {
    try {
      console.log('=== FRONTEND CREATE DEBUG ===');
      console.log('Competition data received:', competition);
      console.log('Questions:', competition.questions);

      const payload = {
        title: competition.title,
        titleHi: competition.titleHi,
        description: competition.description,
        descriptionHi: competition.descriptionHi,
        bannerImageUrl: competition.bannerImage,
        startDate: competition.startDate,
        endDate: competition.endDate,
        hasTimeLimit: competition.hasTimeLimit,
        timeLimitMinutes: competition.timeLimitMinutes,
        questionsPerPage: competition.questionsPerPage,
        allowedQuestionTypes: competition.questionTypes.map((t:string)=>t.toUpperCase()).join(','),
        difficultyLevel: 'Medium',
        status: 'Draft',
        questions: competition.questions.map((q:any)=>({
          id: (typeof q.id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(q.id) ? q.id : undefined),
          type: q.type,
          question: q.question,
          questionHi: q.questionHi,
          options: q.options,
          optionsHi: q.optionsHi,
          correctAnswer: q.correctAnswer,
          points: q.points,
          timeLimit: q.timeLimit,
          imageUrl: q.image || q.imageUrl
        }))
      };

      console.log('Payload being sent:', payload);

      const resp = await (await import('../../services/competitionService')).competitionService.createCompetition(payload);

      if (resp.success) {
        alert('Competition created successfully!');
        setShowCreateForm(false);
        await loadCompetitions();
      } else {
        alert(resp.message || 'Failed to create competition');
      }
    } catch (e:any) {
      alert(e?.message || 'Failed to create competition');
    }
  };

  const handleViewCompetition = (competition: any) => {
    console.log('View competition data:', competition);
    setSelectedCompetition(competition);
    setShowViewModal(true);
  };

  const handleEditCompetition = (competition: any) => {
    console.log('Edit competition data:', competition);
    setSelectedCompetition(competition);
    setShowEditForm(true);
  };

  const handleUpdateCompetition = async (updatedCompetition: any) => {
    try {
      console.log('=== FRONTEND UPDATE DEBUG ===');
      console.log('Updated competition data received:', updatedCompetition);
      console.log('Questions:', updatedCompetition.questions);
      console.log('Selected competition ID:', selectedCompetition.id);

      const updateData = {
        title: updatedCompetition.title,
        titleHi: updatedCompetition.titleHi,
        description: updatedCompetition.description,
        descriptionHi: updatedCompetition.descriptionHi,
        bannerImageUrl: updatedCompetition.bannerImage,
        startDate: updatedCompetition.startDate,
        endDate: updatedCompetition.endDate,
        hasTimeLimit: updatedCompetition.hasTimeLimit,
        timeLimitMinutes: updatedCompetition.timeLimitMinutes,
        questionsPerPage: updatedCompetition.questionsPerPage,
        allowedQuestionTypes: updatedCompetition.questionTypes?.map((t:string)=>t.toUpperCase()).join(',') || 'MCQ',
        difficultyLevel: updatedCompetition.difficultyLevel || 'Medium',
        status: updatedCompetition.status || 'Draft',
        questions: updatedCompetition.questions?.map((q:any)=>({
          id: (typeof q.id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(q.id) ? q.id : undefined),
          type: q.type,
          question: q.question,
          questionHi: q.questionHi,
          options: q.options,
          optionsHi: q.optionsHi,
          correctAnswer: q.correctAnswer,
          points: q.points,
          timeLimit: q.timeLimit,
          imageUrl: q.image || q.imageUrl
        })) || []
      };

      console.log('Update data being sent:', updateData);

      const resp = await (await import('../../services/competitionService')).competitionService.updateCompetition(selectedCompetition.id, updateData);

      if (resp.success) {
        alert('Competition updated successfully!');
        setShowEditForm(false);
        setSelectedCompetition(null);
        await loadCompetitions();
      } else {
        alert(resp.message || 'Failed to update competition');
      }
    } catch (e:any) {
      alert(e?.message || 'Failed to update competition');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-saffron-100 text-saffron-700';
      case 'upcoming': return 'bg-gold-100 text-gold-700';
      case 'completed': return 'bg-cream-200 text-maroon-700';
      default: return 'bg-cream-200 text-maroon-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'bg-purple-100 text-purple-700';
      case 'descriptive': return 'bg-orange-100 text-orange-700';
      case 'mixed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {loading && (
        <div className="text-maroon-600 mb-4">Loading competitions...</div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-maroon-800 mb-2">Competition Management</h1>
          <p className="text-maroon-600">Create and manage quiz competitions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Create Competition</span>
        </button>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {competitions.map((competition) => (
          <div key={competition.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-maroon-800 line-clamp-2">{stripHtmlTags(competition.title)}</h3>
              <div className="flex space-x-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                  {competition.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(competition.type)}`}>
                  {competition.type}
                </span>
              </div>
            </div>

            <p className="text-maroon-600 text-sm mb-4 line-clamp-2">
              {competition.descriptionHi || competition.description?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
            </p>

            <div className="space-y-2 mb-6 text-sm text-maroon-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{competition.participants} participants</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>{competition.questions} questions</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewCompetition(competition)}
                className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => handleEditCompetition(competition)}
                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1">
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={async ()=>{
                  const svc = (await import('../../services/competitionService')).competitionService;
                  const res = await svc.copyCompetition(competition.id);
                  if (res.success) {
                    alert('Competition copied!');
                    await loadCompetitions();
                  } else {
                    alert(res.message || 'Failed to copy');
                  }
                }}
                className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1">
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={async ()=>{
                  if (!confirm('Delete this competition?')) return;
                  const svc = (await import('../../services/competitionService')).competitionService;
                  const res = await svc.deleteCompetition(competition.id);
                  if (res.success) await loadCompetitions(); else alert(res.message);
                }}
                className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg font-medium transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Competition Modal */}
      {showViewModal && selectedCompetition && (
        <div style={{ top: 'var(--header-height, 4rem)', zIndex: 100000 }} className="fixed left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <h2 className="text-2xl font-bold text-maroon-800">Competition Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCompetition(null);
                }}
                className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">Title (English)</h3>
                  <p className="text-maroon-600">{selectedCompetition.title}</p>
                </div>
                {selectedCompetition.titleHi && (
                  <div>
                    <h3 className="font-semibold text-maroon-700 mb-2">Title (Hindi)</h3>
                    <p className="text-maroon-600">{selectedCompetition.titleHi}</p>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {selectedCompetition.descriptionHi && (
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">Short Description</h3>
                  <p className="text-maroon-600">{selectedCompetition.descriptionHi}</p>
                </div>
              )}

              {/* Full Description */}
              {selectedCompetition.description && (
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">Description</h3>
                  <div
                    className="text-maroon-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedCompetition.description }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">Start Date</h3>
                  <p className="text-maroon-600">{new Date(selectedCompetition.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">End Date</h3>
                  <p className="text-maroon-600">{new Date(selectedCompetition.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCompetition.status)}`}>
                    {selectedCompetition.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">Total Questions</h3>
                  <p className="text-maroon-600">{selectedCompetition.questions}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-maroon-700 mb-2">Participants</h3>
                  <p className="text-maroon-600">{selectedCompetition.participants}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Competition Form */}
      {showEditForm && selectedCompetition && (
        <CompetitionCreator
          onClose={() => {
            setShowEditForm(false);
            setSelectedCompetition(null);
          }}
          onSave={handleUpdateCompetition}
          onPublish={async () => {
            const svc = (await import('../../services/competitionService')).competitionService;
            debugger;
            const resp = await svc.publishCompetition(selectedCompetition.id);
            if (resp.success) {
              // alert('Competition published successfully');
              setShowEditForm(false);
              setSelectedCompetition(null);
              await loadCompetitions();
            } else {
              alert(resp.message || 'Failed to publish competition');
            }
          }}
          initialData={selectedCompetition}
        />
      )}

      {/* Create Competition Form */}
      {showCreateForm && (
        <CompetitionCreator
          onClose={() => setShowCreateForm(false)}
          onSave={handleSaveCompetition}
          onPublish={async (comp) => {
            // After create, find the created item and publish
            await loadCompetitions();
            const latest = competitions[0];
            if (latest) {
              const svc = (await import('../../services/competitionService')).competitionService;
              const resp = await svc.publishCompetition(latest.id);
              if (resp.success) {
                alert('Competition published successfully! Create');
                setShowCreateForm(false);
                await loadCompetitions();
              } else {
                alert(resp.message || 'Failed to publish competition');
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default CompetitionManager;