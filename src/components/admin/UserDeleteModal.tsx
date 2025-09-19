import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, User } from 'lucide-react';
import { User as UserType } from '../../services/api';
import { userService } from '../../services/userService';

interface UserDeleteModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: (userId: string) => void;
}

const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserDeleted
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const result = await userService.deactivateUser(user.UserID);
      
      if (result.success) {
        onUserDeleted(user.UserID);
        onClose();
      } else {
        setError(result.message || 'Failed to deactivate user');
      }
    } catch (err) {
      setError('An error occurred while deactivating the user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div style={{ top: 'var(--header-height, 4rem)', zIndex: 100000 }} className="fixed left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-maroon-800">Deactivate User</h2>
              <p className="text-sm text-maroon-600">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-maroon-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <div className="bg-cream-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-maroon-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-maroon-800 mb-2">
              Are you sure you want to deactivate this user?
            </h3>
            
            <div className="bg-cream-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-maroon-800">{user.FullName}</p>
              <p className="text-sm text-maroon-600">{user.Email}</p>
              <p className="text-xs text-maroon-500 mt-1">
                Age Group: {user.AgeGroup} • Role: {user.Role}
              </p>
            </div>

            <div className="text-left bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">What happens when you deactivate a user:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• User will be unable to log in</li>
                <li>• All active sessions will be terminated</li>
                <li>• User data will be preserved</li>
                <li>• User can be reactivated later if needed</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-cream-300 text-maroon-700 rounded-lg hover:bg-cream-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span>{loading ? 'Deactivating...' : 'Deactivate User'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteModal;
