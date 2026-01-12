
import React, { useMemo, useState, useEffect } from 'react';
import { PropertyFile, Transaction } from '../types';
import { generateSmartSummary } from '../AIService';
import { 
  CreditCard, 
  Home, 
  Users, 
  RefreshCcw, 
  AlertOctagon, 
  Layers,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  Clock,
  ArrowRightCircle,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  TriangleAlert,
  Eye,
  FileText
} from 'lucide-react';

interface DashboardProps {
  onSelectFile: (file: PropertyFile) => void;
  onPreviewFile: (file: PropertyFile) => void;
  files: PropertyFile[];
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectFile, onPreviewFile, files, userName }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(true);
  const [alertIndex, setAlertIndex] = useState(0);

  const parseSAPDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-' || dateStr === '' || dateStr === 'NULL') return null;
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      let year = parseInt(parts[2]);
      if (year < 100) year += 2000;
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const month = months[monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase().substring(0, 3)];
      return month !== undefined ? new Date(year, month, day) : null;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (files.length === 0) {
        setAiSummary("No active property files found in your registry profile.");
        setIsAiLoading(false);
        return;
      }
      setIsAiLoading(true);
      const mockUser: any = { name: userName };
      const summary = await generateSmartSummary(mockUser, files);
      setAiSummary(summary || '');
      setIsAiLoading(false);
    };
    fetchSummary();
  }, [files, userName]);

  const allAlerts = useMemo(() => {
    const alerts: { trans: Transaction, plotName: string, itemCode: string, file: PropertyFile, isOverdue: boolean }[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    files.forEach(file => {
      const overdueTrans = file.transactions
        .filter(t => {
          const d = parseSAPDate(t.duedate);
          return d && d < today && (t.balduedeb || 0) > 0;
        })
        .sort((a, b) => (parseSAPDate(a.duedate)?.getTime() || 0) - (parseSAPDate(b.duedate)?.getTime() || 0))[0];
      if (overdueTrans) alerts.push({ trans: overdueTrans, plotName: file.plotSize, itemCode: file.fileNo, file, isOverdue: true });
      else {
        const nextCommitment = file.transactions.find(t => {
           const d = parseSAPDate(t.duedate);
           return d && d >= today && (!t.amount_paid || t.amount_paid === 0) && (t.receivable && t.receivable > 0);
        });
        if (nextCommitment) alerts.push({ trans: nextCommitment, plotName: file.plotSize, itemCode: file.fileNo, file, isOverdue: false });
      }
    });
    return alerts.sort((a, b) => (a.isOverdue === b.isOverdue ? 0 : a.isOverdue ? -1 : 1));
  }, [files]);

  const currentAlert = allAlerts[alertIndex];

  const getFileStatus = (file: PropertyFile) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const hasOverdue = file.transactions.some(t => {
      const d = parseSAPDate(t.duedate);
      return d && d < today && (t.balduedeb || 0) > 0;
    });
    if (hasOverdue) return { label: 'Action Required', color: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (file.balance > 0) return { label: 'Active Ledger', color: 'bg-blue-50 text-blue-600 border-blue-100' };
    return { label: 'Clearance Verified', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  };

  const stats = useMemo(() => [
    { label: 'Verified Assets', value: files.length.toString().padStart(2, '0'), icon: Home, color: 'bg-blue-600' },
    { label: 'Active Records', value: files.filter(f => f.balance > 0).length.toString().padStart(2, '0'), icon: CreditCard, color: 'bg-emerald-600' },
    { label: 'Alerts', value: allAlerts.filter(a => a.isOverdue).length.toString().padStart(2, '0'), icon: AlertOctagon, color: 'bg-rose-600' },
  ], [files, allAlerts]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter">Verified Portfolio</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm sm:text-base tracking-tight">Authenticated: {userName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 group">
            <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Asset Synchronization Unit
            </h3>
          </div>
          
          <div className="space-y-4">
            {files.map((file) => {
              const status = getFileStatus(file);
              const today = new Date(); today.setHours(0,0,0,0);
              const overdue = file.transactions.find(t => {
                 const d = parseSAPDate(t.duedate);
                 return d && d < today && (t.balduedeb || 0) > 0;
              });
              const next = overdue || file.transactions.find(t => (!t.amount_paid || t.amount_paid === 0) && (t.receivable && t.receivable > 0));
              const recoveryPercent = file.plotValue > 0 ? Math.round((file.paymentReceived / file.plotValue) * 100) : 0;

              return (
                <div key={file.fileNo} className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/60 shadow-xl shadow-slate-200/20 group hover:border-emerald-200 transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{file.plotSize}</div>
                      <div className="text-[10px] text-emerald-600 font-black uppercase mt-2 tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} /> Registry ID: {file.fileNo}
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                      {status.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Net O/S Ledger</p>
                      <p className={`text-sm font-black ${overdue ? 'text-rose-600' : 'text-slate-900'}`}>{next ? formatCurrency(overdue ? (overdue.balduedeb || 0) : (next.receivable || 0)) : 'Registry Clear'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Secured Ratio</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-black text-slate-900">{recoveryPercent}%</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${recoveryPercent}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reg Date</p>
                      <p className="text-sm font-black text-slate-900">{file.regDate}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-50 pt-6">
                    <button 
                      onClick={() => onSelectFile(file)}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
                    >
                      <FileText size={18} /> Manage Ledger
                    </button>
                    <button 
                      onClick={() => onPreviewFile(file)}
                      className="flex-1 bg-white border border-slate-200 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                    >
                      <Eye size={18} /> Preview Statement
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10 flex items-center gap-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-600/30">
                {isAiLoading ? <Loader2 size={32} className="animate-spin" /> : <Sparkles size={32} />}
              </div>
              <div className="flex-1">
                <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">AI Registry Intelligence</h3>
                <div className="text-white text-sm font-medium leading-relaxed">
                  {isAiLoading ? <span className="text-slate-500 italic">Scanning secure ledger nodes...</span> : <p className="animate-in fade-in">{aiSummary}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className={`rounded-[3.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col min-h-[450px] border transition-all duration-500 ${currentAlert?.isOverdue ? 'bg-[#1a0a0d] border-rose-500/20' : 'bg-[#0b1424] border-white/5'}`}>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl ${currentAlert?.isOverdue ? 'bg-rose-600' : 'bg-emerald-500'}`}>
                  {currentAlert?.isOverdue ? <TriangleAlert size={24} /> : <TrendingUp size={24} />}
                </div>
                {allAlerts.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAlertIndex(prev => (prev > 0 ? prev - 1 : allAlerts.length - 1))} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronLeft size={16} /></button>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{alertIndex + 1} / {allAlerts.length}</span>
                    <button onClick={() => setAlertIndex(prev => (prev < allAlerts.length - 1 ? prev + 1 : 0))} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><ChevronRight size={16} /></button>
                  </div>
                )}
              </div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-8 ${currentAlert?.isOverdue ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>{currentAlert?.isOverdue ? 'CRITICAL OVERDUE' : 'UPCOMING ALERT'}</h4>
              {currentAlert ? (
                <div className="flex-1 flex flex-col">
                  <div className="mb-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Asset Reference</p>
                    <p className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">{currentAlert.plotName}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${currentAlert.isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>ITEM ID: {currentAlert.itemCode}</p>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-sm">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Commitment Amount</p>
                      <p className={`text-3xl font-black ${currentAlert.isOverdue ? 'text-rose-500' : 'text-white'}`}>{formatCurrency(currentAlert.isOverdue ? (currentAlert.trans.balduedeb || 0) : (currentAlert.trans.receivable || 0))}</p>
                    </div>
                  </div>
                  <button onClick={() => onSelectFile(currentAlert.file)} className={`w-full font-black py-5 rounded-[2.5rem] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] mt-10 ${currentAlert.isOverdue ? 'bg-rose-600 hover:bg-rose-50' : 'bg-emerald-600 hover:bg-emerald-500'}`}>Process Dues <ChevronRight size={16} /></button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30"><ShieldCheck size={64} className="text-emerald-500 mb-6" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Registry Status: Clear</p></div>
              )}
            </div>
          </div>
          <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-200">
             <div className="flex items-center gap-3 mb-4"><AlertCircle size={18} className="text-amber-600" /><h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Security Advisory</h5></div>
             <p className="text-[11px] text-amber-900 font-medium leading-relaxed uppercase">Official dues are payable by 10th. Registry updates sync every 12 hours from SAP Business One nodes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
