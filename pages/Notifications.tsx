
import React from 'react';
import { PortalNotification } from '../types';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  ArrowRight, 
  Trash2,
  Calendar,
  CreditCard
} from 'lucide-react';

interface NotificationsProps {
  notifications: PortalNotification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  onClearAll 
}) => {
  const getIcon = (type: PortalNotification['type']) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle className="text-rose-600" size={24} />;
      case 'WARNING': return <Clock className="text-amber-600" size={24} />;
      case 'SUCCESS': return <CheckCircle className="text-emerald-600" size={24} />;
      default: return <Info className="text-blue-600" size={24} />;
    }
  };

  const getBg = (type: PortalNotification['type']) => {
    switch (type) {
      case 'CRITICAL': return 'bg-rose-50 border-rose-100';
      case 'WARNING': return 'bg-amber-50 border-amber-100';
      case 'SUCCESS': return 'bg-emerald-50 border-emerald-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter">Alert Center</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm sm:text-base tracking-tight">Real-time payment and security monitoring</p>
        </div>
        <button 
          onClick={onClearAll}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
        >
          <Trash2 size={16} /> Purge Registry
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell size={32} className="text-slate-200" />
            </div>
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Registry Synchronized: No Alerts</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-6 sm:p-8 rounded-[2.5rem] border shadow-sm transition-all group ${getBg(notif.type)} ${!notif.isRead ? 'ring-2 ring-slate-900/5 shadow-md' : 'opacity-80'}`}
              onClick={() => onMarkAsRead(notif.id)}
            >
              <div className="flex items-start gap-6">
                <div className="shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                      {notif.category} TRANSMISSION • {new Date(notif.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase leading-tight mb-2 group-hover:text-indigo-900 transition-colors">
                    {notif.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
                    {notif.message}
                  </p>
                  
                  {notif.metadata && (
                    <div className="flex flex-wrap gap-4 mb-6">
                      {notif.metadata.amount && (
                        <div className="bg-white/50 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black text-slate-900 border border-white/80">
                          <CreditCard size={14} /> {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(notif.metadata.amount)}
                        </div>
                      )}
                      {notif.metadata.dueDate && (
                        <div className="bg-white/50 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black text-slate-900 border border-white/80">
                          <Calendar size={14} /> DUE: {notif.metadata.dueDate}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-black/5">
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 hover:gap-3 transition-all">
                      Acknowledge & View <ArrowRight size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
