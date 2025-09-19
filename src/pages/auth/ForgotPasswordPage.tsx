import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Captcha from '../../components/Captcha';
import { authService } from '../../services/authService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!captchaValid) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);

    const result = await authService.forgotPassword(email);
    if (result.success) setMessage(result.message || 'If the email exists, a reset link has been sent.');
    else setError(result.message || 'Failed to send reset link.');

    setLoading(false);
  };

  return (
    <div className="min-h-screen guruji-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-saffron-500 to-gold-500 p-3 rounded-full shadow-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src="/Images/logo.JPG" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-maroon-800 mb-2">Forgot Password</h2>
          <p className="text-maroon-600 mb-6">Enter your email to receive a password reset link.</p>
        {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-maroon-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* CAPTCHA */}
          <Captcha onVerify={setCaptchaValid} className="mb-4" />

          <button
            type="submit"
            disabled={loading || !captchaValid}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-saffron-600 hover:bg-saffron-700'
            }`}
          >
            <Mail className="h-5 w-5" />
            <span>{loading ? 'Sending...' : 'Send reset link'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-saffron-600 hover:text-saffron-700 font-semibold">Back to Login</Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

