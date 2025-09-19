import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegistrationSuccessPage: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="min-h-screen guruji-bg flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-saffron-500 to-gold-500 p-4 rounded-full shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 border-2 border-saffron-200 rounded-full border-t-saffron-500"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-maroon-800 mb-4"
          >
            Registration Successful!
          </motion.h1>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-maroon-600 text-lg mb-4">
              Thank you for joining our spiritual learning community!
            </p>
            
            <div className="bg-saffron-50 border border-saffron-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-saffron-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-saffron-800 font-medium mb-1">
                    Verification Email Sent
                  </p>
                  <p className="text-saffron-700 text-sm">
                    We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-maroon-500 space-y-2">
              <p>• Check your spam/junk folder if you don't see the email</p>
              <p>• The verification link will expire in 24 hours</p>
              <p>• You must verify your email before you can log in</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Link
              to="/login"
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Go to Login</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <p className="text-sm text-maroon-500">
              Already verified your email?{' '}
              <Link to="/login" className="text-saffron-600 hover:text-saffron-700 font-medium">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-white/80 text-sm">
            Need help?{' '}
            <Link to="/contact" className="text-gold-200 hover:text-gold-100 font-medium">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccessPage;
