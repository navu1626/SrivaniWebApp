import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    FirstName: '', LastName: '', MobileNumber: '', PreferredLanguage: 'English', City: '', State: ''
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const result = await authService.getCurrentUser();
      if (result.success && result.user) {
        setForm({
          FirstName: result.user.FirstName || '',
          LastName: result.user.LastName || '',
          MobileNumber: result.user.MobileNumber || '',
          PreferredLanguage: result.user.PreferredLanguage || 'English',
          City: result.user.City || '',
          State: result.user.State || ''
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('srivani_token') || ''}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok && json.success) setMessage('Profile updated');
      else setError(json.message || 'Update failed');
    } catch (err: any) {
      setError(err.message || 'Update failed');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); setError('');
    const result = await authService.changePassword(passwords.currentPassword, passwords.newPassword);
    if (result.success) setMessage('Password changed'); else setError(result.message);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={updateProfile} className="space-y-4 bg-white p-4 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-maroon-700 font-medium mb-2">First Name</label>
            <input className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={form.FirstName} onChange={e=>setForm({...form, FirstName:e.target.value})} />
          </div>
          <div>
            <label className="block text-maroon-700 font-medium mb-2">Last Name</label>
            <input className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={form.LastName} onChange={e=>setForm({...form, LastName:e.target.value})} />
          </div>
          <div>
            <label className="block text-maroon-700 font-medium mb-2">Mobile</label>
            <input className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={form.MobileNumber} onChange={e=>setForm({...form, MobileNumber:e.target.value})} />
          </div>
          <div>
            <label className="block text-maroon-700 font-medium mb-2">Preferred Language</label>
            <select className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={form.PreferredLanguage} onChange={e=>setForm({...form, PreferredLanguage:e.target.value})}>
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
          <div>
            <label className="block text-maroon-700 font-medium mb-2">City</label>
            <input className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={form.City} onChange={e=>setForm({...form, City:e.target.value})} />
          </div>
          <div>
            <label className="block text-maroon-700 font-medium mb-2">State</label>
            <input className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={form.State} onChange={e=>setForm({...form, State:e.target.value})} />
          </div>
        </div>
        <div className="text-right">
          <button className="bg-saffron-600 text-white px-4 py-2 rounded-lg">Save Profile</button>
        </div>
      </form>

      <h2 className="text-xl font-semibold mt-8 mb-4">Change Password</h2>
      <form onSubmit={changePassword} className="space-y-4 bg-white p-4 rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-maroon-700 font-medium mb-2">Current Password</label>
            <input type="password" className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={passwords.currentPassword} onChange={e=>setPasswords({...passwords, currentPassword:e.target.value})} />
          </div>
          <div>
            <label className="block text-maroon-700 font-medium mb-2">New Password</label>
            <input type="password" className="w-full px-4 py-3 border border-maroon-200 rounded-lg" value={passwords.newPassword} onChange={e=>setPasswords({...passwords, newPassword:e.target.value})} />
          </div>
        </div>
        <div className="text-right">
          <button className="bg-saffron-600 text-white px-4 py-2 rounded-lg">Change Password</button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;

