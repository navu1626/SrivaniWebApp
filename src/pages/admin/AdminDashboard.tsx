import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  Trophy,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CompetitionManager from '../../components/admin/CompetitionManager';
import Analytics from '../../components/admin/Analytics';
import SubmissionsManager from './SubmissionsManager';
import UserManager from '../../components/admin/UserManager';
import NotificationsManager from '../../components/admin/NotificationsManager';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const menuItems = [
    { 
      path: '/admin', 
      icon: BarChart3, 
      label: 'Dashboard', 
      exact: true
    },
    { 
      path: '/admin/competitions', 
      icon: Trophy, 
      label: t('admin.manageCompetitions')
    },
    {
      path: '/admin/users',
      icon: Users,
      label: t('admin.users')
    },
    {
      path: '/admin/notifications',
      icon: MessageSquare,
      label: 'Manage Notification'
    },
    { 
      path: '/admin/submissions', 
      icon: FileText, 
      label: t('admin.submissions')
    },
    { 
      path: '/admin/analytics', 
      icon: BarChart3, 
      label: t('admin.analytics')
    }
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-xl">
          <div className="p-6 border-b border-cream-200">
            <h2 className="text-2xl font-bold text-maroon-800">Admin Panel</h2>
            <p className="text-maroon-600 text-sm mt-1">Manage your platform</p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact 
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-md'
                          : 'text-maroon-700 hover:bg-saffron-50 hover:text-saffron-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="competitions" element={<CompetitionManager />} />
              <Route path="users" element={<UserManager />} />
              <Route path="notifications" element={<NotificationsManager />} />
              <Route path="submissions" element={<SubmissionsManager />} />
              <Route path="analytics" element={<Analytics />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOverview: React.FC = () => {
  const { t } = useLanguage();

  const [stats, setStats] = useState<Array<any>>([
    { title: 'Total Users', value: '...', change: '', icon: Users, color: 'saffron' },
    { title: 'Active Competitions', value: '...', change: '', icon: Trophy, color: 'gold' },
    { title: 'Total Submissions', value: '...', change: '', icon: FileText, color: 'maroon' },
    { title: 'Monthly Revenue', value: '₹0', change: 'Free Platform', icon: BarChart3, color: 'green' }
  ]);

  const [recentActivity, setRecentActivity] = useState<any>({ recentUser: null, recentEndedCompetitions: [], submissionsForActive: 0 });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data && res.data.success && mounted) {
          const d = res.data.data || {};
          setStats([
            { title: 'Total Users', value: d.totalUsers?.toString() ?? '0', change: '', icon: Users, color: 'saffron' },
            { title: 'Active Competitions', value: d.activeCompetitions?.toString() ?? '0', change: '', icon: Trophy, color: 'gold' },
            { title: 'Total Submissions', value: d.totalSubmissions?.toString() ?? '0', change: '', icon: FileText, color: 'maroon' },
            { title: 'Monthly Revenue', value: '₹0', change: 'Free Platform', icon: BarChart3, color: 'green' }
          ]);

          setRecentActivity({
            recentUser: d.mostRecentUser || null,
            recentEndedCompetitions: d.recentEndedCompetitions || [],
            submissionsForActive: d.submissionsForActive || 0
          });
        }
      } catch (err) {
        console.warn('Failed to load admin stats', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-maroon-800 mb-2">Dashboard Overview</h1>
        <p className="text-maroon-600">Welcome back! Here's what's happening on your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-maroon-800 mb-1">{stat.value}</h3>
              <p className="text-maroon-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-maroon-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/competitions"
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-saffron-50 to-gold-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <Plus className="h-5 w-5 text-saffron-600" />
              <span className="font-medium text-maroon-800">{t('admin.createCompetition')}</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cream-50 to-saffron-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <Users className="h-5 w-5 text-maroon-600" />
              <span className="font-medium text-maroon-800">Manage Users</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gold-50 to-cream-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <BarChart3 className="h-5 w-5 text-gold-600" />
              <span className="font-medium text-maroon-800">View Reports</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-maroon-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.recentUser ? (
              <div className="flex items-center space-x-3 p-3 bg-cream-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-maroon-700 text-sm">New user registered: {recentActivity.recentUser.FullName || recentActivity.recentUser.Email}</span>
              </div>
            ) : null}

            {recentActivity.recentEndedCompetitions && recentActivity.recentEndedCompetitions.length ? (
              recentActivity.recentEndedCompetitions.map((c: any) => (
                <div key={c.CompetitionID} className="flex items-center space-x-3 p-3 bg-cream-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-maroon-700 text-sm">Competition "{c.Title}" ended</span>
                </div>
              ))
            ) : null}

            <div className="flex items-center space-x-3 p-3 bg-cream-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-maroon-700 text-sm">{recentActivity.submissionsForActive ?? 0} new quiz submissions (active quizzes)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;