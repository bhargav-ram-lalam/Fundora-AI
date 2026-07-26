import React, { useState, useEffect } from 'react';
import { Brain, Zap, RefreshCw, AlertTriangle, TrendingUp, Shield, Users, Lightbulb, Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { aiAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ScoreRing, ProgressBar } from '../../components/common/Progress';
import { Badge } from '../../components/common/Badge';
import LoadingSpinner, { AlertBanner, EmptyState } from '../../components/common/LoadingSpinner';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import toast from 'react-hot-toast';

const SCORE_COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export default function AIAnalysis() {
  const { startup } = useSelector(s => s.startup);
  const [analyses, setAnalyses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const load = () => {
    if (!startup?._id) return setLoading(false);
    aiAPI.getAnalysis(startup._id).then(r => {
      setAnalyses(r.data.data);
      if (r.data.data.length > 0) {
        const completed = r.data.data.find(a => a.status === 'completed');
        setSelected(completed || r.data.data[0]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [startup]);

  // Auto-poll every 10s while an analysis is processing
  useEffect(() => {
    if (!analyses.some(a => a.status === 'processing')) return;
    const interval = setInterval(() => load(), 10000);
    return () => clearInterval(interval);
  }, [analyses]);

  const handleAnalyze = async () => {
    if (!startup?._id) return toast.error('Create your startup profile first');
    setAnalyzing(true);
    try {
      await aiAPI.analyzeStartup(startup._id);
      toast.success('AI Analysis started! Refreshing in 15 seconds...');
      setTimeout(() => { load(); setAnalyzing(false); }, 15000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
      setAnalyzing(false);
    }
  };

  const handlePoll = () => { load(); toast('Checking for results...'); };

  // Check if profile was updated after the last analysis
  const isStale = selected?.status === 'completed' && startup?.updatedAt &&
    new Date(startup.updatedAt) > new Date(selected.createdAt);

  if (loading) return <LoadingSpinner text="Loading analysis..." />;

  const radarData = selected?.scores ? [
    { subject: 'Innovation', value: selected.scores.innovation },
    { subject: 'Market', value: selected.scores.marketPotential },
    { subject: 'Team', value: selected.scores.teamStrength },
    { subject: 'Business', value: selected.scores.businessModel },
    { subject: 'Technology', value: selected.scores.technology },
    { subject: 'Investment', value: selected.scores.investmentPotential },
  ] : [];

  const barData = selected?.scores ? [
    { name: 'Innovation', score: selected.scores.innovation },
    { name: 'Market', score: selected.scores.marketPotential },
    { name: 'Funding Ready', score: selected.scores.fundingReadiness },
    { name: 'Technology', score: selected.scores.technology },
    { name: 'Team', score: selected.scores.teamStrength },
    { name: 'Business', score: selected.scores.businessModel },
    { name: 'Investment', score: selected.scores.investmentPotential },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Brain className="text-blue-500" size={24} /> AI Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">Powered by Google Gemini AI</p>
        </div>
        <div className="flex gap-3">
          {analyses.some(a => a.status === 'processing') && (
            <Button variant="secondary" icon={RefreshCw} onClick={handlePoll}>Check Results</Button>
          )}
          <Button icon={Zap} onClick={handleAnalyze} loading={analyzing}>
            {analyses.length > 0 ? 'Re-Analyze' : 'Analyze with AI'}
          </Button>
        </div>
      </div>

      {analyses.some(a => a.status === 'processing') && (
        <AlertBanner type="info" title="Analysis in Progress" message="Gemini AI is evaluating your startup. Auto-refreshing every 10 seconds..." />
      )}

      {/* Stale analysis warning — show when profile was updated after last analysis */}
      {isStale && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
          <RefreshCw className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Profile Updated — Analysis May Be Outdated</p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">You updated your startup profile after the last AI analysis. Re-run the analysis to get fresh scores and updated improvement suggestions.</p>
          </div>
          <Button size="sm" icon={Zap} onClick={handleAnalyze} loading={analyzing}>Re-Analyze Now</Button>
        </div>
      )}

      {!startup?._id && (
        <EmptyState icon={Brain} title="No Startup Profile" description="Create your startup profile to get AI-powered analysis" action={<Button>Create Profile</Button>} />
      )}

      {startup?._id && analyses.length === 0 && (
        <Card>
          <CardBody className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Run Your First AI Analysis</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Get a comprehensive AI evaluation of your startup including Innovation Score, Market Potential, SWOT Analysis, and actionable investment insights.
            </p>
            <Button icon={Zap} size="lg" onClick={handleAnalyze} loading={analyzing}>Analyze with Gemini AI</Button>
          </CardBody>
        </Card>
      )}

      {selected && selected.status === 'failed' && (
        <Card>
          <CardBody className="py-8">
            <EmptyState 
              icon={AlertTriangle} 
              title="Analysis Failed" 
              description={`The AI evaluation could not be completed. ${selected.errorMessage || 'Please try again.'}`} 
            />
          </CardBody>
        </Card>
      )}

      {selected && selected.status === 'completed' && (
        <>
          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall', score: selected.scores.overall, icon: Star },
              { label: 'Innovation', score: selected.scores.innovation, icon: Lightbulb },
              { label: 'Market Potential', score: selected.scores.marketPotential, icon: TrendingUp },
              { label: 'Investment', score: selected.scores.investmentPotential, icon: Zap },
            ].map(({ label, score, icon: Icon }) => (
              <Card key={label}>
                <CardBody className="text-center">
                  <ScoreRing score={score} size={80} />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">{label}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Performance Radar</h2></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Score Breakdown</h2></CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={v => [`${v}/100`]} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {barData.map((_, i) => <Cell key={i} fill={SCORE_COLORS[i % SCORE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* SWOT */}
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">SWOT Analysis</h2></CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Strengths 💪', items: selected.swot?.strengths, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', textColor: 'text-emerald-800 dark:text-emerald-300', dotColor: 'bg-emerald-500' },
                  { title: 'Weaknesses ⚠️', items: selected.swot?.weaknesses, color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-800 dark:text-yellow-300', dotColor: 'bg-yellow-500' },
                  { title: 'Opportunities 🚀', items: selected.swot?.opportunities, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', textColor: 'text-blue-800 dark:text-blue-300', dotColor: 'bg-blue-500' },
                  { title: 'Threats 🛡️', items: selected.swot?.threats, color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', textColor: 'text-red-800 dark:text-red-300', dotColor: 'bg-red-500' },
                ].map(({ title, items, color, textColor, dotColor }) => (
                  <div key={title} className={`p-4 rounded-xl border ${color}`}>
                    <h3 className={`text-sm font-bold mb-3 ${textColor}`}>{title}</h3>
                    <ul className="space-y-2">
                      {items?.map((item, i) => (
                        <li key={i} className={`flex items-start gap-2 text-xs ${textColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Executive Summary & Suggestions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Executive Summary</h2></CardHeader>
              <CardBody><p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selected.executiveSummary}</p></CardBody>
            </Card>
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Lightbulb size={18} className="text-yellow-500" /> Improvement Suggestions</h2></CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {selected.improvementSuggestions?.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-6 h-6 rounded-full gradient-primary text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Risk Analysis */}
          {selected.riskAnalysis && (
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Shield size={18} className="text-red-500" /> Risk Analysis</h2></CardHeader>
              <CardBody>
                <div className="flex gap-4 mb-4">
                  <Badge color={selected.scores.riskScore < 30 ? 'green' : selected.scores.riskScore < 60 ? 'yellow' : 'red'}>
                    Risk Score: {selected.scores.riskScore}/100
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selected.riskAnalysis}</p>
                {selected.redFlags?.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200">
                    <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Red Flags</h4>
                    <ul className="space-y-1">
                      {selected.redFlags.map((f, i) => <li key={i} className="text-xs text-red-600">• {f}</li>)}
                    </ul>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </>
      )}
      
      {/* Analysis History */}
      {analyses.length > 1 && (
        <Card>
          <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Analysis History</h2></CardHeader>
          <CardBody>
            <div className="space-y-2">
              {analyses.map((a, i) => (
                <button key={a._id} onClick={() => { if (a.status !== 'processing') setSelected(a); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${selected?._id === a._id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Analysis #{analyses.length - i} — {new Date(a.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    {a.status === 'completed' && <Badge color="blue">Score: {a.scores?.overall}/100</Badge>}
                    <Badge color={a.status === 'completed' ? 'green' : a.status === 'processing' ? 'blue' : 'red'}>{a.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
