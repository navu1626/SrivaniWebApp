import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const backendEnv = import.meta.env.VITE_BACKEND_ENV;
const API_BASE_URL =
  backendEnv === 'local'
    ? 'http://localhost:5000'
    : 'https://srivaniwebapp.onrender.com';
const API_VERSION = 'v1';

// Log the current API base URL
console.log('Frontend is using API:', API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('srivani_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('srivani_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/${API_VERSION}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Update tokens
          localStorage.setItem('srivani_token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('srivani_refresh_token', newRefreshToken);
          }

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect only if not already on auth pages
        localStorage.removeItem('srivani_token');
        localStorage.removeItem('srivani_refresh_token');
        localStorage.removeItem('srivani_user');

        // Only redirect if not already on login/register pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface User {
  UserID: string;
  Email: string;
  FirstName: string;
  LastName: string;
  FullName: string;
  MobileNumber?: string;
  DateOfBirth?: string;
  AgeGroup: 'Child' | 'Youth' | 'Adult';
  Gender?: 'Male' | 'Female' | 'Other' | string;
  PreferredLanguage: 'English' | 'Hindi';
  Role: 'Admin' | 'User';
  IsActive: boolean;
  IsEmailVerified: boolean;
  ProfileImageURL?: string;
  City?: string;
  State?: string;
  Country: string;
  CreatedDate: string;
  UpdatedDate: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  ageGroup: 'Child' | 'Youth' | 'Adult';
  gender?: 'Male' | 'Female' | 'Other' | string;
  preferredLanguage?: 'English' | 'Hindi';
  city?: string;
  state?: string;
}

// Competition Types
export interface Competition {
  CompetitionID: string;
  Title: string;
  TitleHindi?: string;
  Description: string;
  DescriptionHindi?: string;
  BannerImageURL?: string;
  StartDate: string;
  EndDate: string;
  DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
  Status: 'Draft' | 'Published' | 'Active' | 'Completed' | 'Cancelled';
  QuestionsPerPage: 1 | 5 | 10 | 20;
  TotalQuestions?: number;
  CreatedDate: string;
  HasTimeLimit?: boolean;
  TimeLimitMinutes?: number;
  ParticipantsCount?: number;
  AllowedQuestionTypes?: string;
  ResultAnnounceDate?: string;
}

// Question Types
export interface Question {
  QuestionID: string;
  CompetitionID: string;
  QuestionText: string;
  QuestionTextHindi?: string;
  QuestionType: 'MCQ' | 'Descriptive';
  QuestionImageURL?: string;
  Points: number;
  DifficultyLevel: 'Easy' | 'Medium' | 'Hard';
  OrderIndex: number;
  Explanation?: string;
  ExplanationHindi?: string;
  Options?: QuestionOption[];
}

export interface QuestionOption {
  OptionID: string;
  QuestionID: string;
  OptionText: string;
  OptionTextHindi?: string;
  OptionImageURL?: string;
  IsCorrect: boolean;
  OrderIndex: number;
}

// Quiz Types
export interface QuizAttempt {
  AttemptID: string;
  UserID: string;
  CompetitionID: string;
  StartTime: string;
  EndTime?: string;
  Status: 'InProgress' | 'Completed' | 'Submitted' | 'TimedOut' | 'Abandoned';
  TotalScore: number;
  TotalQuestions: number;
  AnsweredQuestions: number;
  CorrectAnswers: number;
  CurrentQuestionIndex: number;
}

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default api;
