import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Zap, TrendingUp, Users, AlertCircle, Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationAPI } from '../../api/services';
import { setNotifications, markAsRead, markAllAsRead } from '../../features/notifications/notificationSlice';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import LoadingSpinner, { EmptyState } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

import { Handshake } from 'lucide-react';

const TYPE_ICONS = {
  new_investor_match: { icon: Users, color: 'bg-blue-100 text-blue-600' },
  proposal_review_complete: { icon: CheckCheck, color: 'bg-green-100 text-green-600' },
  new_scheme: { icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
  application_status_change: { icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ai_analysis_complete: { icon: Zap, color: 'bg-indigo-100 text-indigo-600' },
  funding_readiness_complete: { icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
  investment_offer: { icon: Handshake, color: 'bg-emerald-100 text-emerald-600' },
  offer_response: { icon: Handshake, color: 'bg-purple-100 text-purple-600' },
  system: { icon: Info, color: 'bg-slate-100 text-slate-600' },
  default: { icon: Bell, color: 'bg-gray-100 text-gray-600' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(s => s.notifications);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationAPI.getAll({ limit: 50 }).then(r => {
      dispatch(setNotifications({ notifications: r.data.data, unreadCount: r.data.unreadCount }));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await notificationAPI.markRead(id);
    dispatch(markAsRead(id));
  };

  const handleMarkAll = async () => {
    await notificationAPI.markAllRead();
    dispatch(markAllAsRead());
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id) => {
    await notificationAPI.delete(id);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bell className="text-blue-500" size={24} /> Notifications
            {unreadCount > 0 && <Badge color="red">{unreadCount} new</Badge>}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated with your startup activities</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAll}>Mark All Read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates about investor matches, AI analyses, and application status changes here." />
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const config = TYPE_ICONS[notif.type] || TYPE_ICONS.default;
            const IconComp = config.icon;
            return (
              <div
                key={notif._id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  !notif.isRead
                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-700/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <IconComp size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold ${!notif.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                        {!notif.isRead && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notif.isRead && (
                    <button onClick={() => handleMarkRead(notif._id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="Mark as read">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
