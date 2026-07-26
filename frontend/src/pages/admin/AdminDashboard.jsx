import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Rocket, Brain, Activity, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { dashboardAPI } from '../../api/services';
import { StatsCard } from '../../components/common/Card';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell } from 'recharts';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/Progress';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdmin().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load admin dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  const { stats, industryDistribution, registrations, aiStats, recentUsers } = data || {};

  const industryData = industryDistribution?.map(d => ({ name: d._id, count: d.count })) || [];
  const regData = registrations?.map(r => ({ date: `${r._id.month}/${r._id.year}`, users: r.count })) || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">Admin Control Center</h1>
          </div>
          <p className="text-slate-400 text-sm mb-4">Full platform overview and management</p>
          <div className="flex flex-wrap gap-2">
            {[
              { to: '/admin/users', label: 'Manage Users' },
              { to: '/admin/startups', label: 'Review Startups' },
              { to: '/admin/schemes', label: 'Gov. Schemes' },
              { to: '/admin/ai-stats', label: 'AI Statistics' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all">
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute right-4 top-4 opacity-5"><Shield className="w-48 h-48" /></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} trend={12} trendLabel="vs last month" />
        <StatsCard title="Total Startups" value={stats?.totalStartups || 0} icon={Rocket} trend={8} trendLabel="vs last month" />
        <StatsCard title="AI Analyses" value={stats?.totalAnalyses || 0} icon={Brain} subtitle="Completed evaluations" />
        <StatsCard title="Applications" value={stats?.totalApplications || 0} icon={Activity} subtitle="All applications" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Founders', value: stats?.usersByRole?.founder || 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Investors', value: stats?.usersByRole?.investor || 0, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Admins', value: stats?.usersByRole?.admin || 0, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Gov. Schemes', value: stats?.totalSchemes || 0, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <CardBody className={`text-center ${bg} rounded-2xl`}>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Industry Distribution */}
        {industryData.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Startups by Industry</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={industryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}

        {/* User Registrations */}
        {regData.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">User Registrations Over Time</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={regData}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#2563eb" fill="url(#regGrad)" strokeWidth={2} name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}
      </div>

      {/* AI Stats */}
      {aiStats && (
        <Card>
          <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Brain size={18} className="text-purple-500" /> AI Analysis Statistics</h2></CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{Math.round(aiStats.avgOverallScore || 0)}</p>
                <p className="text-xs text-slate-400 mt-1">Avg Overall Score</p>
                <ProgressBar value={aiStats.avgOverallScore || 0} color="purple" size="sm" className="mt-2" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{aiStats.completed || 0}</p>
                <p className="text-xs text-slate-400 mt-1">Completed Analyses</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-xs text-emerald-600">{aiStats.processing || 0} processing</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{aiStats.failed || 0}</p>
                <p className="text-xs text-slate-400 mt-1">Failed Analyses</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <AlertTriangle size={14} className="text-orange-500" />
                  <span className="text-xs text-orange-600">needs attention</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Users */}
      {recentUsers?.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <Badge color={u.role === 'admin' ? 'red' : u.role === 'investor' ? 'green' : 'blue'} size="xs" dot>{u.role}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
