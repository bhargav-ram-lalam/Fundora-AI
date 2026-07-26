import React, { useState, useEffect } from 'react';
import { BarChart3, Brain, TrendingUp, FileText, Users, GitBranch } from 'lucide-react';
import { useSelector } from 'react-redux';
import { aiAPI, applicationAPI, proposalAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export default function FounderAnalytics() {
  const { startup } = useSelector(s => s.startup);
  const [analyses, setAnalyses] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!startup?._id) return setLoading(false);
    Promise.all([
      aiAPI.getAnalysis(startup._id),
      applicationAPI.getMy(),
    ]).then(([a, ap]) => {
      setAnalyses(a.data.data.filter(x => x.status === 'completed').reverse());
      setApps(ap.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [startup]);

  if (loading) return <LoadingSpinner />;

  // Prepare chart data
  const scoreTrend = analyses.map((a, i) => ({
    name: `Run ${i + 1}`,
    overall: a.scores?.overall || 0,
    innovation: a.scores?.innovation || 0,
    market: a.scores?.marketPotential || 0,
    team: a.scores?.teamStrength || 0,
  }));

  const appStatus = Object.entries(
    apps.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  const appTimeline = apps.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((a, i) => ({
    name: new Date(a.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    applications: i + 1,
  }));

  const latestScores = analyses[analyses.length - 1]?.scores;
  const scoreBreakdown = latestScores ? [
    { name: 'Innovation', value: latestScores.innovation || 0 },
    { name: 'Market', value: latestScores.marketPotential || 0 },
    { name: 'Team', value: latestScores.teamStrength || 0 },
    { name: 'Technology', value: latestScores.technology || 0 },
    { name: 'Business', value: latestScores.businessModel || 0 },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="text-blue-500" size={24} /> Analytics Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Track your progress and AI evaluation trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'AI Analyses', value: analyses.length, icon: Brain, color: 'from-blue-500 to-blue-600' },
          { label: 'Avg AI Score', value: analyses.length ? Math.round(analyses.reduce((s, a) => s + (a.scores?.overall || 0), 0) / analyses.length) + '/100' : 'N/A', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
          { label: 'Applications', value: apps.length, icon: GitBranch, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Approved', value: apps.filter(a => a.status === 'approved').length, icon: Users, color: 'from-orange-500 to-orange-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* AI Score Trend */}
      {scoreTrend.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Brain size={18} className="text-blue-500" /> AI Score Trend
            </h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={scoreTrend}>
                <defs>
                  <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, n) => [`${v}/100`, n]} />
                <Legend />
                <Area type="monotone" dataKey="overall" stroke="#2563eb" fill="url(#overallGrad)" strokeWidth={2} name="Overall" />
                <Line type="monotone" dataKey="innovation" stroke="#7c3aed" strokeWidth={2} dot={false} name="Innovation" />
                <Line type="monotone" dataKey="market" stroke="#10b981" strokeWidth={2} dot={false} name="Market" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Breakdown (latest) */}
        {scoreBreakdown.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Latest Score Breakdown</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => [`${v}/100`]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {scoreBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}

        {/* Application Status */}
        {appStatus.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Application Status Distribution</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={appStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {appStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Application Timeline */}
      {appTimeline.length > 1 && (
        <Card>
          <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Cumulative Applications Over Time</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={appTimeline}>
                <defs>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="applications" stroke="#7c3aed" fill="url(#appGrad)" strokeWidth={2} name="Total Applications" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {analyses.length === 0 && apps.length === 0 && (
        <Card>
          <CardBody className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No data yet</h3>
            <p className="text-sm text-slate-400">Run an AI analysis and submit applications to see your analytics here.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
