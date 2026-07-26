import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Brain, TrendingUp, Users, FileText, GitBranch, BarChart3, Rocket, ArrowRight,
  Plus, Zap, Target, Eye, Handshake, CheckCircle, Mail, Send, MessageSquare
} from 'lucide-react';
import { dashboardAPI, offerAPI } from '../../api/services';
import { StatsCard } from '../../components/common/Card';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { ScoreRing, ProgressBar } from '../../components/common/Progress';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

export default function FounderDashboard() {
  const { user } = useSelector(s => s.auth);
  const [data, setData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Offers popup modal state
  const [offersModalOpen, setOffersModalOpen] = useState(false);
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [responseAction, setResponseAction] = useState('accepted');
  const [responseMessage, setResponseMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const loadData = () => {
    Promise.all([
      dashboardAPI.getFounder(),
      offerAPI.getFounderOffers().catch(() => ({ data: { data: [] } })),
    ])
      .then(([dashRes, offersRes]) => {
        setData(dashRes.data.data);
        setOffers(offersRes.data.data || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRespondModal = (offer, action) => {
    setSelectedOffer(offer);
    setResponseAction(action);
    setResponseMessage(
      action === 'accepted'
        ? `Thank you for your investment offer of ₹${(offer.amount / 100000).toFixed(1)}L for ${offer.equity}% equity in ${offer.startup?.name || 'our startup'}! We are excited to move forward.`
        : action === 'negotiating'
        ? `Thank you for the offer. We are very interested in partnering with you, but would like to discuss valuation and equity terms further.`
        : `Thank you for your interest and offer. After careful consideration, we have decided not to move forward at this time.`
    );
    setRespondModalOpen(true);
  };

  const handleSendResponse = async () => {
    if (!selectedOffer) return;
    setSubmittingResponse(true);
    try {
      await offerAPI.respond(selectedOffer._id, {
        status: responseAction,
        responseMessage,
      });

      toast.success(`Offer ${responseAction}! The investor has been notified.`);
      setRespondModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const { hasStartup, startup, stats, applicationsByStatus, recentAnalyses } = data || {};

  if (!hasStartup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-xl">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">Welcome to Fundora AI! 🚀</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          Hi <strong>{user?.name}</strong>! Start by creating your startup profile and let AI help you find the perfect investors.
        </p>
        <Link to="/founder/profile">
          <Button size="lg" icon={Plus}>Create Startup Profile</Button>
        </Link>
      </div>
    );
  }

  const scoreData = recentAnalyses?.slice().reverse().map((a, i) => ({
    name: `#${i + 1}`, score: a.scores?.overall || 0
  })) || [];

  const appStatusData = Object.entries(applicationsByStatus || {}).map(([status, count]) => ({
    status: status.replace('_', ' '), count,
  }));

  const pendingOffers = offers.filter(o => o.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="gradient-primary rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6" />
            <h1 className="text-xl font-bold">Good morning, {user?.name?.split(' ')[0]}! 👋</h1>
          </div>
          <p className="text-blue-100 text-sm mb-4">Here's your startup intelligence overview for today.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/founder/ai-analysis"><Button variant="ghost" size="sm" icon={Brain} className="bg-white/20 text-white hover:bg-white/30 border-0">Run AI Analysis</Button></Link>
            <Link to="/founder/profile"><Button variant="ghost" size="sm" icon={Rocket} className="bg-white/10 text-white hover:bg-white/20 border-0">Update Profile</Button></Link>
          </div>
        </div>
        <div className="absolute right-4 top-4 opacity-10">
          <Brain className="w-40 h-40" />
        </div>
      </div>

      {/* Investment Offers Alert if received */}
      {offers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl backdrop-blur-sm">
              🤝
            </div>
            <div>
              <p className="font-bold text-base">
                {pendingOffers.length > 0
                  ? `🎉 You have ${pendingOffers.length} new Investment Offer${pendingOffers.length > 1 ? 's' : ''}!`
                  : `You have received ${offers.length} Investment Offer${offers.length > 1 ? 's' : ''} total.`}
              </p>
              <p className="text-xs text-emerald-100 mt-0.5">
                Investors are interested in funding "{startup?.name}". Review and accept their proposals.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setOffersModalOpen(true)}
            className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 font-bold shadow-md"
          >
            View Offers Popup →
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Profile Complete" value={`${startup?.profileCompleteness || 0}%`} icon={Target} subtitle="Improve for better matches" />
        <StatsCard title="Applications" value={stats?.applications || 0} icon={GitBranch} subtitle="Total submitted" />
        <StatsCard title="AI Analyses" value={stats?.aiAnalyses || 0} icon={Brain} subtitle="Evaluations done" />
        <StatsCard title="Saved By" value={startup?.savedBy || 0} icon={Eye} subtitle="Investors interested" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Score Overview */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Brain size={18} className="text-blue-500" /> AI Score Overview
            </h2>
          </CardHeader>
          <CardBody>
            {startup?.aiScore?.overall > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ScoreRing score={startup.aiScore.overall} size={100} label="Overall Score" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Innovation', value: startup.aiScore.innovation },
                    { label: 'Market', value: startup.aiScore.market },
                    { label: 'Team', value: startup.aiScore.team },
                    { label: 'Business', value: startup.aiScore.business },
                  ].map(({ label, value }) => (
                    <ProgressBar key={label} label={label} value={value} showLabel color="gradient" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">No AI analysis yet</p>
                <Link to="/founder/ai-analysis"><Button size="sm" icon={Zap}>Analyze Now</Button></Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Profile Completeness */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Rocket size={18} className="text-purple-500" /> Startup Overview
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Profile Completeness</span>
                <span className="text-sm font-bold text-blue-600">{startup?.profileCompleteness || 0}%</span>
              </div>
              <ProgressBar value={startup?.profileCompleteness || 0} color="gradient" size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-slate-400 text-xs">Industry</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{startup?.industry}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-slate-400 text-xs">Stage</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{startup?.stage}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-slate-400 text-xs">Views</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{startup?.views || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-slate-400 text-xs">Saved By</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{startup?.savedBy || 0}</p>
              </div>
            </div>
            <Link to="/founder/profile">
              <Button variant="outline" size="sm" fullWidth>Complete Profile <ArrowRight size={14} /></Button>
            </Link>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Quick Actions</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {[
              { to: '/founder/ai-analysis', icon: Brain, label: 'Run AI Analysis', desc: 'Get instant startup evaluation', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
              { to: '/founder/documents', icon: FileText, label: 'Upload Documents', desc: 'Business plan, pitch deck', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
              { to: '/founder/investors', icon: Users, label: 'Find Investors', desc: 'AI-matched investor list', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
              { to: '/founder/schemes', icon: TrendingUp, label: 'Govt. Schemes', desc: 'Check eligible schemes', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
            ].map(({ to, icon: Icon, label, desc, color }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* ── OFFERS POPUP MODAL (ON SAME PAGE) ── */}
      <Modal
        isOpen={offersModalOpen}
        onClose={() => setOffersModalOpen(false)}
        title="🤝 Investment Offers Received"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setOffersModalOpen(false)}>Close</Button>
        }
      >
        <div className="space-y-4">
          {offers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No investment offers received yet.</p>
          ) : (
            offers.map(offer => {
              const amountLakhs = (offer.amount / 100000).toFixed(1);
              const impliedValuationLakhs = offer.valuation ? (offer.valuation / 100000).toFixed(0) : 0;
              const isPending = offer.status === 'pending';

              return (
                <div key={offer._id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center font-bold">
                        {offer.investorUser?.name?.charAt(0) || 'I'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {offer.investorUser?.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {offer.investorProfile?.firmName || offer.investorProfile?.investorType || 'Investor'}
                        </p>
                      </div>
                    </div>
                    <Badge color={offer.status === 'accepted' ? 'green' : offer.status === 'declined' ? 'red' : offer.status === 'negotiating' ? 'purple' : 'yellow'} size="xs">
                      {offer.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Offered</span>
                      <strong className="text-blue-600 dark:text-blue-400 text-sm">₹{amountLakhs}L</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Equity</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 text-sm">{offer.equity}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valuation</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">₹{impliedValuationLakhs}L</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Message:</strong> {offer.message}
                  </div>

                  {offer.responseMessage && (
                    <div className="p-2.5 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                      <strong>Your Response:</strong> {offer.responseMessage}
                    </div>
                  )}

                  {isPending && (
                    <div className="flex gap-2 justify-end pt-2">
                      <Button size="sm" variant="secondary" onClick={() => openRespondModal(offer, 'declined')}>Decline</Button>
                      <Button size="sm" variant="outline" onClick={() => openRespondModal(offer, 'negotiating')}>Negotiate</Button>
                      <Button size="sm" onClick={() => openRespondModal(offer, 'accepted')} className="gradient-emerald text-white" icon={CheckCircle}>
                        Accept Offer
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* ── RESPOND DECISION MODAL ── */}
      <Modal
        isOpen={respondModalOpen}
        onClose={() => setRespondModalOpen(false)}
        title={`${responseAction === 'accepted' ? 'Accept' : responseAction === 'negotiating' ? 'Negotiate' : 'Decline'} Offer`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRespondModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendResponse}
              loading={submittingResponse}
              icon={Send}
              className={responseAction === 'accepted' ? 'gradient-emerald text-white' : responseAction === 'declined' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}
            >
              Send Response
            </Button>
          </>
        }
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Offer: ₹{(selectedOffer.amount / 100000).toFixed(1)}L for {selectedOffer.equity}% equity
              </p>
              <p className="text-slate-400">From: {selectedOffer.investorUser?.name}</p>
            </div>

            <Input
              label="Response Message"
              name="responseMessage"
              rows={4}
              value={responseMessage}
              onChange={e => setResponseMessage(e.target.value)}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
