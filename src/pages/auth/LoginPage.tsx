import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Crown, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToForm = (offset = 8) => {
    try {
      const headerHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0px';
      const headerHeight = parseInt(headerHeightStr) || 0;
      const formEl = document.querySelector('form');
      const top = formEl ? (formEl.getBoundingClientRect().top + window.scrollY - headerHeight - offset) : 0;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } catch (e) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check for success message from location state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title);
      // ensure banner is visible under fixed header
      setTimeout(() => scrollToForm(), 50);
    }
  }, [location.state]);

  useEffect(() => {
    if (error) {
      // scroll error banner into view under the fixed header
      setTimeout(() => scrollToForm(), 50);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        try {
          const stored = localStorage.getItem('srivani_user');
          const u = stored ? JSON.parse(stored) : null;
          if (u?.Role === 'Admin') navigate('/admin');
          else navigate('/dashboard');
        } catch {
          navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen guruji-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-saffron-500 to-gold-500 p-3 rounded-full shadow-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src="/Images/logo.JPG" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-maroon-800">{t('common.login')}</h2>
          <p className="text-maroon-600 mt-2">Welcome back to your spiritual journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}



            <div>
              <label htmlFor="email" className="block text-sm font-medium text-maroon-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-maroon-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maroon-500 hover:text-maroon-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 mr-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                <LogIn className="h-5 w-5" />
                <span>{loading ? 'Signing in...' : t('common.login')}</span>
              </button>

              <Link to="/forgot-password" className="text-saffron-600 hover:text-saffron-700 font-semibold whitespace-nowrap">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-maroon-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-saffron-600 hover:text-saffron-700 font-semibold transition-colors">
                {t('common.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;