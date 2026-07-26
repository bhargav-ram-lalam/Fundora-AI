import React, { useState, useEffect, useRef } from 'react';
import { Users, Star, Building2, TrendingUp, DollarSign, Send, Search, Filter, Globe, Linkedin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { investorAPI, applicationAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/Progress';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input, { Select } from '../../components/common/Input';
import toast from 'react-hot-toast';

const INVESTOR_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'Angel Investor', label: 'Angel Investor' },
  { value: 'Venture Capital', label: 'Venture Capital' },
  { value: 'Private Equity', label: 'Private Equity' },
  { value: 'Corporate VC', label: 'Corporate VC' },
  { value: 'Government Fund', label: 'Government Fund' },
  { value: 'Family Office', label: 'Family Office' },
  { value: 'Accelerator', label: 'Accelerator' },
];

function InvestorCard({ investor, compatibilityScore, onApply }) {
  const pct = compatibilityScore || 0;
  const isMatched = pct > 0;

  return (
    <Card hover>
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {investor.user?.name?.charAt(0) || investor.firmName?.charAt(0) || 'I'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                {investor.user?.name || 'Investor'}
              </h3>
              {investor.firmName && (
                <p className="text-xs text-slate-400 truncate">{investor.firmName}</p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            {isMatched ? (
              <>
                <div className={`text-lg font-bold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-blue-600' : 'text-orange-500'}`}>{pct}%</div>
                <div className="text-xs text-slate-400">match</div>
              </>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">No match</div>
            )}
          </div>
        </div>

        {isMatched && <ProgressBar value={pct} color={pct >= 75 ? 'green' : pct >= 50 ? 'gradient' : 'orange'} size="sm" />}

        <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
          <Badge color="purple" size="xs">{investor.investorType}</Badge>
          {investor.preferredIndustries?.slice(0, 2).map(ind => <Badge key={ind} color="blue" size="xs">{ind}</Badge>)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <DollarSign size={12} />
            ₹{(investor.minInvestment / 100000).toFixed(0)}L – {(investor.maxInvestment / 100000).toFixed(0)}L
          </div>
          <div className="flex items-center gap-1">
            <Building2 size={12} />
            {investor.investorType}
          </div>
          {investor.preferredStages?.length > 0 && (
            <div className="flex items-center gap-1 col-span-2">
              <TrendingUp size={12} />
              {investor.preferredStages.slice(0, 3).join(', ')}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button fullWidth size="sm" icon={Send} onClick={() => onApply(investor)}>Apply</Button>
          {investor.linkedin && (
            <a href={investor.linkedin} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors flex-shrink-0">
              <Linkedin size={15} />
            </a>
          )}
          {investor.website && (
            <a href={investor.website} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors flex-shrink-0">
              <Globe size={15} />
            </a>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default function InvestorRecommendations() {
  const { startup } = useSelector(s => s.startup);

  // Tab state: 'matched' | 'all'
  const [tab, setTab] = useState('matched');

  // Matched investors state
  const [matched, setMatched] = useState([]);
  const [matchStats, setMatchStats] = useState({ total: 0, matched: 0 });
  const [matchLoading, setMatchLoading] = useState(true);

  // All investors / browse state
  const [allInvestors, setAllInvestors] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allPagination, setAllPagination] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [investorType, setInvestorType] = useState('');
  const [page, setPage] = useState(1);

  // Apply modal
  const [applyModal, setApplyModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [form, setForm] = useState({ coverLetter: '', fundingRequested: '', equityOffered: '' });
  const [applying, setApplying] = useState(false);

  // Debounce search
  const searchTimer = useRef(null);
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  // Load matched investors (recommendations)
  useEffect(() => {
    if (!startup?._id) { setMatchLoading(false); return; }
    setMatchLoading(true);
    investorAPI.getRecommendations(startup._id)
      .then(r => {
        setMatched(r.data.data || []);
        setMatchStats({ total: r.data.total || 0, matched: r.data.matched || 0 });
      })
      .catch(() => toast.error('Failed to load investor recommendations'))
      .finally(() => setMatchLoading(false));
  }, [startup]);

  // Load all investors for browse tab
  useEffect(() => {
    if (tab !== 'all') return;
    setAllLoading(true);
    investorAPI.getAllForFounder({ search, investorType, page, limit: 9 })
      .then(r => {
        setAllInvestors(r.data.data || []);
        setAllPagination(r.data.pagination || {});
      })
      .catch(() => toast.error('Failed to load investors'))
      .finally(() => setAllLoading(false));
  }, [tab, search, investorType, page]);

  const handleApply = (investor) => { setSelectedInvestor(investor); setApplyModal(true); };

  const submitApplication = async () => {
    if (!form.coverLetter.trim()) return toast.error('Please write a cover letter');
    setApplying(true);
    try {
      await applicationAPI.create({
        startupId: startup._id,
        type: 'investor',
        investorId: selectedInvestor._id,
        ...form,
      });
      toast.success('Application submitted!');
      setApplyModal(false);
      setForm({ coverLetter: '', fundingRequested: '', equityOffered: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (!startup?._id) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="text-blue-500" size={24} /> Investor Recommendations
          </h1>
        </div>
        <EmptyState icon={Users} title="No Startup Profile" description="Create your startup profile to see matching investors" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users className="text-blue-500" size={24} /> Investor Recommendations
        </h1>
        <p className="text-slate-500 text-sm mt-1">AI-matched investors ranked by compatibility with your startup</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Investors', value: matchStats.total, icon: Users, color: 'text-blue-500' },
          { label: 'Matched for You', value: matchStats.matched, icon: Star, color: 'text-green-500' },
          { label: 'Top Match', value: matched.length > 0 ? `${matched[0]?.compatibilityScore}%` : '—', icon: TrendingUp, color: 'text-purple-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-3 py-3">
              <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { key: 'matched', label: `Matched (${matchStats.matched})` },
          { key: 'all', label: `All Investors (${matchStats.total})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── MATCHED TAB ── */}
      {tab === 'matched' && (
        <>
          {matchLoading ? (
            <LoadingSpinner text="Finding your best investor matches..." />
          ) : matched.length === 0 ? (
            <Card><CardBody className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No investor matches yet</h3>
              <p className="text-sm text-slate-400 mb-4">Complete your startup profile for better AI matches, or browse all investors below.</p>
              <Button variant="outline" onClick={() => setTab('all')}>Browse All Investors</Button>
            </CardBody></Card>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <Star className="text-blue-500 flex-shrink-0" size={20} />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Found <strong>{matchStats.matched} matching investors</strong> out of {matchStats.total} total investors based on your industry, stage, and funding requirements.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matched.filter(inv => inv.compatibilityScore > 0).map(inv => (
                  <InvestorCard key={inv._id} investor={inv} compatibilityScore={inv.compatibilityScore} onApply={handleApply} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── ALL INVESTORS TAB ── */}
      {tab === 'all' && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48">
              <Input
                placeholder="Search by name or firm..."
                value={searchInput}
                onChange={handleSearchChange}
                icon={Search}
              />
            </div>
            <Select
              value={investorType}
              onChange={e => { setInvestorType(e.target.value); setPage(1); }}
              options={INVESTOR_TYPES}
              className="w-44"
            />
          </div>

          {allLoading ? (
            <LoadingSpinner text="Loading investors..." />
          ) : allInvestors.length === 0 ? (
            <EmptyState icon={Search} title="No investors found" description="Try a different search or filter." />
          ) : (
            <>
              <p className="text-sm text-slate-500">{allPagination.total || 0} investors found</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allInvestors.map(inv => (
                  <InvestorCard key={inv._id} investor={inv} compatibilityScore={inv.compatibilityScore} onApply={handleApply} />
                ))}
              </div>
              {/* Pagination */}
              {allPagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: allPagination.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? 'gradient-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'}`}>
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(allPagination.pages, p + 1))}
                    disabled={page === allPagination.pages}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={applyModal}
        onClose={() => setApplyModal(false)}
        title={`Apply to ${selectedInvestor?.user?.name || selectedInvestor?.firmName || 'Investor'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setApplyModal(false)}>Cancel</Button>
            <Button onClick={submitApplication} loading={applying} icon={Send}>Submit Application</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedInvestor?.firmName || selectedInvestor?.investorType}
            </p>
            {selectedInvestor?.compatibilityScore > 0 && (
              <p className="text-xs text-slate-400">Compatibility: {selectedInvestor?.compatibilityScore}%</p>
            )}
          </div>
          <Input
            label="Cover Letter"
            name="coverLetter"
            rows={5}
            placeholder="Briefly explain why you're a great fit for this investor and what makes your startup unique..."
            value={form.coverLetter}
            onChange={e => setForm(p => ({ ...p, coverLetter: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Funding Requested (INR)"
              name="fundingRequested"
              type="number"
              placeholder={startup?.fundingRequired || ''}
              value={form.fundingRequested}
              onChange={e => setForm(p => ({ ...p, fundingRequested: e.target.value }))}
            />
            <Input
              label="Equity Offered (%)"
              name="equityOffered"
              type="number"
              placeholder="10"
              value={form.equityOffered}
              onChange={e => setForm(p => ({ ...p, equityOffered: e.target.value }))}
              suffix="%"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
