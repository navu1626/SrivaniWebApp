import React from 'react';
import { TrendingUp, Users, Trophy, Calendar, Download } from 'lucide-react';

const Analytics: React.FC = () => {
  // Mock data for analytics
  const stats = [
    { title: 'Total Participants', value: '1,234', change: '+12%', trend: 'up' },
    { title: 'Active Competitions', value: '8', change: '+2', trend: 'up' },
    { title: 'Completed Quizzes', value: '3,456', change: '+156', trend: 'up' },
    { title: 'Average Score', value: '78%', change: '+3%', trend: 'up' }
  ];

  const competitionStats = [
    { name: 'Jain Philosophy Quiz', participants: 234, avgScore: 85, completion: 92 },
    { name: 'Spiritual Stories', participants: 187, avgScore: 78, completion: 88 },
    { name: 'Principles Quiz', participants: 156, avgScore: 82, completion: 95 }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-maroon-800 mb-2">Analytics Dashboard</h1>
          <p className="text-maroon-600">Track performance and engagement metrics</p>
        </div>
        <button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg">
          <Download className="h-5 w-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-saffron-100">
                <TrendingUp className="h-6 w-6 text-saffron-600" />
              </div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-maroon-800 mb-1">{stat.value}</h3>
            <p className="text-maroon-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Participation Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-maroon-800 mb-6">Participation Trends</h2>
          <div className="h-64 bg-gradient-to-br from-cream-50 to-saffron-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-saffron-400 mx-auto mb-2" />
              <p className="text-maroon-600">Chart visualization would go here</p>
              <p className="text-sm text-maroon-500">Showing growth over last 6 months</p>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-maroon-800 mb-6">Score Distribution</h2>
          <div className="h-64 bg-gradient-to-br from-gold-50 to-cream-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-gold-400 mx-auto mb-2" />
              <p className="text-maroon-600">Score distribution chart</p>
              <p className="text-sm text-maroon-500">Average score: 78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Competition Performance Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-maroon-800 mb-6">Competition Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="text-left py-3 px-4 font-semibold text-maroon-700">Competition</th>
                <th className="text-left py-3 px-4 font-semibold text-maroon-700">Participants</th>
                <th className="text-left py-3 px-4 font-semibold text-maroon-700">Avg Score</th>
                <th className="text-left py-3 px-4 font-semibold text-maroon-700">Completion Rate</th>
                <th className="text-left py-3 px-4 font-semibold text-maroon-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {competitionStats.map((comp, index) => (
                <tr key={index} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-maroon-800">{comp.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-maroon-400" />
                      <span className="text-maroon-700">{comp.participants}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      comp.avgScore >= 80 
                        ? 'bg-green-100 text-green-700'
                        : comp.avgScore >= 70
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {comp.avgScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-cream-200 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-gradient-to-r from-saffron-500 to-gold-500 h-2 rounded-full"
                          style={{ width: `${comp.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-maroon-600">{comp.completion}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;