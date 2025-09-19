import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Save,
  Eye,
  Clock,
  Calendar,
  Settings,
  FileSpreadsheet,
  Scan
} from 'lucide-react';
import RichTextEditor from '../common/RichTextEditor';
import { getImageUrl } from '../../utils/getImageUrl';

interface Question {
  id: string;
  type: 'mcq' | 'descriptive';
  question: string;
  questionHi?: string;
  options?: string[];
  optionsHi?: string[];
  correctAnswer?: number;
  points: number;
  image?: string;
  timeLimit?: number;
}

interface Competition {
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  bannerImage?: string;
  startDate: string;
  endDate: string;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number;
  questionTypes: ('mcq' | 'descriptive')[];
  questionsPerPage: number;
  difficultyLevel?: string;
  status?: string;
  questions: Question[];
}

interface CompetitionCreatorProps {
  onClose: () => void;
  onSave: (competition: Competition) => void | Promise<any>;
  onPublish?: (competition: Competition) => void | Promise<any>;
  initialData?: any;
}

const CompetitionCreator: React.FC<CompetitionCreatorProps> = ({ onClose, onSave, initialData, onPublish }) => {
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'preview'>('basic');
  const [competition, setCompetition] = useState<Competition>(() => {
    if (initialData) {
      console.log('CompetitionCreator initialData:', initialData);
      console.log('hasTimeLimit value:', initialData.hasTimeLimit, 'type:', typeof initialData.hasTimeLimit);
      console.log('timeLimitMinutes value:', initialData.timeLimitMinutes, 'type:', typeof initialData.timeLimitMinutes);
      return {
        title: initialData.title || '',
        titleHi: initialData.titleHi || '',
        description: initialData.description || '',
        descriptionHi: initialData.descriptionHi || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
        hasTimeLimit: !!initialData.hasTimeLimit,
        timeLimitMinutes: initialData.timeLimitMinutes || undefined,
        // Map AllowedQuestionTypes (e.g., 'MCQ,Descriptive') to our types
        questionTypes: (initialData.allowedQuestionTypes
          ? initialData.allowedQuestionTypes.split(',').map((t:string)=> t.trim().toLowerCase() === 'mcq' ? 'mcq' : 'descriptive')
          : ['mcq']
        ),
        questionsPerPage: initialData.questionsPerPage || 1,
        difficultyLevel: initialData.difficultyLevel || 'Medium',
        status: initialData.status || 'Draft',
        questions: Array.isArray(initialData.questions) ? initialData.questions : []
      };
    }
    return {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      hasTimeLimit: false,
      questionTypes: ['mcq'],
      questionsPerPage: 1,
      difficultyLevel: 'Medium',
      status: 'Draft',
      questions: []
    };
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    points: 1
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [bulkImportType, setBulkImportType] = useState<'excel' | 'pdf' | null>(null);

  // Validation error states
  const [validationErrors, setValidationErrors] = useState<{
    basicInfo?: string;
    imageUpload?: string;
    questionForm?: string;
    saveCompetition?: string;
  }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Refs for auto-scrolling
  const questionFormRef = useRef<HTMLDivElement>(null);
  const questionListRef = useRef<HTMLDivElement>(null);

  // Pagination state for questions list
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [competition.questionsPerPage, competition.questions.length]);

  // Auto-scroll to question form when editing
  useEffect(() => {
    if (editingQuestionIndex !== null && questionFormRef.current) {
      questionFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [editingQuestionIndex]);

  // Keep questionTypes in sync with initialData.allowedQuestionTypes when editing
  useEffect(() => {
    if (initialData && initialData.allowedQuestionTypes) {
      const mapped = initialData.allowedQuestionTypes
        .split(',')
        .map((t: string) => t.trim().toLowerCase() === 'mcq' ? 'mcq' : 'descriptive');
      setCompetition(prev => ({ ...prev, questionTypes: mapped }));
    }
  }, [initialData?.allowedQuestionTypes]);

  // Load existing questions when editing a competition
  useEffect(() => {
    const loadExistingQuestions = async () => {
      if (initialData && initialData.id) {
        try {
          const competitionService = (await import('../../services/competitionService')).competitionService;
          const result = await competitionService.getCompetitionQuestions(initialData.id);

          if (result.success && Array.isArray(result.questions)) {
            console.log('Raw questions from backend:', result.questions);
            const mapped = result.questions.map((q: any) => {
              console.log('Processing question:', q);

              // The backend returns options and optionsHi directly on the question object
              const options = Array.isArray(q.options) ? q.options : undefined;
              const optionsHi = Array.isArray(q.optionsHi) ? q.optionsHi : undefined;
              const correctAnswer = q.correctAnswer;

              const mappedQuestion = {
                id: q.id || String(q.QuestionID || ''),
                type: (q.type || '').toLowerCase() === 'mcq' ? 'mcq' : 'descriptive',
                question: q.question || q.QuestionText || '',
                questionHi: q.questionHi || q.QuestionTextHindi || '',
                options,
                optionsHi,
                correctAnswer: correctAnswer >= 0 ? correctAnswer : undefined,
                points: q.points ?? q.Points ?? 1,
                image: q.image || q.QuestionImageURL || q.imageUrl,
                timeLimit: q.timeLimit || q.TimeLimitSeconds
              } as Question;

              console.log('Mapped question:', mappedQuestion);
              return mappedQuestion;
            });
            setCompetition(prev => ({
              ...prev,
              questions: mapped
            }));
          }
        } catch (error) {
          console.error('Failed to load existing questions:', error);
          setValidationErrors(prev => ({
            ...prev,
            questionForm: 'Failed to load existing questions. Please try again.'
          }));
        }
      }
    };

    loadExistingQuestions();
  }, [initialData]);

  // Helper function to check if rich text content is empty
  const isRichTextEmpty = (content: string) => {
    if (!content) return true;
    // Remove HTML tags and check if there's actual text content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length === 0;
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors(prev => ({ ...prev, basicInfo: undefined }));

    // Check if at least one language is provided for title and description
    const hasTitle = competition.title?.trim() || competition.titleHi?.trim();
    const hasDescription = !isRichTextEmpty(competition.description) || !isRichTextEmpty(competition.descriptionHi || '');

    if (!hasTitle || !hasDescription || !competition.startDate || !competition.endDate) {
      setValidationErrors(prev => ({
        ...prev,
        basicInfo: 'Please fill in all required fields. At least one language must be provided for title and description.'
      }));
      return;
    }
    setCurrentStep('questions');
  };

  const handleQuestionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setValidationErrors(prev => ({ ...prev, imageUpload: undefined }));

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        imageUpload: 'File size must be less than 5MB'
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationErrors(prev => ({
        ...prev,
        imageUpload: 'Please select a valid image file'
      }));
      return;
    }

    try {
      // Enforce exact 200x200 dimensions
      const dimsOk: boolean = await new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(img.width === 200 && img.height === 200);
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      });
      // if (!dimsOk) {
      //   setValidationErrors(prev => ({ ...prev, imageUpload: 'Image must be exactly 200 × 200 pixels' }));
      //   return;
      // }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Get token from localStorage (using correct key)
      const token = localStorage.getItem('srivani_token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Upload to server using same base URL as axios client
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${baseUrl}/api/v1/upload/question-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Log response details for debugging
      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      if (result.success) {
        const returnedUrl = result.data?.imageUrl || result.data?.url || '';
        const absoluteUrl = /^https?:\/\//i.test(returnedUrl)
          ? returnedUrl
          : `${baseUrl}${returnedUrl.startsWith('/') ? '' : '/'}${returnedUrl}`;
        setCurrentQuestion({
          ...currentQuestion,
          image: absoluteUrl
        });
        // Clear any previous errors
        setValidationErrors(prev => ({ ...prev, imageUpload: undefined }));
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      setValidationErrors(prev => ({
        ...prev,
        imageUpload: errorMessage
      }));
    }
  };

  const handleAddQuestion = () => {
    // Preserve id when editing; only generate new id for new questions
    const newQuestion: Question = (editingQuestionIndex !== null)
      ? currentQuestion
      : { ...currentQuestion, id: Date.now().toString() };

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...competition.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setCompetition({ ...competition, questions: updatedQuestions });
      setEditingQuestionIndex(null);
    } else {
      setCompetition({
        ...competition,
        questions: [...competition.questions, newQuestion]
      });
    }

    setCurrentQuestion({
      id: '',
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      points: 1
    });
    setShowQuestionForm(false);
  };

  const handleEditQuestion = (index: number) => {
    // index is relative to current page; compute global index
    const perPage = competition.questionsPerPage || 1;
    const globalIndex = (currentPage - 1) * perPage + index;
    setCurrentQuestion(competition.questions[globalIndex]);
    setEditingQuestionIndex(globalIndex);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (index: number) => {
    const perPage = competition.questionsPerPage || 1;
    const globalIndex = (currentPage - 1) * perPage + index;
    const updatedQuestions = competition.questions.filter((_, i) => i !== globalIndex);
    setCompetition({ ...competition, questions: updatedQuestions });
  };

  const handleBulkImport = (type: 'excel' | 'pdf') => {
    setBulkImportType(type);
    // This would trigger file upload dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'excel' ? '.xlsx,.xls' : '.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Clear previous errors
        setValidationErrors(prev => ({ ...prev, questionForm: undefined }));

        // TODO: Implement actual file processing
        setValidationErrors(prev => ({
          ...prev,
          questionForm: `Processing ${type} file: ${file.name}. File upload feature will be implemented soon.`
        }));
      }
    };
    input.click();
  };

  const handleSaveCompetition = async (): Promise<any> => {
    // Clear previous errors
    setValidationErrors(prev => ({ ...prev, saveCompetition: undefined }));

    if (competition.questions.length === 0) {
      setValidationErrors(prev => ({
        ...prev,
        saveCompetition: 'Please add at least one question'
      }));
      return Promise.reject(new Error('No questions'));
    }

    try {
      setIsSaving(true);
      const result = onSave(competition);
      // If onSave returns a promise, await it. Otherwise return immediately.
      if (result && typeof (result as any).then === 'function') {
        return await (result as Promise<any>);
      }
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-maroon-800">Basic Information</h2>
        <button
          onClick={() => {
            const ok = window.confirm('Close without saving changes?');
            if (ok) onClose();
          }}
          className="text-maroon-600 hover:text-maroon-800 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
        {validationErrors.basicInfo && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {validationErrors.basicInfo}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">
              Competition Title (Hindi)*
            </label>
            <input
              type="text"
              value={competition.title}
              onChange={(e) => setCompetition({ ...competition, title: e.target.value })}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
              placeholder="प्रतियोगिता का शीर्षक"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">
              Competition Title (English) *
            </label>
            <input
              type="text"
              value={competition.titleHi || ''}
              onChange={(e) => setCompetition({ ...competition, titleHi: e.target.value })}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
              placeholder="Enter competition title"
            />
          </div>
        </div>

        <div>
          <RichTextEditor
            label="Description (English) *"
            value={competition.description}
            onChange={(value) => setCompetition({ ...competition, description: value })}
            placeholder="Enter competition description"
            className="mb-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">
            Short Description
          </label>
          <textarea
            value={competition.descriptionHi || ''}
            onChange={(e) => setCompetition({ ...competition, descriptionHi: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors resize-none"
            placeholder="Enter a brief description"
          />
        </div>

        {/* Banner Image section temporarily hidden */}
        {false && (
          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">
              Banner Image
            </label>
            <div className="border-2 border-dashed border-cream-300 rounded-lg p-6 text-center hover:border-saffron-400 transition-colors">
              <Upload className="h-8 w-8 text-maroon-400 mx-auto mb-2" />
              <p className="text-maroon-600 mb-2">Click to upload banner image</p>
              <p className="text-sm text-maroon-500">PNG, JPG up to 2MB</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload
                    setCompetition({ ...competition, bannerImage: URL.createObjectURL(file) });
                  }
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={competition.startDate}
              onChange={(e) => setCompetition({ ...competition, startDate: e.target.value })}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={competition.endDate}
              onChange={(e) => setCompetition({ ...competition, endDate: e.target.value })}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
              required
            />
          </div>
        </div>

        <div className="bg-cream-50 p-6 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              id="hasTimeLimit"
              checked={competition.hasTimeLimit}
              onChange={(e) => setCompetition({
                ...competition,
                hasTimeLimit: e.target.checked,
                timeLimitMinutes: e.target.checked ? (competition.timeLimitMinutes ?? undefined) : undefined
              })}
              className="w-4 h-4 text-saffron-600 border-2 border-cream-300 rounded focus:ring-saffron-500"
            />
            <label htmlFor="hasTimeLimit" className="text-sm font-medium text-maroon-700">
              Enable Time Limit for Quiz
            </label>
          </div>

          {competition.hasTimeLimit && (
            <div>
              <label className="block text-sm font-medium text-maroon-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={competition.timeLimitMinutes ?? ''}
                onChange={(e) => setCompetition({ ...competition, timeLimitMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                placeholder="30"
                min="1"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-3">
            Question Types *
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={competition.questionTypes.includes('mcq')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCompetition({
                      ...competition,
                      questionTypes: [...competition.questionTypes, 'mcq']
                    });
                  } else {
                    setCompetition({
                      ...competition,
                      questionTypes: competition.questionTypes.filter(type => type !== 'mcq')
                    });
                  }
                }}
                className="w-4 h-4 text-saffron-600 border-2 border-cream-300 rounded focus:ring-saffron-500"
              />
              <span className="text-maroon-700">Multiple Choice Questions (MCQ)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={competition.questionTypes.includes('descriptive')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCompetition({
                      ...competition,
                      questionTypes: [...competition.questionTypes, 'descriptive']
                    });
                  } else {
                    setCompetition({
                      ...competition,
                      questionTypes: competition.questionTypes.filter(type => type !== 'descriptive')
                    });
                  }
                }}
                className="w-4 h-4 text-saffron-600 border-2 border-cream-300 rounded focus:ring-saffron-500"
              />
              <span className="text-maroon-700">Descriptive Questions</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">
            Questions Per Page
          </label>
          <select
            value={competition.questionsPerPage}
            onChange={(e) => setCompetition({ ...competition, questionsPerPage: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
          >
            <option value={1}>1 question per page</option>
            <option value={5}>5 questions per page</option>
            <option value={10}>10 questions per page</option>
            <option value={20}>20 questions per page</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
          >
            <span>{initialData ? 'Next: Update Questions' : 'Next: Add Questions'}</span>
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
        </div>
      </form>
    </div>
  );

  const renderQuestionForm = () => (
    <div ref={questionFormRef} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-maroon-800 mb-4">
        {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
      </h3>

      {validationErrors.questionForm && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {validationErrors.questionForm}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">Question Type</label>
          <select
            value={currentQuestion.type}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as 'mcq' | 'descriptive' })}
            className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
          >
            {competition.questionTypes.includes('mcq') && <option value="mcq">Multiple Choice</option>}
            {competition.questionTypes.includes('descriptive') && <option value="descriptive">Descriptive</option>}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">Question (Hindi)</label>
            <textarea
              value={currentQuestion.questionHi || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionHi: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors resize-none"
              placeholder="अपना प्रश्न दर्ज करें"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">Question (English)</label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors resize-none"
              placeholder="Enter your question"
            />
          </div>
        </div>

        {/* Question Image Upload */}
        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">Question Image (Optional)</label>
          {validationErrors.imageUpload && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-2">
              {validationErrors.imageUpload}
            </div>
          )}
          <div className="border-2 border-dashed border-cream-300 rounded-lg p-6 text-center hover:border-saffron-400 transition-colors">
            {currentQuestion.image ? (
              <div className="space-y-4">
                <img
                  src={getImageUrl(currentQuestion.image)}
                  alt="Question"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg object-cover"
                  style={{ width: 200, height: 200 }}
                />
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setCurrentQuestion({ ...currentQuestion, image: undefined })}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove Image
                  </button>
                  <label className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuestionImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="h-12 w-12 text-cream-400 mx-auto" />
                <div>
                  <label className="cursor-pointer">
                    <span className="text-saffron-600 hover:text-saffron-700 font-medium">
                      Click to upload an image
                    </span>
                    <span className="text-maroon-500"> or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuestionImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-maroon-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {currentQuestion.type === 'mcq' && (
          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-3">Answer Options</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="space-y-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(currentQuestion.options || [])];
                      newOptions[index] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOptions });
                    }}
                    className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                    placeholder={`Option ${index + 1}`}
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                      className="w-4 h-4 text-saffron-600 border-2 border-cream-300 focus:ring-saffron-500"
                    />
                    <span className="text-sm text-maroon-600">Correct Answer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">Points</label>
            <input
              type="number"
              value={currentQuestion.points}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-maroon-700 mb-2">Time Limit (seconds)</label>
            <input
              type="number"
              value={currentQuestion.timeLimit || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
              placeholder="Optional"
            />
          </div>
        </div>



        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowQuestionForm(false)}
            className="flex-1 bg-cream-100 hover:bg-cream-200 text-maroon-700 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex-1 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
          >
            {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuestionsManager = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-maroon-800">Manage Questions</h2>
          <p className="text-maroon-600">
            {initialData ? 'Update existing questions or add new ones' : 'Add questions manually or import from files'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep('basic')}
            className="bg-cream-100 hover:bg-cream-200 text-maroon-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <button
            onClick={() => setCurrentStep('preview')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Bulk Import Options */}
      <div className="bg-gradient-to-r from-gold-50 to-cream-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-maroon-800 mb-4">Bulk Import Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleBulkImport('excel')}
            className="bg-white hover:bg-cream-50 border-2 border-cream-200 hover:border-saffron-300 p-6 rounded-xl transition-all duration-300 text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-maroon-800">Excel Import</h4>
                <p className="text-sm text-maroon-600">Upload .xlsx or .xls files</p>
              </div>
            </div>
            <p className="text-xs text-maroon-500">
              Format: Question | Option1 | Option2 | Option3 | Option4 | Correct | Points
            </p>
          </button>

          <button
            onClick={() => handleBulkImport('pdf')}
            className="bg-white hover:bg-cream-50 border-2 border-cream-200 hover:border-saffron-300 p-6 rounded-xl transition-all duration-300 text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Scan className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-maroon-800">PDF/Image OCR</h4>
                <p className="text-sm text-maroon-600">Extract text using AI</p>
              </div>
            </div>
            <p className="text-xs text-maroon-500">
              Upload scanned documents or images with questions
            </p>
          </button>
        </div>
      </div>

      {/* Manual Question Addition */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-maroon-800">Questions ({competition.questions.length})</h3>
          <button
            onClick={() => setShowQuestionForm(true)}
            className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </button>
        </div>

        {showQuestionForm && renderQuestionForm()}

        {/* Questions List with pagination */}
        <div className="space-y-4">
          {competition.questions
            .slice((currentPage - 1) * (competition.questionsPerPage || 1), (currentPage) * (competition.questionsPerPage || 1))
            .map((question, index) => (
              <div key={question.id} className="border border-cream-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-saffron-100 text-saffron-700 px-2 py-1 rounded-full text-xs font-medium">
                      {question.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-maroon-600">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </span>
                    {question.timeLimit && (
                      <span className="text-sm text-maroon-600 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{question.timeLimit}s</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-maroon-800 mb-2">{question.question}</h4>
                  {question.type === 'mcq' && question.options && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            question.correctAnswer === optIndex
                              ? 'bg-green-100 text-green-700 font-medium'
                              : 'bg-cream-50 text-maroon-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditQuestion(index)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(index)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {competition.questions.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-cream-100 p-4 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-maroon-400" />
              </div>
              <p className="text-maroon-600 mb-4">No questions added yet</p>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="bg-saffron-500 hover:bg-saffron-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Your First Question
              </button>
            </div>
          )}

          {/* Pagination controls */}
          {competition.questions.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded bg-cream-100 text-maroon-700 disabled:opacity-50"
              >
                Prev
              </button>
              <div className="text-maroon-700 text-sm">
                Page {currentPage} of {Math.max(1, Math.ceil(competition.questions.length / (competition.questionsPerPage || 1)))}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(competition.questions.length / (competition.questionsPerPage || 1)), p + 1))}
                disabled={currentPage >= Math.ceil(competition.questions.length / (competition.questionsPerPage || 1))}
                className="px-4 py-2 rounded bg-cream-100 text-maroon-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {validationErrors.saveCompetition && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-6">
            {validationErrors.saveCompetition}
          </div>
        )}

        {competition.questions.length > 0 && (
          <div className="flex justify-end mt-6 pt-6 border-t border-cream-200">
            <button
              onClick={handleSaveCompetition}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>Save Competition</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-maroon-800">Competition Preview</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep('questions')}
            className="bg-cream-100 hover:bg-cream-200 text-maroon-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Questions</span>
          </button>
          <button
                onClick={async () => {
              // Save first (create or update), then ask parent to publish via dedicated endpoint
              try {
                await handleSaveCompetition();
                if (onPublish) {
                  setIsPublishing(true);
                  const pubResult = onPublish(competition);
                  if (pubResult && typeof (pubResult as any).then === 'function') {
                    await (pubResult as Promise<any>);
                  }
                }
              } finally {
                setIsPublishing(false);
              }
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
                  disabled={isSaving || isPublishing}
          >
            <Save className="h-5 w-5" />
            <span>Publish Competition</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          {competition.bannerImage && (
            <img
              src={getImageUrl(competition.bannerImage)}
              alt="Competition Banner"
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-3xl font-bold text-maroon-800 mb-2">
            {competition.title || competition.titleHi}
          </h1>
          {/* Short Description (Plain Text) */}
          {competition.descriptionHi && (
            <p className="text-maroon-600 text-lg mb-4">
              {competition.descriptionHi}
            </p>
          )}

          {/* Full Description (Rich Text) */}
          {competition.description && (
            <div
              className="text-maroon-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: competition.description
              }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-cream-50 rounded-lg">
            <Calendar className="h-6 w-6 text-saffron-600 mx-auto mb-2" />
            <div className="text-sm text-maroon-600">Start Date</div>
            <div className="font-semibold text-maroon-800">
              {new Date(competition.startDate).toLocaleDateString()}
            </div>
          </div>
          <div className="text-center p-4 bg-cream-50 rounded-lg">
            <Calendar className="h-6 w-6 text-saffron-600 mx-auto mb-2" />
            <div className="text-sm text-maroon-600">End Date</div>
            <div className="font-semibold text-maroon-800">
              {new Date(competition.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="text-center p-4 bg-cream-50 rounded-lg">
            <FileText className="h-6 w-6 text-saffron-600 mx-auto mb-2" />
            <div className="text-sm text-maroon-600">Questions</div>
            <div className="font-semibold text-maroon-800">{competition.questions.length}</div>
          </div>
          <div className="text-center p-4 bg-cream-50 rounded-lg">
            <Clock className="h-6 w-6 text-saffron-600 mx-auto mb-2" />
            <div className="text-sm text-maroon-600">Time Limit</div>
            <div className="font-semibold text-maroon-800">
              {competition.hasTimeLimit ? `${competition.timeLimitMinutes} min` : 'No limit'}
            </div>
          </div>
        </div>

        <div className="bg-gold-50 p-6 rounded-lg">
          <h3 className="font-bold text-maroon-800 mb-3">Competition Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-maroon-600">Question Types: </span>
              <span className="font-medium text-maroon-800">
                {competition.questionTypes.map(type => type.toUpperCase()).join(', ')}
              </span>
            </div>
            <div>
              <span className="text-maroon-600">Questions Per Page: </span>
              <span className="font-medium text-maroon-800">{competition.questionsPerPage}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{ top: 'var(--header-height, 4rem)', zIndex: 100000 }}
      className="fixed left-0 right-0 bottom-0 top-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-auto"
    >
      <div className="bg-cream-50 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 my-6 max-h-[calc(100vh- var(--header-height, 4rem) - 2rem)] overflow-hidden">
        {/* Layout: scrollable content area with a sticky footer so action buttons are always visible */}
        <div className="flex flex-col h-full">
          <div className="p-8 overflow-y-auto" style={{ paddingBottom: '6.5rem' }}>
            {/* Add extra bottom padding so the last section content isn't hidden behind the sticky footer */}
            {currentStep === 'basic' && renderBasicInfo()}
            {currentStep === 'questions' && renderQuestionsManager()}
            {currentStep === 'preview' && renderPreview()}
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-cream-50 border-t border-cream-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-maroon-700">Tip: long content will scroll above this footer</div>
              <div className="flex space-x-3">
                {currentStep !== 'basic' && (
                  <button
                    onClick={() => setCurrentStep('basic')}
                    className="px-4 py-2 rounded bg-cream-100 text-maroon-700"
                  >
                    Back
                  </button>
                )}

                {currentStep === 'basic' && (
                  <button
                    onClick={() => setCurrentStep('questions')}
                    className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Next: Questions
                  </button>
                )}

                {currentStep === 'questions' && (
                  <button
                    onClick={() => setCurrentStep('preview')}
                    className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Preview
                  </button>
                )}

                {currentStep === 'preview' && (
                  <button
                    onClick={async () => {
                      try {
                        await handleSaveCompetition();
                        if (onPublish) {
                          setIsPublishing(true);
                          const pubResult = onPublish(competition);
                          if (pubResult && typeof (pubResult as any).then === 'function') {
                            await (pubResult as Promise<any>);
                          }
                        }
                      } finally {
                        setIsPublishing(false);
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
                    disabled={isSaving || isPublishing}
                  >
                    <Save className="h-5 w-5" />
                    <span>Publish Competition</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionCreator;