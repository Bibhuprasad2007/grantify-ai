import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  LayoutDashboard, FileText, ShieldCheck, Users, Landmark, 
  LogOut, ChevronRight, Bookmark, Wallet, UserCheck, 
  MessageSquare, BarChart3, Settings, Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Bank Overview', icon: LayoutDashboard },
  { key: 'requests', label: 'Loan Requests', icon: FileText },
  { key: 'risk', label: 'Risk Assessment', icon: ShieldCheck },
  { key: 'disbursements', label: 'Tracking', icon: Wallet },
  { key: 'verification', label: 'Doc Verification', icon: UserCheck },
  { key: 'messages', label: 'Comm. Panel', icon: MessageSquare },
  { key: 'reports', label: 'Analytics', icon: BarChart3 },
  { key: 'settings', label: 'Bank Settings', icon: Settings },
];

// Import Separated Components
import BankOverview from './BankPanel/BankOverview';
import LoanRequests from './BankPanel/LoanRequests';
import LoanDecisionScreen from './BankPanel/LoanDecisionScreen';
import RiskAssessment from './BankPanel/RiskAssessment';
import DisbursementTracking from './BankPanel/DisbursementTracking';
import DocVerification from './BankPanel/DocVerification';
import CommPanel from './BankPanel/CommPanel';
import Analytics from './BankPanel/Analytics';
import BankSettings from './BankPanel/BankSettings';

import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

const BankAdminPanel = () => {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  // Real-time Firestore States
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    requests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    disbursed: "₹0",
  });

  // Fetch Live Data from Firestore
  React.useEffect(() => {
    const loansRef = collection(db, 'loans');
    const q = query(loansRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate Real-time Stats
      const pending = loanData.filter(l => l.status === 'Pending').length;
      const approved = loanData.filter(l => l.status === 'Approved').length;
      const rejected = loanData.filter(l => l.status === 'Rejected').length;
      
      setLoans(loanData);
      setStats({
        requests: loanData.length,
        pending,
        approved,
        rejected,
        disbursed: `₹${(approved * 5.2).toFixed(1)}L`, // Mock calculation based on real approvals
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle switching to a specific loan review
  const handleReviewLoan = (loan) => {
    setSelectedLoan(loan);
    setActiveTab('decision'); 
  };

  const renderActiveTab = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-3">
        <Activity className="animate-spin mb-4 text-success" size={32} />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Live Data...</p>
      </div>
    );

    switch(activeTab) {
      case 'dashboard': 
        return <BankOverview 
          stats={stats} 
          highRiskLoans={loans.filter(l => l.aiRisk === 'High' || l.priority)} 
          onReviewLoan={handleReviewLoan} 
        />;
      case 'requests': 
        return <LoanRequests 
          loans={loans} 
          onReviewLoan={handleReviewLoan} 
        />;
      case 'decision':
        return <LoanDecisionScreen 
          loan={selectedLoan} 
          onBack={() => setActiveTab('requests')} 
        />;
      case 'risk': 
        return <RiskAssessment loans={loans} />;
      case 'disbursements': 
        return <DisbursementTracking disbursements={loans.filter(l => l.status === 'Approved')} />;
      case 'verification': 
        return <DocVerification />;
      case 'messages': 
        return <CommPanel />;
      case 'reports': 
        return <Analytics loans={loans} />;
      case 'settings': 
        return <BankSettings />;
      default: 
        return <BankOverview stats={stats} highRiskLoans={[]} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-1 font-body">
      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 h-full bg-bg-surface border-r border-white/5 flex flex-col transition-all duration-300 relative z-40`}>
        <div className="p-5 flex items-center gap-3 border-b border-white/5 h-16">
          <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center text-white shrink-0 shadow-lg shadow-success/10">
            <Landmark size={20} />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in text-nowrap truncate">
              <p className="text-sm font-bold text-text-1 leading-tight">Bank Partner</p>
              <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest mt-0.5">UCO Bank Hub</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSelectedLoan(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${activeTab === item.key ? 'bg-success/10 text-success font-bold' : 'text-text-3 hover:bg-white/5 hover:text-text-1'}`}>
              <item.icon size={18} className={`shrink-0 transition-colors ${activeTab === item.key ? 'text-success' : 'group-hover:text-success'}`} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {item.key === 'requests' && sidebarOpen && (
                <span className="ml-auto w-5 h-5 bg-danger text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">8</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-all outline-none">
            <LogOut size={18} />
            {sidebarOpen && <span>Bank Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6 bg-bg-surface/50 backdrop-blur-xl sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5 text-text-3">
             <ChevronRight size={18} className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider italic">Secure Portal Access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-text-1 tracking-tight">{user?.displayName || 'Bank Official'}</p>
                <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest">{user?.branchCode ? `Branch: ${user.branchCode}` : 'UCO Bank Official'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success font-black shadow-inner">
                 {(user?.displayName || 'B')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.03),transparent_40%)]">
           <div className="max-w-7xl mx-auto min-h-full">
            {renderActiveTab()}
           </div>
        </main>
      </div>
    </div>
  );
};

export default BankAdminPanel;
