import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Bookmark, BarChart3, TrendingUp, Zap, Users, ArrowRight } from 'lucide-react';
import { dashboardAPI } from '../../api/services';
import { StatsCard } from '../../components/common/Card';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '../../components/common/Badge';
import { ScoreRing } from '../../components/common/Progress';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export default function InvestorDashboard() {
  const { user } = useSelector(s => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getInvestor().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading investor dashboard..." />;

  const { stats, industryDistribution, stageDistribution, topStartups } = data || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Banner */}
      <div className="gradient-primary rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-blue-100 text-sm mb-4">Discover and evaluate AI-powered startups ready for investment.</p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/investor/discover">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2">
                <Search size={16} /> Discover Startups
              </button>
            </Link>
            <Link to="/investor/saved">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2">
                <Bookmark size={16} /> Saved
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute right-4 top-4 opacity-10"><Zap className="w-40 h-40" /></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard title="Total Startups" value={stats?.totalStartups || 0} icon={Zap} subtitle="On platform" />
        <StatsCard title="Saved Startups" value={stats?.savedStartups || 0} icon={Bookmark} subtitle="In your watchlist" />
        <StatsCard title="New Alerts" value={stats?.unreadNotifications || 0} icon={TrendingUp} subtitle="Unread notifications" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Industry Distribution */}
        {industryDistribution?.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Startups by Industry</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={industryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {industryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}

        {/* Stage Distribution */}
        {stageDistribution?.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Startups by Stage</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stageDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="_id"
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                    {stageDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n, p) => [v, p.payload._id]} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Top Startups */}
      {topStartups?.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Zap size={18} className="text-purple-500" /> Top AI-Scored Startups</h2>
            <Link to="/investor/discover" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {topStartups.map(s => (
                <Link key={s._id} to={`/investor/startup/${s._id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                    {s.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge color="blue" size="xs">{s.industry}</Badge>
                      <Badge color="gray" size="xs">{s.stage}</Badge>
                    </div>
                  </div>
                  <ScoreRing score={s.aiScore?.overall || 0} size={48} />
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500" />
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
