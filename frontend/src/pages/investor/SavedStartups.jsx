import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkX, ArrowRight } from 'lucide-react';
import { investorAPI } from '../../api/services';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/Progress';
import Button from '../../components/common/Button';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function SavedStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => investorAPI.getSaved().then(r => setStartups(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleUnsave = async (id) => {
    await investorAPI.save(id);
    setStartups(p => p.filter(s => s._id !== id));
    toast.success('Removed from saved');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Bookmark className="text-blue-500" size={24} /> Saved Startups</h1>
        <p className="text-slate-500 text-sm mt-1">{startups.length} startups in your watchlist</p>
      </div>

      {startups.filter(s => s && s._id).length === 0 ? (
        <EmptyState icon={Bookmark} title="No saved startups" description="Discover startups and bookmark them to review later." action={<Link to="/investor/discover"><Button>Discover Startups</Button></Link>} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {startups.filter(s => s && s._id).map(s => (
            <Card key={s._id} hover>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">{s.name?.charAt(0) || 'S'}</div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{s.name}</h3>
                      <p className="text-xs text-slate-400">{s.stage}</p>
                    </div>
                  </div>
                  <button onClick={() => handleUnsave(s._id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"><BookmarkX size={16} /></button>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <Badge color="blue" size="xs">{s.industry}</Badge>
                  {s.isRegistered && <Badge color="green" size="xs">Registered</Badge>}
                </div>
                {s.aiScore?.overall > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-1"><span className="text-xs text-slate-400">AI Score</span><span className="text-xs font-bold">{s.aiScore.overall}/100</span></div>
                    <ProgressBar value={s.aiScore.overall} color="gradient" size="sm" />
                  </div>
                )}
                <Link to={`/investor/startup/${s._id}`}>
                  <Button variant="outline" size="sm" fullWidth icon={ArrowRight}>View Details</Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
