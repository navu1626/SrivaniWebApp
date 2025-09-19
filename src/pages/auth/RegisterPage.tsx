import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Crown, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Captcha from '../../components/Captcha';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  mobile: '',
  mobilePrefix: '+91',
    password: '',
    confirmPassword: '',
    ageGroup: 'youth' as 'child' | 'youth' | 'adult',
    preferredLanguage: 'English' as 'English' | 'Hindi',
  gender: '',
  dateOfBirth: '',
    city: '',
    state: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);

  const { register, user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin and came from admin panel (rely on explicit state passed when opening form)
  const isAdminCreating = isAdmin && location.state?.from === 'admin';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Comprehensive validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      scrollToForm();
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      scrollToForm();
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      scrollToForm();
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      scrollToForm();
      return;
    }

  if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      scrollToForm();
      return;
    }
  // Mobile number validation (10 digits)
  const mobileDigits = formData.mobile.replace(/\D/g, '');
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobileDigits)) {
      setError('Please enter a valid 10-digit mobile number');
      scrollToForm();
      return;
    }

    if (!formData.city.trim()) {
      setError('City is required');
      scrollToForm();
      return;
    }

    if (!formData.state.trim()) {
      setError('State is required');
      scrollToForm();
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      scrollToForm();
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      scrollToForm();
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      scrollToForm();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      scrollToForm();
      return;
    }

    if (!captchaValid) {
      setError('Please complete the CAPTCHA verification');
      scrollToForm();
      return;
    }

    setLoading(true);

    try {
  const result = await register({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  // Save full number with prefix (e.g. +91XXXXXXXXXX)
  mobile: `${formData.mobilePrefix}${formData.mobile.replace(/\D/g, '')}`,
        password: formData.password,
        ageGroup: formData.ageGroup,
        preferredLanguage: formData.preferredLanguage,
        city: formData.city,
        state: formData.state
  }, { skipAutoLogin: isAdminCreating });

      if (result.success) {
        if (isAdminCreating) {
          navigate('/admin/users', {
            state: {
              message: result.message || 'User created successfully!'
            }
          });
        } else {
          navigate('/registration-success');
        }
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        scrollToForm();
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      scrollToForm();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen guruji-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {isAdminCreating && (
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center space-x-2 text-maroon-600 hover:text-maroon-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to User Management</span>
              </button>
            </div>
          )}

          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-saffron-500 to-gold-500 p-3 rounded-full shadow-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src="/Images/logo.JPG" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-maroon-800">
            {isAdminCreating ? 'Add New User' : t('common.register')}
          </h2>
          <p className="text-maroon-600 mt-2">
            {isAdminCreating
              ? 'Create a new user account for the platform'
              : 'Begin your spiritual learning journey'
            }
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-maroon-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-maroon-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

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
              <label htmlFor="mobile" className="block text-sm font-medium text-maroon-700 mb-2">
                {t('auth.mobile')}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={formData.mobilePrefix}
                  className="w-20 text-center px-3 py-3 border border-cream-300 rounded-lg bg-gray-50 text-maroon-700"
                />
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ageGroup" className="block text-sm font-medium text-maroon-700 mb-2">
                  {t('auth.ageGroup')}
                </label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                >
                  <option value="child">{t('auth.child')}</option>
                  <option value="youth">{t('auth.youth')}</option>
                  <option value="adult">{t('auth.adult')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="preferredLanguage" className="block text-sm font-medium text-maroon-700 mb-2">
                  Preferred Language
                </label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-maroon-700 mb-2">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-maroon-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-maroon-700 mb-2">
                  City 
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-maroon-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Your state"
                />
              </div>
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
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-maroon-700 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maroon-500 hover:text-maroon-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <Captcha onVerify={setCaptchaValid} className="mb-4" />

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              <UserPlus className="h-5 w-5" />
              <span>{loading ? 'Creating Account...' : t('common.register')}</span>
            </button>
          </form>

          {!isAdminCreating && (
            <div className="mt-6 text-center">
              <p className="text-maroon-600">
                Already have an account?{' '}
                <Link to="/login" className="text-saffron-600 hover:text-saffron-700 font-semibold transition-colors">
                  {t('common.login')}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;