import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Brain, TrendingUp, Users, DollarSign, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { startupAPI, investorAPI } from '../../api/services';
import { Card, CardBody } from '../../components/common/Card';
import Input, { Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ScoreRing, ProgressBar } from '../../components/common/Progress';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const INDUSTRIES = ['', 'AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech', 'E-Commerce', 'SaaS', 'IoT', 'Blockchain', 'Other'];
const STAGES = ['', 'Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth'];

function StartupCard({ startup, onSave, savedIds }) {
  const isSaved = savedIds.includes(startup._id);
  const score = startup.aiScore?.overall || 0;

  return (
    <Card hover className="flex flex-col">
      <CardBody className="flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {startup.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{startup.name}</h3>
              <p className="text-xs text-slate-400 truncate">{startup.tagline || startup.industry}</p>
            </div>
          </div>
          <button onClick={() => onSave(startup._id)} className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 hover:text-blue-500'}`}>
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge color="blue" size="xs">{startup.industry}</Badge>
          <Badge color="purple" size="xs">{startup.stage}</Badge>
          {startup.isRegistered && <Badge color="green" size="xs">Registered</Badge>}
        </div>

        {startup.problemStatement && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">{startup.problemStatement}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1"><DollarSign size={11} />₹{((startup.fundingRequired || 0) / 100000).toFixed(0)}L</div>
          <div className="flex items-center gap-1"><Users size={11} />{startup.teamSize || 1} members</div>
          <div className="flex items-center gap-1"><Eye size={11} />{startup.views || 0} views</div>
          <div className="flex items-center gap-1"><Brain size={11} />AI: {score > 0 ? `${score}/100` : 'Not analyzed'}</div>
        </div>

        {score > 0 && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400">AI Score</span>
              <span className="text-xs font-bold text-blue-600">{score}/100</span>
            </div>
            <ProgressBar value={score} color={score >= 75 ? 'green' : score >= 50 ? 'gradient' : 'orange'} size="sm" />
          </div>
        )}

        <Link to={`/investor/startup/${startup._id}`}>
          <Button variant="outline" size="sm" fullWidth>View Details</Button>
        </Link>
      </CardBody>
    </Card>
  );
}

export default function StartupDiscovery() {
  const [startups, setStartups] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '', industry: '', stage: '', page: 1 });
  const [pagination, setPagination] = useState({});

  // Debounce search input — only update filters (and trigger API) after 500ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(p => ({ ...p, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 12, ...filters };
      const res = await startupAPI.getAll(params);
      setStartups(res.data.data);
      setPagination(res.data.pagination);
      
      try {
        const savedRes = await investorAPI.getSaved();
        setSavedIds((savedRes.data.data || []).filter(s => s && s._id).map(s => s._id));
      } catch {
        setSavedIds([]);
      }
    } catch (err) {
      toast.error('Failed to load startups');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const handleSave = async (id) => {
    try {
      await investorAPI.save(id);
      setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
      toast.success(savedIds.includes(id) ? 'Removed from saved' : 'Startup saved!');
    } catch { toast.error('Failed to save'); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Search className="text-blue-500" size={24} /> Discover Startups</h1>
        <p className="text-slate-500 text-sm mt-1">Browse AI-evaluated startups ready for investment</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <Input placeholder="Search startups..." value={searchInput} onChange={e => setSearchInput(e.target.value)} icon={Search} />
        </div>
        <Select value={filters.industry} onChange={e => setFilters(p => ({ ...p, industry: e.target.value, page: 1 }))}
          options={INDUSTRIES.map(i => ({ value: i, label: i || 'All Industries' }))} className="w-44" />
        <Select value={filters.stage} onChange={e => setFilters(p => ({ ...p, stage: e.target.value, page: 1 }))}
          options={STAGES.map(s => ({ value: s, label: s || 'All Stages' }))} className="w-36" />
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">{pagination.total || 0} startups found</p>

      {loading ? <LoadingSpinner text="Discovering startups..." /> : startups.length === 0 ? (
        <EmptyState icon={Search} title="No startups found" description="Try different filters or check back later." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {startups.filter(s => s && s._id).map(s => <StartupCard key={s._id} startup={s} onSave={handleSave} savedIds={savedIds} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setFilters(prev => ({ ...prev, page: p }))}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${filters.page === p ? 'gradient-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
