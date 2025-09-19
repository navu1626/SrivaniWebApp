import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, UserPlus, Edit, Trash2, Mail, Phone, ChevronLeft, ChevronRight, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { User } from '../../services/api';
import { userService, PaginatedUsersResponse } from '../../services/userService';
import UserEditModal from './UserEditModal';
import UserDeleteModal from './UserDeleteModal';
import UserPasswordModal from './UserPasswordModal';

const UserManager: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users from API
  const fetchUsers = async (page: number = 1, search?: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await userService.getAllUsers(page, pagination.limit, search);

      if (result.success && result.data) {
        let filteredUsers = result.data.users;

        // Apply client-side filters
        if (filterAge !== 'all') {
          filteredUsers = filteredUsers.filter(user =>
            user.AgeGroup.toLowerCase() === filterAge.toLowerCase()
          );
        }

        if (filterRole !== 'all') {
          filteredUsers = filteredUsers.filter(user =>
            user.Role.toLowerCase() === filterRole.toLowerCase()
          );
        }

        if (filterStatus !== 'all') {
          if (filterStatus === 'active') {
            filteredUsers = filteredUsers.filter(user => user.IsActive);
          } else if (filterStatus === 'inactive') {
            filteredUsers = filteredUsers.filter(user => !user.IsActive);
          } else if (filterStatus === 'verified') {
            filteredUsers = filteredUsers.filter(user => user.IsEmailVerified);
          } else if (filterStatus === 'unverified') {
            filteredUsers = filteredUsers.filter(user => !user.IsEmailVerified);
          }
        }

        setUsers(filteredUsers);
        setPagination({
          page: result.data.page,
          limit: result.data.limit,
          total: result.data.total,
          totalPages: result.data.totalPages,
          hasNext: result.data.hasNext,
          hasPrev: result.data.hasPrev
        });
      } else {
        setError(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, searchTerm || undefined);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle filter changes
  useEffect(() => {
    fetchUsers(1, searchTerm || undefined);
  }, [filterAge, filterRole, filterStatus]);

  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup.toLowerCase()) {
      case 'child': return 'bg-green-100 text-green-700';
      case 'youth': return 'bg-blue-100 text-blue-700';
      case 'adult': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(user =>
      user.UserID === updatedUser.UserID ? updatedUser : user
    ));
  };

  const handleUserDeleted = (userId: string) => {
    setUsers(prev => prev.filter(user => user.UserID !== userId));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, searchTerm || undefined);
  };

  const handleAddUser = () => {
    navigate('/register', { state: { from: 'admin' } });
  };

  const handleExportUsers = async () => {
    try {
      setLoading(true);

      // Get all users for export
      const result = await userService.exportUsers(searchTerm || undefined);

      if (result.success && result.data) {
        const exportData = result.data.map(user => ({
          'Full Name': user.FullName,
          'Email': user.Email,
          'Mobile Number': user.MobileNumber || '',
          'Age Group': user.AgeGroup,
          'Gender': user.Gender || '',
          'Preferred Language': user.PreferredLanguage,
          'City': user.City || '',
          'State': user.State || '',
          'Country': user.Country,
          'Role': user.Role,
          'Email Verified': user.IsEmailVerified ? 'Yes' : 'No',
          'Active': user.IsActive ? 'Yes' : 'No',
          'Created Date': new Date(user.CreatedDate).toLocaleDateString(),
          'Last Login': user.LastLoginDate ? new Date(user.LastLoginDate).toLocaleDateString() : 'Never'
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const colWidths = [
          { wch: 20 }, // Full Name
          { wch: 25 }, // Email
          { wch: 15 }, // Mobile Number
          { wch: 12 }, // Age Group
          { wch: 10 }, // Gender
          { wch: 18 }, // Preferred Language
          { wch: 15 }, // City
          { wch: 15 }, // State
          { wch: 10 }, // Country
          { wch: 8 },  // Role
          { wch: 12 }, // Email Verified
          { wch: 8 },  // Active
          { wch: 12 }, // Created Date
          { wch: 12 }  // Last Login
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Users');

        // Generate filename with current date
        const now = new Date();
        const filename = `SrivaniQuiz_Users_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
      } else {
        setError(result.message || 'Failed to export users');
      }
    } catch (err) {
      setError('An error occurred while exporting users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-maroon-800 mb-2">User Management</h1>
          <p className="text-maroon-600">Manage platform users and their activities</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleExportUsers}
            disabled={loading}
            className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-5 w-5" />
            <span>Export Users</span>
          </button>
          <button
            onClick={handleAddUser}
            className="bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-maroon-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-maroon-600" />
              <span className="text-sm font-medium text-maroon-700">Filters:</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-maroon-600">Age Group:</label>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors text-sm"
              >
                <option value="all">All</option>
                <option value="child">Child</option>
                <option value="youth">Youth</option>
                <option value="adult">Adult</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-maroon-600">Role:</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors text-sm"
              >
                <option value="all">All</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-maroon-600">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Email Verified</option>
                <option value="unverified">Email Unverified</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(filterAge !== 'all' || filterRole !== 'all' || filterStatus !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setFilterAge('all');
                  setFilterRole('all');
                  setFilterStatus('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-sm bg-cream-100 hover:bg-cream-200 text-maroon-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                <th className="text-left py-3 px-3 font-semibold text-maroon-700 w-1/4">User</th>
                <th className="text-left py-3 px-3 font-semibold text-maroon-700 w-1/4">Contact</th>
                <th className="text-left py-3 px-3 font-semibold text-maroon-700 w-1/12">Age Group</th>
                <th className="text-left py-3 px-3 font-semibold text-maroon-700 w-1/12">Role</th>
                <th className="text-left py-3 px-3 font-semibold text-maroon-700 w-1/12">Status</th>
                <th className="text-left py-3 px-3 font-semibold text-maroon-700 w-1/12">Joined</th>
                <th className="text-left py-3 px-3 font-semibold text-maroon-700 w-1/12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-saffron-600"></div>
                      <span className="text-maroon-600">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.UserID} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
          <td className="py-3 px-3 break-words">
                      <div>
            <div className="font-semibold text-maroon-800 truncate">{user.FullName}</div>
            <div className="text-sm text-maroon-600 truncate break-words">{user.Email}</div>
                      </div>
                    </td>
          <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-maroon-400" />
              <span className="text-maroon-600 truncate break-words max-w-[12rem]">{user.Email}</span>
                        </div>
                        {user.MobileNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-maroon-400" />
                            <span className="text-maroon-600">{user.MobileNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAgeGroupColor(user.AgeGroup)}`}>
                        {user.AgeGroup}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.Role === 'Admin' ? 'bg-gold-100 text-gold-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.Role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.IsActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.IsEmailVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.IsEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-maroon-600">
                      <div className="text-sm text-maroon-600">
                        {new Date(user.CreatedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                          title="Change Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="Deactivate User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-maroon-400 mb-4">
                      <Search className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-maroon-600">No users found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-cream-200">
            <div className="text-sm text-maroon-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="p-2 border border-cream-300 rounded-lg hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-saffron-500 text-white'
                          : 'border border-cream-300 hover:bg-cream-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="p-2 border border-cream-300 rounded-lg hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {users.filter(u => u.AgeGroup === 'Child').length}
          </div>
          <div className="text-maroon-600 text-sm">Children</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {users.filter(u => u.AgeGroup === 'Youth').length}
          </div>
          <div className="text-maroon-600 text-sm">Youth</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {users.filter(u => u.AgeGroup === 'Adult').length}
          </div>
          <div className="text-maroon-600 text-sm">Adults</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-gold-600 mb-2">
            {pagination.total}
          </div>
          <div className="text-maroon-600 text-sm">Total Users</div>
        </div>
      </div>

      {/* Modals */}
      <UserEditModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
      />

      <UserPasswordModal
        user={selectedUser}
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setSelectedUser(null);
        }}
        onPasswordChanged={() => {
          // Optionally refresh user data or show notification
          fetchUsers(pagination.page, searchTerm || undefined);
        }}
      />

      <UserDeleteModal
        user={selectedUser}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
};

export default UserManager;