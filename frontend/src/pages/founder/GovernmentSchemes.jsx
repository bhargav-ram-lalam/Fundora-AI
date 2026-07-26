import React, { useState, useEffect } from 'react';
import { Building2, Search, ExternalLink, CheckCircle, Clock, Tag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { schemeAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

function SchemeCard({ scheme, compatibilityScore, reasons }) {
  const categoryColors = { 'Central Government': 'blue', 'AI Grant': 'purple', 'MSME': 'green', 'Women Entrepreneur': 'pink', 'State Government': 'orange', 'University': 'indigo', 'Other': 'gray' };
  return (
    <Card hover>
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge color={categoryColors[scheme.category] || 'blue'} size="xs">{scheme.category}</Badge>
              {compatibilityScore >= 75 && <Badge color="green" size="xs">High Match</Badge>}
              {scheme.isOngoing && <Badge color="gray" size="xs">Ongoing</Badge>}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{scheme.name}</h3>
            {scheme.shortName && <p className="text-xs text-slate-400 mt-0.5">{scheme.shortName}</p>}
          </div>
          {compatibilityScore !== undefined && (
            <div className="text-right ml-3">
              <div className="text-lg font-bold text-emerald-600">{compatibilityScore}%</div>
              <div className="text-xs text-slate-400">eligible</div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{scheme.description}</p>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-3">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">💰 Benefits</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-300">{scheme.benefits}</p>
          {scheme.fundingAmount && <p className="text-xs font-bold text-emerald-700 mt-1">Amount: {scheme.fundingAmount}</p>}
        </div>
        {reasons && reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {reasons.slice(0, 2).map((r, i) => <Badge key={i} color="green" size="xs" dot>{r}</Badge>)}
          </div>
        )}
        {scheme.deadline && (
          <div className="flex items-center gap-1 text-xs text-orange-600 mb-3"><Clock size={12} />Deadline: {new Date(scheme.deadline).toLocaleDateString()}</div>
        )}
        <div className="flex gap-2">
          {scheme.officialLink && (
            <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" fullWidth icon={ExternalLink}>Official Site</Button>
            </a>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default function GovernmentSchemes() {
  const { startup } = useSelector(s => s.startup);
  const [schemes, setSchemes] = useState([]);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('matched');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const promises = [schemeAPI.getAll()];
    if (startup?._id) promises.push(schemeAPI.match(startup._id));
    Promise.all(promises).then(([all, matchRes]) => {
      setSchemes(all.data.data);
      if (matchRes) setMatched(matchRes.data.data);
    }).catch(() => toast.error('Failed to load schemes')).finally(() => setLoading(false));
  }, [startup]);

  const filtered = (view === 'matched' ? matched : schemes.map(s => ({ scheme: s }))).filter(item => {
    const name = item.scheme?.name || item.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Building2 className="text-green-500" size={24} /> Government Schemes</h1>
        <p className="text-slate-500 text-sm mt-1">AI-matched government grants and schemes for your startup</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setView('matched')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'matched' ? 'gradient-primary text-white' : 'text-slate-500'}`}>
            Matched ({matched.length})
          </button>
          <button onClick={() => setView('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'all' ? 'gradient-primary text-white' : 'text-slate-500'}`}>
            All Schemes ({schemes.length})
          </button>
        </div>
        <div className="flex-1 min-w-48">
          <Input placeholder="Search schemes..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardBody className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No schemes found. Complete your profile for better matches.</p>
        </CardBody></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <SchemeCard key={item.scheme?._id || item._id} scheme={item.scheme || item}
              compatibilityScore={item.compatibilityScore} reasons={item.reasons} />
          ))}
        </div>
      )}
    </div>
  );
}
