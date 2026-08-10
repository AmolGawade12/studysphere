import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Bell, Check, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';
import notificationService from '../services/notificationService';
import { MockNotification } from '../services/mockDb';

interface NotificationsProps {
  onRefreshUnreadCount?: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onRefreshUnreadCount }) => {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      showToast('Failed to load notifications alert history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      showToast('Notification marked as read.', 'success');
      if (onRefreshUnreadCount) onRefreshUnreadCount();
    } catch (err) {
      showToast('Failed to update notification state.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) return;

    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read.', 'success');
      if (onRefreshUnreadCount) onRefreshUnreadCount();
    } catch (err) {
      showToast('Failed to mark all notifications as read.', 'error');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading alerts feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12 max-w-2xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Check logs, alerts, due dates, and study achievements
          </p>
        </div>
        
        {notifications.filter(n => !n.read).length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all focus:outline-none cursor-pointer self-start sm:self-center"
          >
            <Check className="w-4 h-4 text-indigo-500" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3.5">
        {notifications.length > 0 ? (
          notifications.map(item => (
            <div 
              key={item.id}
              className={`p-4.5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                item.read 
                  ? 'border-slate-150 dark:border-slate-800/40 bg-slate-50/10 dark:bg-slate-900/10' 
                  : 'border-indigo-150 bg-indigo-50/5 dark:bg-indigo-950/5 dark:border-indigo-900/20 shadow-sm'
              }`}
            >
              {/* Message Details */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className={`p-2.5 rounded-xl mt-0.5 flex-shrink-0 ${
                  item.read
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500'
                }`}>
                  <Bell className="w-4.5 h-4.5" />
                </div>

                <div className="text-left min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-100 truncate ${item.read ? 'text-slate-500 dark:text-slate-450' : ''}`}>
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 block pt-1">
                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action */}
              {!item.read && (
                <button
                  onClick={() => handleMarkRead(item.id)}
                  className="flex-shrink-0 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline py-1 px-2.5 rounded focus:outline-none"
                  title="Mark as read"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        ) : (
          /* Empty alerts center */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-16 rounded-3xl text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Inbox is clean</h4>
              <p className="text-slate-450 text-xs leading-relaxed max-w-xs mx-auto">
                No active notifications or alerts. We will keep you updated on task dues and focus log completions!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Notifications;
