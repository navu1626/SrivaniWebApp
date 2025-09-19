import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, User, Mail, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../../services/api';
import { userService } from '../../services/userService';

interface UserPasswordModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
}

const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  user,
  isOpen,
  onClose,
  onPasswordChanged
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await userService.changeUserPassword(user.UserID, newPassword);
      
      if (result.success) {
        setSuccess('Password changed successfully! User has been notified via email.');
        onPasswordChanged();
        setTimeout(() => {
          onClose();
          setNewPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 2000);
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (err) {
      setError('An error occurred while changing the password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div style={{ top: 'var(--header-height, 4rem)', zIndex: 100000 }} className="fixed left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-maroon-800">Change Password</h2>
              <p className="text-sm text-maroon-600">Update user's login password</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-maroon-600" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-cream-200">
          <div className="flex items-center space-x-3">
            <div className="bg-cream-100 p-3 rounded-full">
              <User className="h-6 w-6 text-maroon-600" />
            </div>
            <div>
              <h3 className="font-semibold text-maroon-800">{user.FullName}</h3>
              <div className="flex items-center space-x-1 text-sm text-maroon-600">
                <Mail className="h-4 w-4" />
                <span>{user.Email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>The user will receive an email with their new password</li>
                  <li>They should change this password after their next login</li>
                  <li>All existing sessions will remain active</li>
                </ul>
              </div>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-maroon-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maroon-400 hover:text-maroon-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-maroon-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maroon-400 hover:text-maroon-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Generate Random Password Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-sm text-saffron-600 hover:text-saffron-700 font-medium transition-colors"
            >
              Generate Random Password
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-cream-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-cream-300 text-maroon-700 rounded-lg hover:bg-cream-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <Key className="h-4 w-4" />
              <span>{loading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserPasswordModal;
