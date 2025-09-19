import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(token || '', password);
    if (result.success) {
      setMessage(result.message || 'Password reset successful');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message || 'Password reset failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-cream-50 to-gold-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-maroon-800 mb-2">Reset Password</h2>
        <p className="text-maroon-600 mb-6">Enter your new password below.</p>
        {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-maroon-700 font-medium mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-maroon-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-saffron-600 hover:bg-saffron-700'
            }`}
          >
            <KeyRound className="h-5 w-5" />
            <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-saffron-600 hover:text-saffron-700 font-semibold">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

