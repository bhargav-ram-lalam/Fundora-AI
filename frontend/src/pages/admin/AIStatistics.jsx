import React, { useState, useEffect } from 'react';
import { Brain, Activity, TrendingUp, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { adminAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { StatsCard } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/Progress';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

export default function AIStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAIStats().then(r => setStats(r.data.data)).catch(() => toast.error('Failed to load AI stats')).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const categoryData = [
    { name: 'Innovation', avg: Math.round(stats.avgScores?.innovation || 0) },
    { name: 'Market', avg: Math.round(stats.avgScores?.marketPotential || 0) },
    { name: 'Team', avg: Math.round(stats.avgScores?.teamStrength || 0) },
    { name: 'Technology', avg: Math.round(stats.avgScores?.technology || 0) },
    { name: 'Business', avg: Math.round(stats.avgScores?.businessModel || 0) },
    { name: 'Investment', avg: Math.round(stats.avgScores?.investmentPotential || 0) },
  ];

  const statusData = [
    { name: 'Completed', value: stats.completed || 0 },
    { name: 'Processing', value: stats.processing || 0 },
    { name: 'Failed', value: stats.failed || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Brain className="text-purple-500" size={24} /> AI Statistics</h1>
        <p className="text-slate-500 text-sm mt-1">Platform-wide AI analysis performance and insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Analyses" value={stats.total || 0} icon={Brain} subtitle="All time" />
        <StatsCard title="Completed" value={stats.completed || 0} icon={CheckCircle} subtitle="Successfully done" />
        <StatsCard title="Avg Score" value={`${Math.round(stats.avgScores?.overall || 0)}/100`} icon={TrendingUp} subtitle="Platform average" />
        <StatsCard title="Failed" value={stats.failed || 0} icon={AlertTriangle} subtitle="Needs attention" />
      </div>

      {/* Processing Status Pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        {statusData.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Analysis Status Distribution</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}

        {/* Avg Scores by Category */}
        <Card>
          <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Average Scores by Category</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`${v}/100`]} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Score breakdown bars */}
      <Card>
        <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Platform Score Averages</h2></CardHeader>
        <CardBody className="space-y-4">
          {categoryData.map(cat => (
            <div key={cat.name}>
              <ProgressBar label={cat.name} value={cat.avg} showLabel color="gradient" size="md" />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
