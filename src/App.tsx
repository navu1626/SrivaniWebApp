// React import not required with the new JSX runtime
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegistrationSuccessPage from './pages/auth/RegistrationSuccessPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import QuizPage from './pages/quiz/QuizPage';
import AboutPage from './pages/AboutPage';
import CompetitionsPage from './pages/CompetitionsPage';
import ReligiousGamesPage from './pages/ReligiousGamesPage';
import CompetitionDetail from './pages/CompetitionDetail';
import ResultsPage from './pages/ResultsPage';
import ResultDetailPage from './pages/ResultDetailPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Support from './pages/Support';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

function ScrollToTopOnRouteChange() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
  return null;
}

function BackgroundImage() {
  useEffect(() => {
    // Only apply on mobile devices
    const isMobile = window.innerWidth <= 767;
    if (!isMobile) return;
    const bg = document.querySelector('.guruji-bg-overlay') as HTMLElement | null;
    if (!bg) return;
    const onScroll = () => {
      bg.style.transform = `translateY(${window.scrollY}px)`;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className="fixed inset-0 -z-10 guruji-bg-overlay"
      aria-hidden="true"
    />
  );
}

function App() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTopOnRouteChange />
          <BackgroundImage />
          <div style={{ paddingTop: 'var(--header-height, 4rem)' }} className="min-h-screen bg-cream-50 flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/registration-success" element={<RegistrationSuccessPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/quiz/:id" element={<QuizPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/support" element={<Support />} />
                <Route path="/competitions" element={<CompetitionsPage />} />
                <Route path="/competitions/:id" element={<CompetitionDetail />} />
                <Route path="/religious-games" element={<ReligiousGamesPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/results/:attemptId" element={<ResultDetailPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;