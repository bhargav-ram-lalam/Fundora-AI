import React, { useState, useEffect } from 'react';
import {
  GitBranch, Clock, CheckCircle, XCircle, Calendar, ChevronRight,
  Handshake, DollarSign, TrendingUp, Mail, Send, MessageSquare, AlertCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { applicationAPI, offerAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { StatusBadge, Badge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUSES = ['submitted', 'under_review', 'shortlisted', 'interview', 'approved', 'rejected'];
const STATUS_ICONS = { submitted: '📤', under_review: '🔍', shortlisted: '⭐', interview: '📞', approved: '✅', rejected: '❌' };

function TimelineBar({ status }) {
  const idx = STATUSES.indexOf(status);
  const isRejected = status === 'rejected';
  return (
    <div className="flex items-center gap-0 mb-6">
      {STATUSES.filter(s => s !== 'rejected').map((s, i) => {
        const isActive = !isRejected && i <= idx;
        const isCurrent = !isRejected && s === status;
        return (
          <React.Fragment key={s}>
            <div className={`flex flex-col items-center ${i > 0 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isActive ? 'gradient-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {isCurrent ? '●' : i + 1}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>{s.replace('_', ' ')}</span>
            </div>
            {i < 4 && <div className={`h-0.5 flex-1 -mt-5 ${i < idx && !isRejected ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </React.Fragment>
        );
      })}
      {isRejected && <div className="ml-auto"><span className="text-sm text-red-500 font-semibold">❌ Rejected</span></div>}
    </div>
  );
}

export default function ApplicationTracker() {
  const { startup } = useSelector(s => s.startup);
  const [tab, setTab] = useState('offers'); // 'offers' | 'applications'

  // Investment Offers state
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [responseAction, setResponseAction] = useState('accepted'); // 'accepted' | 'declined' | 'negotiating'
  const [responseMessage, setResponseMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Applications state
  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appFilter, setAppFilter] = useState('all');

  const loadOffers = () => {
    setOffersLoading(true);
    offerAPI.getFounderOffers()
      .then(r => setOffers(r.data.data || []))
      .catch(() => {})
      .finally(() => setOffersLoading(false));
  };

  const loadApps = () => {
    setAppsLoading(true);
    applicationAPI.getMy()
      .then(r => setApps(r.data.data || []))
      .catch(() => {})
      .finally(() => setAppsLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadOffers();
    loadApps();
  }, []);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      loadOffers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const pendingOffersCount = offers.filter(o => o.status === 'pending').length;
  const filteredApps = appFilter === 'all' ? apps : apps.filter(a => a.status === appFilter);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <GitBranch className="text-orange-500" size={24} /> Tracker & Offers
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage investment offers received from investors and track your applications</p>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => handleTabChange('offers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'offers'
              ? 'gradient-primary text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Handshake size={18} />
          Investment Offers Received
          {pendingOffersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-amber-400 text-slate-900 rounded-full font-bold">
              {pendingOffersCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('applications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'applications'
              ? 'gradient-primary text-white shadow-lg'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <GitBranch size={18} />
          Applications Sent ({apps.length})
        </button>
      </div>

      {/* ── TAB 1: INVESTMENT OFFERS RECEIVED ── */}
      {tab === 'offers' && (
        <div className="space-y-4">
          {offersLoading ? (
            <LoadingSpinner text="Loading investment offers..." />
          ) : offers.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="No Investment Offers Yet"
              description="When investors are impressed with your startup profile and want to fund your idea, their offers will appear here."
            />
          ) : (
            <div className="space-y-4">
              {offers.map(offer => {
                const amountLakhs = (offer.amount / 100000).toFixed(1);
                const impliedValuationLakhs = offer.valuation ? (offer.valuation / 100000).toFixed(0) : 0;
                const isPending = offer.status === 'pending';

                return (
                  <Card key={offer._id} className="border-2 border-slate-200/80 dark:border-slate-800 hover:border-blue-400 transition-all">
                    <CardBody>
                      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                            {offer.investorUser?.name?.charAt(0) || 'I'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                                {offer.investorUser?.name || 'Investor'}
                              </h3>
                              {offer.investorProfile?.firmName && (
                                <Badge color="purple" size="xs">{offer.investorProfile.firmName}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {offer.investorProfile?.investorType || 'Investor'} • Offer for: <strong>{offer.startup?.name}</strong>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Received: {new Date(offer.createdAt).toLocaleDateString()} at {new Date(offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <Badge color={offer.status === 'accepted' ? 'green' : offer.status === 'declined' ? 'red' : offer.status === 'negotiating' ? 'purple' : 'yellow'} size="sm">
                          {offer.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Offer Financial Details Pill Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl mb-4 border border-blue-100 dark:border-slate-700">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Offered Investment</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{amountLakhs} Lakhs</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Equity Requested</p>
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{offer.equity}%</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Implied Valuation</p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{impliedValuationLakhs} Lakhs</p>
                        </div>
                      </div>

                      {/* Message from investor */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                          <MessageSquare size={13} /> Message from Investor:
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {offer.message}
                        </p>
                        {offer.terms && (
                          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700">
                            <p className="text-xs font-semibold text-slate-500 mb-1">Proposed Terms:</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{offer.terms}</p>
                          </div>
                        )}
                      </div>

                      {/* Founder Response if already responded */}
                      {offer.responseMessage && (
                        <div className={`p-4 rounded-xl mb-4 border ${offer.status === 'accepted' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : offer.status === 'declined' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-purple-50 border-purple-200 text-purple-800'}`}>
                          <p className="text-xs font-bold mb-1">Your Response ({offer.status.toUpperCase()}):</p>
                          <p className="text-sm whitespace-pre-line">{offer.responseMessage}</p>
                          {offer.respondedAt && (
                            <p className="text-[10px] opacity-75 mt-1">Responded on {new Date(offer.respondedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons for Pending Offer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={14} />
                          Investor Contact: <strong className="text-slate-700 dark:text-slate-300">{offer.investorUser?.email}</strong>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {offer.investorUser?.email && (
                            <a
                              href={`mailto:${offer.investorUser.email}?subject=Regarding Investment Offer for ${offer.startup?.name}`}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                            >
                              <Mail size={14} /> Contact via Email
                            </a>
                          )}

                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openRespondModal(offer, 'declined')}
                                className="text-red-600 hover:bg-red-50 border-red-200"
                              >
                                Decline
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRespondModal(offer, 'negotiating')}
                              >
                                Negotiate
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => openRespondModal(offer, 'accepted')}
                                className="gradient-emerald text-white shadow-md shadow-emerald-500/20"
                                icon={CheckCircle}
                              >
                                Accept Offer!
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: APPLICATIONS SENT BY FOUNDER ── */}
      {tab === 'applications' && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {STATUSES.map(s => {
              const count = apps.filter(a => a.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setAppFilter(appFilter === s ? 'all' : s)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${appFilter === s ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-xl">{STATUS_ICONS[s]}</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{count}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{s.replace('_', ' ')}</div>
                </button>
              );
            })}
          </div>

          {appsLoading ? (
            <LoadingSpinner />
          ) : filteredApps.length === 0 ? (
            <EmptyState icon={GitBranch} title="No applications yet" description="Apply to investors or government schemes to track your progress here." />
          ) : (
            <div className="space-y-4">
              {filteredApps.map(app => (
                <Card key={app._id}>
                  <CardBody>
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{app.type === 'investor' ? '🏦' : '🏛️'}</span>
                          <h3 className="font-bold text-slate-800 dark:text-slate-100">
                            {app.type === 'investor'
                              ? (app.investor?.firmName || 'Investor Application')
                              : (app.scheme?.name || 'Scheme Application')}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <TimelineBar status={app.status} />
                    {app.reviewerNotes && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mb-3">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Reviewer Notes</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">{app.reviewerNotes}</p>
                      </div>
                    )}
                    {app.rejectionReason && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-600">{app.rejectionReason}</p>
                      </div>
                    )}
                    {app.interviewDate && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 mt-3">
                        <Calendar className="text-orange-500" size={16} />
                        <p className="text-sm text-orange-700 dark:text-orange-300">Interview scheduled: <strong>{new Date(app.interviewDate).toLocaleString()}</strong></p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Respond Modal */}
      <Modal
        isOpen={respondModalOpen}
        onClose={() => setRespondModalOpen(false)}
        title={`${responseAction === 'accepted' ? 'Accept' : responseAction === 'negotiating' ? 'Negotiate' : 'Decline'} Investment Offer`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRespondModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendResponse}
              loading={submittingResponse}
              icon={Send}
              className={responseAction === 'accepted' ? 'gradient-emerald text-white' : responseAction === 'declined' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}
            >
              Send Response to Investor
            </Button>
          </>
        }
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Offer: ₹{(selectedOffer.amount / 100000).toFixed(1)}L for {selectedOffer.equity}% equity
              </p>
              <p className="text-xs text-slate-400">From: {selectedOffer.investorUser?.name}</p>
            </div>

            <Input
              label="Response Message to Investor"
              name="responseMessage"
              rows={4}
              placeholder="Type your message to the investor..."
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
