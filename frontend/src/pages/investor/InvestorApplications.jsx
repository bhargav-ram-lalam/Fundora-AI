import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, XCircle, Calendar, Handshake, Mail, MessageSquare } from 'lucide-react';
import { applicationAPI, offerAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { StatusBadge, Badge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUSES = ['submitted', 'under_review', 'shortlisted', 'interview', 'approved', 'rejected'];

export default function InvestorApplications() {
  const [tab, setTab] = useState('applications'); // 'applications' | 'offers'

  // Applications received state
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: '', reviewerNotes: '', rejectionReason: '', interviewDate: '' });
  const [updating, setUpdating] = useState(false);

  // Sent offers state
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const loadApps = () => {
    setLoading(true);
    applicationAPI.getInvestor({ status: statusFilter || undefined })
      .then(r => setApps(r.data.data || []))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  const loadOffers = () => {
    setOffersLoading(true);
    offerAPI.getInvestorOffers()
      .then(r => setOffers(r.data.data || []))
      .catch(() => {})
      .finally(() => setOffersLoading(false));
  };

  useEffect(() => {
    loadApps();
    loadOffers();
  }, [statusFilter]);

  const openModal = (app) => {
    setSelected(app);
    setForm({ status: app.status, reviewerNotes: app.reviewerNotes || '', rejectionReason: '', interviewDate: '' });
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await applicationAPI.updateStatus(selected._id, form);
      toast.success('Status updated!');
      setModalOpen(false);
      loadApps();
    } catch { toast.error('Failed to update'); } finally { setUpdating(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="text-blue-500" size={24} /> Applications & Offers
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review startup applications and track investment offers you sent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setTab('applications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'applications'
              ? 'gradient-primary text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <ClipboardList size={18} />
          Founder Applications ({apps.length})
        </button>

        <button
          onClick={() => setTab('offers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'offers'
              ? 'gradient-primary text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Handshake size={18} />
          Offers Sent by You ({offers.length})
        </button>
      </div>

      {/* ── TAB 1: APPLICATIONS RECEIVED ── */}
      {tab === 'applications' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[{ value: '', label: 'All Status' }, ...STATUSES.map(s => ({ value: s, label: s.replace('_', ' ').toUpperCase() }))]}
              className="w-44"
            />
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : apps.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No applications" description="No startup applications match your criteria." />
          ) : (
            <div className="space-y-4">
              {apps.map(app => (
                <Card key={app._id}>
                  <CardBody>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
                          {app.startup?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-100">{app.startup?.name || 'Startup'}</h3>
                          <p className="text-xs text-slate-400">{app.startup?.industry} • {app.startup?.stage}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={app.status} />
                        <Button size="sm" variant="outline" onClick={() => openModal(app)}>Review</Button>
                      </div>
                    </div>
                    {app.coverLetter && (
                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Cover Letter</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{app.coverLetter}</p>
                      </div>
                    )}
                    {(app.fundingRequested || app.equityOffered) && (
                      <div className="flex gap-4 mt-3 text-xs text-slate-500">
                        {app.fundingRequested && <span>💰 Requesting: ₹{(app.fundingRequested / 100000).toFixed(0)}L</span>}
                        {app.equityOffered && <span>📊 Offering: {app.equityOffered}% equity</span>}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: OFFERS SENT TO FOUNDERS ── */}
      {tab === 'offers' && (
        <div className="space-y-4">
          {offersLoading ? (
            <LoadingSpinner text="Loading your investment offers..." />
          ) : offers.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="No Investment Offers Sent Yet"
              description="Browse startups in Discovery and click 'Make Investment Offer' to fund promising startup ideas."
            />
          ) : (
            <div className="space-y-4">
              {offers.map(offer => {
                const amountLakhs = (offer.amount / 100000).toFixed(1);
                const impliedValuationLakhs = offer.valuation ? (offer.valuation / 100000).toFixed(0) : 0;

                return (
                  <Card key={offer._id}>
                    <CardBody>
                      <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center text-white font-bold text-lg">
                            {offer.startup?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">
                              {offer.startup?.name || 'Startup'}
                            </h3>
                            <p className="text-xs text-slate-400">
                              Founder: <strong>{offer.founder?.name || 'Founder'}</strong> ({offer.founder?.email})
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Sent on {new Date(offer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge color={offer.status === 'accepted' ? 'green' : offer.status === 'declined' ? 'red' : offer.status === 'negotiating' ? 'purple' : 'yellow'} size="sm">
                          {offer.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-3 text-xs">
                        <div>
                          <span className="text-slate-400">Offered Amount:</span>
                          <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">₹{amountLakhs} Lakhs</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Equity Requested:</span>
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{offer.equity}%</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Implied Valuation:</span>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{impliedValuationLakhs} Lakhs</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                        <strong>Your Note:</strong> {offer.message}
                      </div>

                      {offer.responseMessage && (
                        <div className={`mt-3 p-3 rounded-xl text-xs ${offer.status === 'accepted' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : offer.status === 'declined' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
                          <strong>Founder Response ({offer.status.toUpperCase()}):</strong> {offer.responseMessage}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Application Status"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleUpdate} loading={updating}>Update Status</Button></>}>
        {selected && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-sm font-semibold">{selected.startup?.name}</p>
              <p className="text-xs text-slate-400">{selected.startup?.industry} • Current: <StatusBadge status={selected.status} /></p>
            </div>
            <Select label="New Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              options={STATUSES.map(s => ({ value: s, label: s.replace('_', ' ').toUpperCase() }))} />
            <Input label="Reviewer Notes" name="notes" rows={3} placeholder="Add feedback or notes for the founder..."
              value={form.reviewerNotes} onChange={e => setForm(p => ({ ...p, reviewerNotes: e.target.value }))} />
            {form.status === 'rejected' && (
              <Input label="Rejection Reason" name="reason" rows={2} placeholder="Brief reason for rejection..."
                value={form.rejectionReason} onChange={e => setForm(p => ({ ...p, rejectionReason: e.target.value }))} />
            )}
            {form.status === 'interview' && (
              <Input label="Interview Date & Time" name="interviewDate" type="datetime-local"
                value={form.interviewDate} onChange={e => setForm(p => ({ ...p, interviewDate: e.target.value }))} icon={Calendar} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
