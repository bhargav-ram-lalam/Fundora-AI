import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Search, Eye, Brain } from 'lucide-react';
import { adminAPI } from '../../api/services';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/Progress';
import Input, { Select } from '../../components/common/Input';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => {
    adminAPI.getStartups({ search, industry: industry || undefined }).then(r => setStartups(r.data.data)).catch(() => toast.error('Failed to load startups')).finally(() => setLoading(false));
  }, [search, industry]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Rocket className="text-blue-500" size={24} /> All Startups</h1>
        <p className="text-slate-500 text-sm mt-1">{startups.length} startups registered on the platform</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input placeholder="Search startups..." value={search} onChange={e => setSearch(e.target.value)} icon={Search} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : startups.length === 0 ? (
        <EmptyState icon={Rocket} title="No startups found" />
      ) : (
        <div className="space-y-3">
          {startups.map(s => (
            <Card key={s._id}>
              <CardBody className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{s.name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{s.name}</h3>
                  <p className="text-xs text-slate-400">{s.city}, {s.country} • Founded {s.foundedYear}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <Badge color="blue" size="xs">{s.industry}</Badge>
                    <Badge color="purple" size="xs">{s.stage}</Badge>
                    {s.isRegistered && <Badge color="green" size="xs">Registered</Badge>}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{s.aiScore?.overall || 0}</p>
                  <p className="text-xs text-slate-400">AI Score</p>
                </div>
                <div className="w-28">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-400">Profile</span>
                    <span className="text-xs font-bold">{s.profileCompleteness || 0}%</span>
                  </div>
                  <ProgressBar value={s.profileCompleteness || 0} size="sm" color="gradient" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Eye size={12} />{s.views || 0}</span>
                  <span className="flex items-center gap-1"><Brain size={12} />{s.savedBy || 0}</span>
                </div>
                <Link to={`/investor/startup/${s._id}`} target="_blank">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"><Eye size={16} /></button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
