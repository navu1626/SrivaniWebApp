import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const result = await authService.verifyEmail(token);
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in to your account.');
        } else {
          setStatus('error');
          setMessage(result.message || 'Verification failed. The link may have expired or already been used.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.message || 'Verification failed. The link may have expired or already been used.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen guruji-bg flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'pending' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Loader className="h-12 w-12 text-saffron-600 animate-spin" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 border-2 border-saffron-200 rounded-full border-t-saffron-500"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-maroon-800 mb-2">Verifying Email</h2>
              <p className="text-maroon-600">{message}</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full shadow-lg">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-maroon-800 mb-2">Email Verified!</h2>
              <p className="text-maroon-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Go to Login</span>
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full shadow-lg">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-maroon-800 mb-2">Verification Failed</h2>
              <p className="text-maroon-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>Go to Login</span>
                </Link>
                <p className="text-sm text-maroon-500">
                  Need a new verification link?{' '}
                  <Link to="/register" className="text-saffron-600 hover:text-saffron-700 font-medium">
                    Register again
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;

