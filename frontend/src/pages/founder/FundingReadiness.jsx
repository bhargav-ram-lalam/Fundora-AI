import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { aiAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ProgressBar, ScoreRing } from '../../components/common/Progress';
import { Badge } from '../../components/common/Badge';
import LoadingSpinner, { AlertBanner } from '../../components/common/LoadingSpinner';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const priorityColors = { high: 'bg-red-100 text-red-700 border-red-200', medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', low: 'bg-blue-100 text-blue-700 border-blue-200' };
const statusColors = { excellent: 'text-emerald-600 bg-emerald-50', good: 'text-blue-600 bg-blue-50', fair: 'text-yellow-600 bg-yellow-50', poor: 'text-red-600 bg-red-50' };

export default function FundingReadiness() {
  const { startup } = useSelector(s => s.startup);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = () => {
    if (!startup?._id) return setLoading(false);
    aiAPI.getFundingReadiness(startup._id).then(r => {
      const completed = r.data.data.find(d => d.status === 'completed');
      if (completed) setReport(completed);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [startup]);

  const handleGenerate = async () => {
    if (!startup?._id) return toast.error('Create your startup profile first');
    setGenerating(true);
    try {
      await aiAPI.generateFundingReadiness(startup._id);
      toast.success('Funding readiness report generating... Refresh in 30 seconds.');
      setTimeout(() => { load(); setGenerating(false); }, 30000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
      setGenerating(false);
    }
  };

  const readinessLevelColor = { 'Not Ready': 'red', 'Early Stage': 'orange', 'Developing': 'yellow', 'Ready': 'blue', 'Highly Ready': 'green' };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><TrendingUp className="text-purple-500" size={24} /> Funding Readiness</h1>
          <p className="text-slate-500 text-sm mt-1">AI-powered assessment of your funding readiness</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>
          <Button icon={Zap} onClick={handleGenerate} loading={generating} variant="gradient">
            {report ? 'Regenerate Report' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {!report ? (
        <Card>
          <CardBody className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Generate Your Funding Readiness Report</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">Get an AI-powered assessment of how ready your startup is for investment, with specific action items to improve.</p>
            <Button icon={Zap} size="lg" onClick={handleGenerate} loading={generating} variant="gradient">Generate with AI</Button>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Overall Score */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardBody className="text-center">
                <ScoreRing score={report.overallScore} size={120} label="Funding Readiness" />
                <div className="mt-4">
                  <Badge color={readinessLevelColor[report.readinessLevel] || 'blue'} size="md">{report.readinessLevel}</Badge>
                </div>
                {report.estimatedTimeToReady && (
                  <p className="text-xs text-slate-400 mt-3">Est. time to investment ready: <strong className="text-slate-600">{report.estimatedTimeToReady}</strong></p>
                )}
              </CardBody>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Category Scores</h2></CardHeader>
              <CardBody className="space-y-4">
                {report.categoryScores?.map(cat => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[cat.status] || ''}`}>{cat.status}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{cat.score}/{cat.maxScore}</span>
                    </div>
                    <ProgressBar value={cat.score} max={cat.maxScore} color={cat.status === 'excellent' ? 'green' : cat.status === 'good' ? 'blue' : cat.status === 'fair' ? 'orange' : 'red'} size="sm" />
                    {cat.details && <p className="text-xs text-slate-400 mt-1">{cat.details}</p>}
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Missing vs Completed */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500" /> Completed Items</h2></CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {report.completedItems?.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={14} className="flex-shrink-0" />{item}
                    </li>
                  ))}
                  {(!report.completedItems || report.completedItems.length === 0) && <p className="text-sm text-slate-400">None completed yet</p>}
                </ul>
              </CardBody>
            </Card>
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><XCircle size={18} className="text-red-500" /> Missing Items</h2></CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {report.missingItems?.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <XCircle size={14} className="flex-shrink-0" />{item}
                    </li>
                  ))}
                  {(!report.missingItems || report.missingItems.length === 0) && <p className="text-sm text-slate-400">🎉 All items complete!</p>}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Action Plan */}
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Action Plan</h2></CardHeader>
            <CardBody>
              <div className="space-y-3">
                {report.actionPlan?.map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${priorityColors[item.priority]} flex items-start gap-4`}>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${priorityColors[item.priority]}`}>{item.priority}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.action}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs opacity-70">⏱ {item.timeline}</span>
                        <span className="text-xs opacity-70">💡 {item.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Insights */}
          {report.insights && (
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">AI Insights</h2></CardHeader>
              <CardBody><p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{report.insights}</p></CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
