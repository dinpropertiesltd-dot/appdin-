
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, PropertyFile, Notice, Message, Transaction, PortalNotification } from './types';
import { MOCK_USERS, MOCK_FILES, MOCK_NOTICES, MOCK_MESSAGES } from './data';
import { supabase, isCloudEnabled } from './supabase';
import { 
  LayoutDashboard, 
  Bell, 
  Mail, 
  FileCheck, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  RefreshCw,
  Home,
  PieChart,
  ArrowUpRight,
  TrendingUp,
  FileText,
  User as UserIcon,
  Settings,
  Eye,
  ChevronRight,
  Maximize2
} from 'lucide-react';

// Components
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import AccountStatement from './pages/AccountStatement';
import PublicNotices from './pages/PublicNotices';
import NewsAlerts from './pages/NewsAlerts';
import Inbox from './pages/Inbox';
import SOPs from './pages/SOPs';
import AdminPortal from './pages/AdminPortal';
import PropertyPortal from './pages/PropertyPortal';
import AIChatAssistant from './pages/AIChatAssistant';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [allFiles, setAllFiles] = useState<PropertyFile[]>(MOCK_FILES);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PropertyFile | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [initialChatPartnerId, setInitialChatPartnerId] = useState<string | null>(null);

  useEffect(() => {
    // Mobile App Splash Screen Simulation
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (u: User) => { 
    const session = { ...u, isOnline: true }; 
    setUser(session); 
    sessionStorage.setItem('DIN_SESSION_USER', JSON.stringify(session)); 
    setCurrentPage('dashboard'); 
  };
  
  const handleLogout = () => { 
    setUser(null); 
    sessionStorage.removeItem('DIN_SESSION_USER'); 
    setCurrentPage('login'); 
    setSelectedFile(null); 
    setIsPreviewMode(false);
  };

  const userFiles = useMemo(() => {
    if (!user) return [];
    const cnic = user.cnic.replace(/[^0-9X]/g, '');
    return allFiles.filter(f => f.ownerCNIC.replace(/[^0-9X]/g, '') === cnic);
  }, [allFiles, user]);

  const navItems = useMemo(() => {
    if (!user) return [];
    return [
      { id: 'dashboard', label: 'Home', icon: Home },
      { id: 'notifications', label: 'Alerts', icon: Bell, badge: notifications.filter(n => !n.isRead).length },
      { id: 'inbox', label: 'Messages', icon: Mail, badge: messages.filter(m => !m.isRead && m.receiverId === user.id).length },
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'admin', label: 'Admin', icon: Settings, hidden: user.role !== 'ADMIN' },
    ].filter(i => !i.hidden);
  }, [user, notifications, messages]);

  const Logo = ({ className = "w-[120px]" }: { className?: string }) => (
    <svg viewBox="0 0 300 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#6e6f72" d="M3.81,83.07c.44-1.57.68-3.15,1.25-4.69,5.64-15.3,24.1-15.79,36.44-22.4l5.16-3.01-.6,3.09c-1.54.92-3.04,1.93-4.61,2.78-12.11,6.59-31.14,7.31-36.2,22.64-.36,1.08-.92,2.75-.57,3.82-.12.57-.3,1.14-.34,1.72-.33-.12-.1-1.42-.52-1.72v-2.24Z"/>
      <polygon fill="#6e6f72" points="18.61 62.61 18.61 12.56 28.4 18.85 28.84 19.27 28.91 58.71 18.61 62.61"/>
      <path fill="#0c0b0b" d="M256.92,68.45c-.06,1.49.79,3.01,1.4,4.36,2.31,5.06,5.63,10.96,8.49,15.76.11.19.18.47.43.51.03-6.89.09-13.78-.51-20.64h5.85c-.43,2.37-.27,4.75-.34,7.14-.21,6.9-.32,13.9,0,20.8.04.94.28,2.05.34,3.01h-6.02c-.36-1.54-1.25-3.06-1.98-4.48-2.93-5.67-6.23-11.16-9.12-16.85-.08,7.1-.33,14.25.26,21.33h-5.85c.08-.84.3-1.84.34-2.67.35-7.35.25-14.83,0-22.18-.07-2.04.1-4.09-.34-6.11h7.05Z"/>
      <path fill="#0c0b0b" d="M95,68.45c.13,1.1.47,1.98.88,2.99.84,2.02,2.13,4.33,3.16,6.31,1.96,3.78,4.15,7.45,6.2,11.18.39.07.23-.17.26-.43.28-3.26-.09-6.72-.18-9.97s.09-6.74-.51-10.07h6.02c-.45,1.61-.27,3.26-.34,4.91-.29,7.01-.29,14.13,0,21.14.07,1.64-.11,3.3.34,4.91h-6.02l-11.1-21.15c-.39-.07-.23.17-.26.43-.31,3.71.1,7.65.18,11.35.06,3.13-.2,6.28.34,9.38h-5.85c.45-3.11.27-6.25.34-9.38.13-5.85.22-11.68.01-17.54-.05-1.29-.29-2.73-.35-4.03h6.88Z"/>
      <path fill="#0aa98f" d="M4.32,87.03c.04-.58.23-1.15.34-1.72,3.52-17.37,24.06-18.15,36.83-25.02,1.32-.71,2.59-1.53,3.87-2.32.12-.04.11.13.09.26-.3,1.98-2.24,5.93-3.3,7.71-5.53,9.21-14.94,13.33-24.66,16.8-3.8,1.36-8.51,3.15-12.34,4.18-.27.07-.54.15-.83.12Z"/>
      <path fill="#0c0b0b" d="M176.91,99.41l.35-4.21c.14-5.46.09-10.9-.01-16.34-.07-3.48.11-6.96-.34-10.41,3.83.15,7.81-.19,11.62,0,5.29.26,10.21,1.66,11.21,7.54s-1.96,9.41-7.35,10.61l8.95,12.81h-7.92c-.16-1.59-.97-3.02-1.69-4.42-.5-.97-4.79-8.31-5.28-8.31h-3.87c0,4.25-.04,8.52.52,12.73h-6.19ZM182.59,83.07h6.97c.85,0,2.9-.84,3.53-1.46,1.88-1.82,1.79-5.82-.36-7.39-.52-.38-2.41-1.13-3-1.13h-6.97l-.17,9.97Z"/>
      <path fill="#0c0b0b" d="M202.72,99.41c.16-1.86.11-3.73.17-5.6.01-.45.18-.87.19-1.36.19-8-.02-16.03-.35-24,6.81.37,15.72-1.82,19.93,5.11,3.18,5.23,3.37,15,.24,20.29-4.32,7.28-13.01,5.27-20.16,5.56ZM208.4,94.77h4.73c7.48,0,7.5-13.28,5.23-17.95-.76-1.57-2.88-3.55-4.71-3.55h-5.25v21.5Z"/>
      <path fill="#0c0b0b" d="M53.88,99.41c.09-.89.3-1.96.34-2.84.33-7.13.22-14.36,0-21.49-.07-2.22.1-4.44-.34-6.63,7.19.37,16.1-1.92,20.33,5.56,2.88,5.08,2.98,14.37.17,19.49-4.21,7.67-13.19,5.63-20.5,5.9ZM59.73,94.77h4.56c7.61,0,7.71-13.12,5.37-17.92-.77-1.58-2.83-3.58-4.68-3.58h-5.25v21.5Z"/>
      <path fill="#0aa98f" d="M44.07,105.43c-4.6,1.67-9.06,2.57-13.94,1.64-8.71-1.66-15.07-8.8-21.5-14.28-1.25-1.07-3.02-2.18-4.13-3.26-.18-.18-.4-.3-.34-.6,4.34-1.7,8.64-2.59,13.28-1.67,8.12,1.6,14.37,8.73,20.53,13.7,1.97,1.59,4.02,3.05,6.1,4.47Z"/>
      <path fill="#0c0b0b" d="M148.35,99.41c3-9.01,6.47-17.92,8.93-27.1.16-.6.67-3.54.78-3.69.27-.39,6.61-.03,7.56-.17,2.93,10.47,6.3,20.85,10.26,30.97h-6.37c.02-1.39-.36-2.95-.81-4.26-.19-.55-.27-1.45-.98-1.43l-11.68.04c-.25.08-.28.29-.37.49-.69,1.47-.69,3.7-1.38,5.16h-5.94ZM157.29,89.26h9.46l-4.91-14.1-4.56,14.1Z"/>
      <path fill="#0c0b0b" d="M244.53,86.68c-3.64-.57-7.34-.27-11.01-.34l.17,8.08c2.9-.15,5.8.23,8.7.18.41,0,.78-.17,1.19-.19,1.7-.09,3.24.12,4.91-.51l-.52,5.84-20.48-.6c.1-1.03.31-2.25.35-3.27.25-6.31.16-12.61,0-18.91-.07-2.85.09-5.69-.34-8.52l19.63-.27.5,5.77c-1.2-.47-2.57-.62-3.86-.69-3.34-.18-6.74.1-10.07.18l-.17,8.08c3.67-.09,7.38.26,11.01-.34v5.5Z"/>
      <path fill="#0c0b0b" d="M144.56,75.68c-6.48-5.9-12.65-1.98-13.25,6.11-.52,7.01,1.13,16.32,10.47,12.79-.1-4.51.37-9.11-.32-13.56h5.51v18.4c-.92-.11-2.11-.32-3.01-.34-4.7-.13-8.27,2.91-13.15-.79-7.21-5.48-6.95-24.38,1.31-28.93,4.27-2.35,7.44-1.51,11.75-.28.33.09.81.02,1.05.16.38.22-.35,1.69-.35,2.07v4.39Z"/>
      <path fill="#6e6f72" d="M5.01,31.99l6.28,3.95c.58.38,3.74,2.38,3.84,2.7l.04,25.6-.18.5c-3.7,2.41-6.93,5.64-9.04,9.54l-.94,2.07V31.99Z"/>
      <path fill="#0c0b0b" d="M294.94,69.66c-.06,2.19-.14,4.33,0,6.53-.3.08-.34-.12-.52-.26-2.86-2.21-4.42-3.32-8.35-3.02-2.45.19-7.16,2.07-5.21,5.22,1.36,2.2,7.74,3.83,10.24,5.24,8.54,4.85,5.61,14.97-3.52,16.49-4.02.67-7.96-.22-11.92-.89l-.16-6.46c3.11,2.35,7.41,3.14,11.18,2.15,3.52-.93,5.2-4.22,1.78-6.59-3.12-2.16-7.36-2.75-10.38-5.28-5.45-4.56-3.08-12.15,3.35-14.2,4.76-1.51,8.92-.22,13.51,1.04Z"/>
      <path fill="#6e6f72" d="M32.54,27.35l7.83,4.98,2.29,1.67.05,19.06-.12.27c-3.24,1.62-6.49,3.46-10.05,4.28v-30.27Z"/>
      <path fill="#0c0b0b" d="M85.54,68.45c-.53,3.27-.27,6.59-.34,9.9-.12,5.98-.29,12.06-.01,18.06.04.95.3,2.04.35,3h-6.28v-30.96h6.28Z"/>
    </svg>
  );

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards">
        <div className="animate-in zoom-in duration-1000 ease-out flex flex-col items-center">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl mb-12 shadow-emerald-500/20">
            <Logo className="w-[180px] h-auto" />
          </div>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-emerald-500 rounded-full animate-loading-bar origin-left"></div>
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing Neural Node</p>
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
          .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; }
        `}</style>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={handleLogin} users={users} onRegister={(u) => setUsers([...users, u])} />;

  const handlePreview = (file: PropertyFile) => {
    setSelectedFile(file);
    setIsPreviewMode(true);
  };

  const renderPage = () => {
    if (selectedFile && !isPreviewMode) return <AccountStatement file={selectedFile} onBack={() => setSelectedFile(null)} />;
    switch (currentPage) {
      case 'dashboard': return <Dashboard onSelectFile={setSelectedFile} onPreviewFile={handlePreview} files={userFiles} userName={user.name} />;
      case 'notifications': return <Notifications notifications={notifications} onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n))} onDelete={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} onClearAll={() => setNotifications([])} />;
      case 'inbox': return <Inbox messages={messages.filter(m => user.role === 'ADMIN' || m.receiverId === user.id || m.receiverId === 'ALL' || m.senderId === user.id)} setMessages={setMessages} currentUser={user} onSendMessage={(m) => setMessages([m, ...messages])} users={users} initialPartnerId={initialChatPartnerId} />;
      case 'profile': return <Profile user={user} onUpdate={(u) => { setUser(u); setUsers(users.map(us => us.id === u.id ? u : us)); }} />;
      case 'admin': return <AdminPortal users={users} setUsers={setUsers} notices={notices} setNotices={setNotices} allFiles={allFiles} setAllFiles={setAllFiles} messages={messages} onSendMessage={(m) => setMessages([m, ...messages])} onSwitchToChat={(id) => { setInitialChatPartnerId(id); setCurrentPage('inbox'); }} onPreviewStatement={handlePreview} />;
      default: return <Dashboard onSelectFile={setSelectedFile} onPreviewFile={handlePreview} files={userFiles} userName={user.name} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 hidden lg:block">
        <div className="h-full flex flex-col">
          <div className="p-8 border-b"><Logo /></div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setCurrentPage(item.id); setSelectedFile(null); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${(currentPage === item.id && !selectedFile) ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={20} /><span className="flex-1 text-left">{item.label}</span>
                {item.badge ? <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{item.badge}</span> : null}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black text-red-600 hover:bg-red-50"><LogOut size={20} /> Logout</button></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 lg:pl-72 mobile-app-content pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center px-4 lg:px-8 justify-between">
          <div className="lg:hidden"><Logo /></div>
          <div className="flex items-center gap-4">
            {user.role === 'ADMIN' && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase">
                <ShieldCheck size={14} /> Admin Node
              </div>
            )}
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-xl">{user.name.charAt(0)}</div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-10">
          {renderPage()}
        </div>
      </main>

      {/* Quick Preview Slide-up Modal */}
      {isPreviewMode && selectedFile && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex-1 lg:p-8 flex items-center justify-center">
            <div className="bg-white w-full max-w-5xl h-full lg:h-[90vh] rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 ease-out">
              <div className="p-6 sm:p-8 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Eye size={24} /></div>
                  <div>
                    <h2 className="text-xl font-black uppercase text-slate-900 leading-none">Registry Preview</h2>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedFile.fileNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => { setIsPreviewMode(false); }}
                     className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                   >
                     <Maximize2 size={16} /> Full Ledger
                   </button>
                   <button onClick={() => { setIsPreviewMode(false); setSelectedFile(null); }} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-red-500 transition-all"><X size={28} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/50">
                <div className="p-2 sm:p-8 scale-[0.6] sm:scale-[0.8] lg:scale-100 origin-top flex justify-center">
                  <AccountStatement file={selectedFile} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-200 flex justify-around items-center px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = currentPage === item.id && !selectedFile;
          return (
            <button 
              key={item.id} 
              onClick={() => { setCurrentPage(item.id); setSelectedFile(null); }} 
              className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-slate-900 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {isActive && (
                <div className="absolute -top-3 w-10 h-1 bg-slate-900 rounded-full animate-in slide-in-from-top-2"></div>
              )}
              <div className={`p-2 rounded-xl ${isActive ? 'bg-slate-50' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              {item.badge ? (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">{item.badge}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {user && <AIChatAssistant currentUser={user} userFiles={userFiles} allFiles={allFiles} />}
    </div>
  );
};

export default App;
