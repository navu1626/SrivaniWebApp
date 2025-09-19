import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';
import { User as UserType } from '../../services/api';
import { userService, UserUpdateData } from '../../services/userService';

interface UserEditModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserType) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated
}) => {
  const [formData, setFormData] = useState<UserUpdateData>({
    FirstName: '',
    LastName: '',
    MobileNumber: '',
    DateOfBirth: '',
    Gender: undefined,
    PreferredLanguage: 'English',
    City: '',
    State: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        FirstName: user.FirstName || '',
        LastName: user.LastName || '',
        MobileNumber: user.MobileNumber || '',
        DateOfBirth: user.DateOfBirth ? user.DateOfBirth.split('T')[0] : '',
        Gender: user.Gender,
        PreferredLanguage: user.PreferredLanguage || 'English',
        City: user.City || '',
        State: user.State || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await userService.updateUserById(user.UserID, formData);
      
      if (result.success && result.user) {
        setSuccess('User updated successfully!');
        onUserUpdated(result.user);
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred while updating the user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div style={{ top: 'var(--header-height, 4rem)', zIndex: 100000 }} className="fixed left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div className="flex items-center space-x-3">
            <div className="bg-saffron-100 p-2 rounded-lg">
              <User className="h-6 w-6 text-saffron-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-maroon-800">Edit User</h2>
              <p className="text-sm text-maroon-600">{user.Email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-maroon-600" />
          </button>
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

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-maroon-800 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="FirstName" className="block text-sm font-medium text-maroon-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="FirstName"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="LastName" className="block text-sm font-medium text-maroon-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="LastName"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label htmlFor="MobileNumber" className="block text-sm font-medium text-maroon-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Mobile Number (WhatsApp)
                </label>
                <input
                  type="tel"
                  id="MobileNumber"
                  name="MobileNumber"
                  value={formData.MobileNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label htmlFor="DateOfBirth" className="block text-sm font-medium text-maroon-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="DateOfBirth"
                  name="DateOfBirth"
                  value={formData.DateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="Gender" className="block text-sm font-medium text-maroon-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Gender
                </label>
                <select
                  id="Gender"
                  name="Gender"
                  value={formData.Gender || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="PreferredLanguage" className="block text-sm font-medium text-maroon-700 mb-2">
                  Preferred Language
                </label>
                <select
                  id="PreferredLanguage"
                  name="PreferredLanguage"
                  value={formData.PreferredLanguage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-maroon-800 flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="City" className="block text-sm font-medium text-maroon-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="City"
                  name="City"
                  value={formData.City}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label htmlFor="State" className="block text-sm font-medium text-maroon-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  id="State"
                  name="State"
                  value={formData.State}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
                  placeholder="Enter state"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-cream-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-cream-300 text-maroon-700 rounded-lg hover:bg-cream-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
