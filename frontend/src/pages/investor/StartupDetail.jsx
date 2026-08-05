import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Globe, Linkedin, Brain, TrendingUp, Users, DollarSign,
  CheckCircle, Star, Bookmark, FileText, Download, ExternalLink, File,
  Send, Handshake, Zap
} from 'lucide-react';
import { startupAPI, investorAPI, proposalAPI, offerAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ScoreRing, ProgressBar } from '../../components/common/Progress';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const DOC_TYPE_LABELS = {
  business_plan: 'Business Plan',
  pitch_deck: 'Pitch Deck',
  financial: 'Financial Document',
  prototype: 'Prototype / Image',
  other: 'Other',
};

const DOC_TYPE_ICONS = {
  business_plan: '📋',
  pitch_deck: '🎯',
  financial: '💰',
  prototype: '🖼️',
  other: '📄',
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function StartupDetail() {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Offer modal state
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    amount: '',
    equity: '',
    message: '',
    terms: '',
  });
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [existingOffer, setExistingOffer] = useState(null);

  useEffect(() => {
    Promise.all([
      startupAPI.getById(id),
      proposalAPI.getByStartup(id),
      investorAPI.getSaved().catch(() => ({ data: { data: [] } })),
      offerAPI.getInvestorOffers().catch(() => ({ data: { data: [] } })),
    ])
      .then(([startupRes, docsRes, savedRes, offersRes]) => {
        setStartup(startupRes.data.data);
        setDocuments(docsRes.data.data || []);

        // Saved state
        const savedIds = (savedRes.data.data || []).filter(s => s && s._id).map(s => s._id);
        setSaved(savedIds.includes(id));

        // Check if an offer was already made for this startup
        const foundOffer = (offersRes.data.data || []).filter(o => o && o.startup).find(o => o.startup?._id === id || o.startup === id);
        if (foundOffer) {
          setExistingOffer(foundOffer);
        }
      })
      .catch(() => toast.error('Failed to load startup details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!startup) return <div className="text-center py-20 text-slate-500">Startup not found</div>;

  const radarData = startup.aiScore?.overall > 0 ? [
    { subject: 'Innovation', value: startup.aiScore?.innovation || 0 },
    { subject: 'Market', value: startup.aiScore?.market || 0 },
    { subject: 'Team', value: startup.aiScore?.team || 0 },
    { subject: 'Business', value: startup.aiScore?.business || 0 },
    { subject: 'Technology', value: startup.aiScore?.technology || 0 },
  ] : [];

  const handleSave = async () => {
    setSaving(true);
    try {
      await investorAPI.save(startup._id);
      setSaved(prev => !prev);
      toast.success(saved ? 'Removed from saved' : 'Startup saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const openOfferModal = () => {
    setOfferForm({
      amount: startup.fundingRequired ? String(startup.fundingRequired) : '',
      equity: startup.equityOffered ? String(startup.equityOffered) : '10',
      message: `Hi ${startup.founderDetails?.name || 'Founder'}, I reviewed "${startup.name}" on Fundora AI and am impressed with your business model and vision. I would like to propose an investment to help scale your operations.`,
      terms: '',
    });
    setOfferModalOpen(true);
  };

  const handleSendOffer = async () => {
    if (!offerForm.amount || Number(offerForm.amount) <= 0) {
      return toast.error('Please enter a valid investment amount');
    }
    if (!offerForm.equity || Number(offerForm.equity) <= 0 || Number(offerForm.equity) > 100) {
      return toast.error('Please enter a valid equity percentage (1-100%)');
    }
    if (!offerForm.message.trim()) {
      return toast.error('Please enter a message to the founder');
    }

    setSubmittingOffer(true);
    try {
      const res = await offerAPI.create({
        startupId: startup._id,
        amount: offerForm.amount,
        equity: offerForm.equity,
        message: offerForm.message,
        terms: offerForm.terms,
      });

      toast.success('🎉 Investment Offer sent successfully to the founder!');
      setExistingOffer(res.data.data);
      setOfferModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send investment offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Implied valuation calculation
  const impliedValuation = (Number(offerForm.amount) > 0 && Number(offerForm.equity) > 0)
    ? Math.round((Number(offerForm.amount) / Number(offerForm.equity)) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl mx-auto">
      <Link to="/investor/discover" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <ArrowLeft size={16} /> Back to Discovery
      </Link>

      {/* Existing Offer Alert if already sent */}
      {existingOffer && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Handshake size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                You have sent an Investment Offer of ₹{(existingOffer.amount / 100000).toFixed(1)}L for {existingOffer.equity}% equity
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Status: <strong className="capitalize">{existingOffer.status}</strong> • Sent on {new Date(existingOffer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge color={existingOffer.status === 'accepted' ? 'green' : existingOffer.status === 'declined' ? 'red' : 'yellow'}>
            {existingOffer.status.toUpperCase()}
          </Badge>
        </div>
      )}

      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {startup.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{startup.name}</h1>
                  {startup.tagline && <p className="text-slate-500 dark:text-slate-400 mt-1">{startup.tagline}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge color="blue">{startup.industry}</Badge>
                    <Badge color="purple">{startup.stage}</Badge>
                    {startup.city && <Badge color="gray">{startup.city}, {startup.country}</Badge>}
                    {startup.isRegistered && <Badge color="green" dot>Registered</Badge>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${saved ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-400 hover:text-blue-500'}`}
                  >
                    <Bookmark size={16} className={saved ? 'fill-blue-500 text-blue-500' : ''} />
                    {saved ? 'Saved' : 'Save'}
                  </button>

                  <Button
                    onClick={openOfferModal}
                    className="gradient-emerald text-white shadow-lg shadow-emerald-500/20"
                    icon={Handshake}
                  >
                    {existingOffer ? 'Send Another Offer' : 'Make Investment Offer'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Funding Required', value: `₹${((startup.fundingRequired || 0) / 100000).toFixed(0)}L`, icon: DollarSign },
              { label: 'Equity Offered', value: `${startup.equityOffered || 'N/A'}%`, icon: TrendingUp },
              { label: 'Team Size', value: startup.teamSize || 1, icon: Users },
              { label: 'Profile Complete', value: `${startup.profileCompleteness || 0}%`, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Problem & Solution */}
          <Card>
            <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Business Overview</h2></CardHeader>
            <CardBody className="space-y-4">
              {startup.problemStatement && <div><h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Problem Statement</h3><p className="text-sm text-slate-600 dark:text-slate-400">{startup.problemStatement}</p></div>}
              {startup.proposedSolution && <div><h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Solution</h3><p className="text-sm text-slate-600 dark:text-slate-400">{startup.proposedSolution}</p></div>}
              {startup.businessModel && <div><h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Business Model</h3><p className="text-sm text-slate-600 dark:text-slate-400">{startup.businessModel}</p></div>}
              {startup.targetMarket && <div><h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Market</h3><p className="text-sm text-slate-600 dark:text-slate-400">{startup.targetMarket} {startup.marketSize && `(${startup.marketSize})`}</p></div>}
              {startup.uniqueValueProp && <div><h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Unique Value Proposition</h3><p className="text-sm text-slate-600 dark:text-slate-400">{startup.uniqueValueProp}</p></div>}
            </CardBody>
          </Card>

          {/* Team */}
          {startup.founderDetails?.name && (
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Team</h2></CardHeader>
              <CardBody>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">{startup.founderDetails.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{startup.founderDetails.name}</p>
                    <p className="text-xs text-slate-400">{startup.founderDetails.title} • {startup.founderDetails.experience}</p>
                  </div>
                </div>
                {startup.teamMembers?.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600">{m.name.charAt(0)}</div>
                    <div><p className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.name}</p><p className="text-xs text-slate-400">{m.role}</p></div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Documents uploaded by founder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" /> Documents
                </h2>
                <Badge color={documents.length > 0 ? 'blue' : 'gray'} size="xs">
                  {documents.length} file{documents.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <File className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No documents uploaded yet by this startup.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="text-2xl flex-shrink-0">{DOC_TYPE_ICONS[doc.type] || '📄'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{doc.title}</p>
                        <p className="text-xs text-slate-400">
                          {DOC_TYPE_LABELS[doc.type] || doc.type}
                          {doc.fileSize ? ` • ${formatSize(doc.fileSize)}` : ''}
                          {doc.description ? ` • ${doc.description}` : ''}
                        </p>
                      </div>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `${(import.meta.env.VITE_API_URL || 'https://fundora-ai-z6lg.onrender.com/api').replace(/\/api\/?$/, '')}${doc.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          title="Download / View"
                        >
                          <Download size={15} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Action callout */}
          <Card className="border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardBody className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Handshake size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Impressed with this Startup?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send a formal investment offer or express interest directly to the founder.
              </p>
              <Button fullWidth onClick={openOfferModal} className="gradient-emerald text-white" icon={Send}>
                Make Investment Offer
              </Button>
            </CardBody>
          </Card>

          {/* AI Scores */}
          {startup.aiScore?.overall > 0 && (
            <Card>
              <CardHeader><h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Brain size={16} className="text-blue-500" /> AI Evaluation</h2></CardHeader>
              <CardBody className="text-center">
                <ScoreRing score={startup.aiScore.overall} size={100} label="Overall Score" />
                {radarData.length > 0 && (
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
                <div className="mt-3 space-y-2 text-left">
                  {[
                    { label: 'Innovation', val: startup.aiScore.innovation },
                    { label: 'Market', val: startup.aiScore.market },
                    { label: 'Team', val: startup.aiScore.team },
                    { label: 'Business', val: startup.aiScore.business },
                    { label: 'Technology', val: startup.aiScore.technology },
                  ].filter(i => i.val > 0).map(({ label, val }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{val}</span>
                      </div>
                      <ProgressBar value={val} size="sm" color={val >= 75 ? 'green' : val >= 50 ? 'gradient' : 'orange'} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Tech Stack */}
          {startup.techStack?.length > 0 && (
            <Card>
              <CardHeader><h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tech Stack</h2></CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-1.5">
                  {startup.techStack.map(t => <Badge key={t} color="indigo" size="xs">{t}</Badge>)}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Links */}
          {(startup.website || startup.linkedin) && (
            <Card>
              <CardHeader><h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Links</h2></CardHeader>
              <CardBody className="space-y-2">
                {startup.website && <a href={startup.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline"><Globe size={14} /> Website</a>}
                {startup.linkedin && <a href={startup.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline"><Linkedin size={14} /> LinkedIn</a>}
                {startup.demoVideo && <a href={startup.demoVideo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline"><ExternalLink size={14} /> Demo Video</a>}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Investment Offer Modal */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={`Make Investment Offer to ${startup.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOfferModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendOffer} loading={submittingOffer} icon={Send} className="gradient-emerald text-white">
              Send Offer to Founder
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Target Startup: <strong>{startup.name}</strong> • Seeking: ₹{((startup.fundingRequired || 0) / 100000).toFixed(0)}L for {startup.equityOffered || 'N/A'}% equity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Offered Amount (INR)"
              name="amount"
              type="number"
              placeholder="e.g. 5000000"
              value={offerForm.amount}
              onChange={e => setOfferForm(p => ({ ...p, amount: e.target.value }))}
              required
            />
            <Input
              label="Equity Requested (%)"
              name="equity"
              type="number"
              placeholder="e.g. 10"
              value={offerForm.equity}
              onChange={e => setOfferForm(p => ({ ...p, equity: e.target.value }))}
              suffix="%"
              required
            />
          </div>

          {impliedValuation > 0 && (
            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <span className="text-slate-500">Implied Post-Money Valuation:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                ₹{(impliedValuation / 10000000).toFixed(2)} Crore (₹{(impliedValuation / 100000).toFixed(0)} Lakhs)
              </span>
            </div>
          )}

          <Input
            label="Message / Proposal to Founder"
            name="message"
            rows={4}
            placeholder="Explain why you're interested in funding their startup, your value add, strategic support, next steps..."
            value={offerForm.message}
            onChange={e => setOfferForm(p => ({ ...p, message: e.target.value }))}
            required
          />

          <Input
            label="Investment Terms & Conditions (Optional)"
            name="terms"
            rows={2}
            placeholder="e.g. Subject to due diligence, board seat requirement, SAFE note..."
            value={offerForm.terms}
            onChange={e => setOfferForm(p => ({ ...p, terms: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
