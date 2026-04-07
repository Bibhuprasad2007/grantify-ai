import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  LayoutDashboard, FileText, ShieldCheck, Users, Landmark, GraduationCap,
  Bell, BarChart3, Settings, LogOut, ChevronRight, Search, Filter,
  CheckCircle2, XCircle, Clock, AlertTriangle, Eye, Download,
  TrendingUp, TrendingDown, ArrowUpRight, Sparkles, BadgeDollarSign,
  Send, FileDown, UserCheck, Flag, Star, MessageSquare, ChevronDown
} from 'lucide-react';

// ──── MOCK DATA ────
const MOCK_STATS = { students: 12847, applications: 3256, pending: 487, approved: 2104, rejected: 665 };

const MOCK_APPS = [
  { id: 'APP-2026-001', name: 'Rahul Kumar', type: 'Loan', status: 'Pending', amount: '₹2,50,000', aadhaar: '8765XXXX4321', date: '2026-04-05', priority: true, cibil: 742 },
  { id: 'APP-2026-002', name: 'Priya Sharma', type: 'Scholarship', status: 'Approved', amount: '₹75,000', aadhaar: '9123XXXX5678', date: '2026-04-04', priority: false, cibil: 810 },
  { id: 'APP-2026-003', name: 'Amit Patel', type: 'Loan', status: 'Pending', amount: '₹3,00,000', aadhaar: '7654XXXX8901', date: '2026-04-03', priority: true, cibil: 680 },
  { id: 'APP-2026-004', name: 'Sneha Das', type: 'Scholarship', status: 'Rejected', amount: '₹50,000', aadhaar: '6543XXXX2345', date: '2026-04-02', priority: false, cibil: 720 },
  { id: 'APP-2026-005', name: 'Vikram Singh', type: 'Loan', status: 'Pending', amount: '₹1,80,000', aadhaar: '5432XXXX6789', date: '2026-04-01', priority: false, cibil: 755 },
  { id: 'APP-2026-006', name: 'Anita Devi', type: 'Scholarship', status: 'Approved', amount: '₹1,00,000', aadhaar: '4321XXXX7890', date: '2026-03-31', priority: true, cibil: 690 },
];

const MOCK_DOCS = [
  { id: 1, student: 'Rahul Kumar', type: 'Aadhaar Card', status: 'Pending', aiTag: null, flagged: false },
  { id: 2, student: 'Rahul Kumar', type: 'PAN Card', status: 'Verified', aiTag: 'Auto-Verified by AI', flagged: false },
  { id: 3, student: 'Priya Sharma', type: 'Income Certificate', status: 'Pending', aiTag: null, flagged: true },
  { id: 4, student: 'Amit Patel', type: 'Bank Passbook', status: 'Pending', aiTag: null, flagged: false },
  { id: 5, student: 'Sneha Das', type: 'Aadhaar Card', status: 'Verified', aiTag: 'Auto-Verified by AI', flagged: false },
  { id: 6, student: 'Vikram Singh', type: 'PAN Card', status: 'Rejected', aiTag: null, flagged: true },
];

const MOCK_SCHEMES = [
  { id: 1, name: 'National Merit Scholarship', slots: 500, filled: 342, deadline: '2026-05-15' },
  { id: 2, name: 'SC/ST Scholarship', slots: 1000, filled: 876, deadline: '2026-06-01' },
  { id: 3, name: 'EWS Education Fund', slots: 300, filled: 210, deadline: '2026-04-30' },
];

const ACTIVITY_FEED = [
  { text: 'Rahul Kumar submitted loan application', time: '2 min ago', type: 'new' },
  { text: 'Priya Sharma scholarship approved by Officer Sinha', time: '15 min ago', type: 'approved' },
  { text: 'Amit Patel flagged for document review', time: '1 hr ago', type: 'flagged' },
  { text: 'Sneha Das application rejected', time: '3 hrs ago', type: 'rejected' },
];

// ──── SIDEBAR NAV ITEMS ────
const NAV_ITEMS = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'documents', label: 'Documents', icon: ShieldCheck },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'loans', label: 'Loan Approval', icon: Landmark },
  { key: 'scholarships', label: 'Scholarships', icon: GraduationCap },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

// ──── REUSABLE STAT CARD ────
const StatCard = ({ label, value, icon: Icon, trend, color = 'accent' }) => (
  <div className="p-5 glass border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color}`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trend > 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {trend > 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-heading font-extrabold text-text-1">{value}</p>
    <p className="text-[11px] font-bold text-text-3 uppercase tracking-wider mt-1">{label}</p>
  </div>
);

// ──── SIMPLE BAR CHART (CSS) ────
const SimpleBar = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2 h-32 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-accent/20 rounded-t-lg relative overflow-hidden" style={{ height: `${(d.value / max) * 100}%` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-accent to-accent-ai opacity-80" />
          </div>
          <span className="text-[9px] text-text-3 font-bold">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const CHART_DATA = [
  { label: 'Jan', value: 120 }, { label: 'Feb', value: 200 }, { label: 'Mar', value: 340 },
  { label: 'Apr', value: 280 }, { label: 'May', value: 410 }, { label: 'Jun', value: 380 },
];

// ──── STATUS BADGE ────
const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'bg-warning/10 text-warning border-warning/20',
    Approved: 'bg-success/10 text-success border-success/20',
    Rejected: 'bg-danger/10 text-danger border-danger/20',
    Verified: 'bg-success/10 text-success border-success/20',
  };
  return <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${map[status] || 'bg-white/5 text-text-3 border-white/10'}`}>{status}</span>;
};

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
const DistrictAdminPanel = () => {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [apps, setApps] = useState(MOCK_APPS);
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [remark, setRemark] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('all');

  const handleAppAction = (appId, action) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status: action === 'approve' ? 'Approved' : 'Rejected' } : a));
    setSelectedApp(null);
    setRemark('');
  };

  const handleDocAction = (docId, action) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: action === 'verify' ? 'Verified' : 'Rejected' } : d));
  };

  const filteredApps = apps.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.toLowerCase().includes(searchTerm.toLowerCase()) || a.aadhaar.includes(searchTerm);
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchType = filterType === 'All' || a.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  // ──── TAB CONTENT RENDERERS ────

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-white">District <span className="text-[#006A8E]">Overview</span></h2>
          <p className="text-text-3 text-sm font-medium mt-1">Real-time performance metrics for your jurisdiction.</p>
        </div>
        <div className="px-4 py-2 bg-[#006A8E]/10 border border-[#006A8E]/20 rounded-xl text-[#006A8E] text-xs font-bold">District: Patna</div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Students" value={MOCK_STATS.students.toLocaleString()} icon={Users} trend={12} color="[#006A8E]" />
        <StatCard label="Applications" value={MOCK_STATS.applications.toLocaleString()} icon={FileText} trend={8} color="accent" />
        <StatCard label="Pending" value={MOCK_STATS.pending} icon={Clock} color="warning" />
        <StatCard label="Approved" value={MOCK_STATS.approved.toLocaleString()} icon={CheckCircle2} trend={15} color="success" />
        <StatCard label="Rejected" value={MOCK_STATS.rejected} icon={XCircle} color="danger" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 glass border border-white/5 rounded-2xl">
          <h3 className="text-sm font-bold text-text-1 mb-1">Application Trends</h3>
          <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest mb-2">Monthly Overview 2026</p>
          <SimpleBar data={CHART_DATA} />
        </div>
        <div className="p-6 glass border border-white/5 rounded-2xl">
          <h3 className="text-sm font-bold text-text-1 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {ACTIVITY_FEED.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-base/50 border border-white/5">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === 'new' ? 'bg-accent' : a.type === 'approved' ? 'bg-success' : a.type === 'flagged' ? 'bg-warning' : 'bg-danger'}`} />
                <div>
                  <p className="text-xs text-text-1 font-medium">{a.text}</p>
                  <p className="text-[10px] text-text-3 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6 glass border border-warning/20 rounded-2xl bg-warning/5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-warning" />
          <h3 className="text-sm font-bold text-warning">High Priority Cases</h3>
        </div>
        <div className="space-y-2">
          {apps.filter(a => a.priority && a.status === 'Pending').map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-base/60 border border-white/5">
              <div className="flex items-center gap-3">
                <Flag size={14} className="text-warning" />
                <div>
                  <p className="text-sm font-bold text-text-1">{a.name}</p>
                  <p className="text-[10px] text-text-3">{a.id} · {a.type} · {a.amount}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedApp(a); setActiveTab('applications'); }} className="text-xs font-bold text-[#006A8E] hover:underline">Review →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6 animate-fade-in">
      {selectedApp ? (
        <div className="space-y-6">
          <button onClick={() => setSelectedApp(null)} className="flex items-center gap-2 text-text-3 hover:text-text-1 text-sm font-bold"><ChevronRight size={16} className="rotate-180" /> Back to List</button>
          <div className="p-8 glass border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-1">{selectedApp.name}</h3>
                <p className="text-text-3 text-xs font-mono mt-1">{selectedApp.id}</p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[['Type', selectedApp.type], ['Amount', selectedApp.amount], ['Aadhaar', selectedApp.aadhaar], ['CIBIL', selectedApp.cibil]].map(([l, v], i) => (
                <div key={i} className="p-4 bg-bg-base/50 rounded-xl border border-white/5">
                  <p className="text-[10px] text-text-3 font-bold uppercase tracking-wider">{l}</p>
                  <p className="text-sm font-bold text-text-1 mt-1">{v}</p>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider block mb-2">Officer Remarks</label>
              <textarea value={remark} onChange={e => setRemark(e.target.value)} placeholder="Add your verification comments..." rows={3}
                className="w-full bg-bg-base border border-border-default rounded-xl px-4 py-3 text-sm text-text-1 focus:border-accent/40 outline-none resize-none" />
            </div>
            {selectedApp.status === 'Pending' && (
              <div className="flex gap-3">
                <button onClick={() => handleAppAction(selectedApp.id, 'approve')} className="flex-1 h-12 bg-success text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-success/90 transition-all"><CheckCircle2 size={18}/> Approve</button>
                <button onClick={() => handleAppAction(selectedApp.id, 'reject')} className="flex-1 h-12 bg-danger text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-danger/90 transition-all"><XCircle size={18}/> Reject</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-heading font-extrabold text-white">Applications <span className="text-[#006A8E]">Management</span></h2>
            <div className="flex items-center gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" size={16} /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, ID, Aadhaar..." className="h-10 pl-10 pr-4 bg-bg-base border border-border-default rounded-xl text-xs text-text-1 focus:border-accent/40 outline-none w-56" /></div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 px-3 bg-bg-base border border-border-default rounded-xl text-xs text-text-1 outline-none"><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option></select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-10 px-3 bg-bg-base border border-border-default rounded-xl text-xs text-text-1 outline-none"><option>All</option><option>Loan</option><option>Scholarship</option></select>
            </div>
          </div>
          <div className="glass border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/5">{['App ID','Name','Type','Amount','Status','Date',''].map((h,i) => <th key={i} className="px-5 py-3 text-[10px] font-bold text-text-3 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody>
                {filteredApps.map(a => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-text-1">{a.id}{a.priority && <Flag size={10} className="inline ml-1 text-warning"/>}</td>
                    <td className="px-5 py-4 text-sm font-bold text-text-1">{a.name}</td>
                    <td className="px-5 py-4 text-xs text-text-3">{a.type}</td>
                    <td className="px-5 py-4 text-xs font-bold text-text-1">{a.amount}</td>
                    <td className="px-5 py-4"><StatusBadge status={a.status}/></td>
                    <td className="px-5 py-4 text-xs text-text-3">{a.date}</td>
                    <td className="px-5 py-4"><button onClick={() => setSelectedApp(a)} className="p-2 rounded-lg hover:bg-white/5 text-text-3 hover:text-text-1"><Eye size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApps.length === 0 && <p className="text-center text-text-3 text-sm py-12">No applications found.</p>}
          </div>
        </>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Document <span className="text-[#006A8E]">Verification</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map(d => (
          <div key={d.id} className={`p-5 glass border rounded-2xl transition-all ${d.flagged ? 'border-warning/30 bg-warning/5' : 'border-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-text-1">{d.student}</span>
              {d.flagged && <span className="text-[10px] font-bold text-warning flex items-center gap-1"><AlertTriangle size={12}/> Suspicious</span>}
            </div>
            <p className="text-sm font-bold text-text-1 mb-1">{d.type}</p>
            {d.aiTag && <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-3"><Sparkles size={10}/>{d.aiTag}</span>}
            <div className="flex items-center justify-between mt-4">
              <StatusBadge status={d.status} />
              <div className="flex gap-2">
                {d.status === 'Pending' && <>
                  <button onClick={() => handleDocAction(d.id, 'verify')} className="px-3 py-1.5 bg-success/10 text-success rounded-lg text-[10px] font-bold hover:bg-success/20 transition-all">Verify</button>
                  <button onClick={() => handleDocAction(d.id, 'reject')} className="px-3 py-1.5 bg-danger/10 text-danger rounded-lg text-[10px] font-bold hover:bg-danger/20 transition-all">Reject</button>
                </>}
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-text-3"><Download size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Student <span className="text-[#006A8E]">Profiles</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map(a => (
          <div key={a.id} className="p-6 glass border border-white/5 rounded-2xl hover:border-white/10 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#006A8E]/10 flex items-center justify-center text-[#006A8E] font-bold text-lg">{a.name[0]}</div>
              <div><p className="text-sm font-bold text-text-1">{a.name}</p><p className="text-[10px] text-text-3 font-mono">{a.aadhaar}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['CIBIL', a.cibil, a.cibil >= 700 ? 'text-success' : 'text-warning'],['Applied', a.type, 'text-accent'],['AI Trust', Math.floor(Math.random()*20)+80+'%', 'text-[#006A8E]']].map(([l,v,c],i)=>(
                <div key={i} className="p-3 bg-bg-base/50 rounded-xl border border-white/5">
                  <p className={`text-lg font-bold ${c}`}>{v}</p>
                  <p className="text-[9px] text-text-3 font-bold uppercase mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLoans = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Loan <span className="text-[#006A8E]">Approval Panel</span></h2>
      {apps.filter(a => a.type === 'Loan').map(a => (
        <div key={a.id} className="p-6 glass border border-white/5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">{a.name[0]}</div><div><p className="text-sm font-bold text-text-1">{a.name}</p><p className="text-[10px] text-text-3">{a.id}</p></div></div>
            <StatusBadge status={a.status} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[['Amount',a.amount],['CIBIL',a.cibil],['AI Rec.',a.cibil>=700?'✅ Recommended':'⚠️ Review'],['Date',a.date]].map(([l,v],i) => (
              <div key={i} className="p-3 bg-bg-base/50 rounded-xl border border-white/5"><p className="text-[9px] text-text-3 font-bold uppercase">{l}</p><p className="text-xs font-bold text-text-1 mt-0.5">{v}</p></div>
            ))}
          </div>
          {a.status === 'Pending' && (
            <div className="flex gap-3">
              <button onClick={() => handleAppAction(a.id, 'approve')} className="flex-1 h-10 bg-success/10 text-success rounded-xl text-xs font-bold hover:bg-success/20 transition-all flex items-center justify-center gap-2"><CheckCircle2 size={14}/> Approve Loan</button>
              <button onClick={() => handleAppAction(a.id, 'reject')} className="flex-1 h-10 bg-danger/10 text-danger rounded-xl text-xs font-bold hover:bg-danger/20 transition-all flex items-center justify-center gap-2"><XCircle size={14}/> Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderScholarships = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Scholarship <span className="text-[#006A8E]">Management</span></h2>
      {MOCK_SCHEMES.map(s => (
        <div key={s.id} className="p-6 glass border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div><p className="text-sm font-bold text-text-1">{s.name}</p><p className="text-[10px] text-text-3">Deadline: {s.deadline}</p></div>
            <span className="text-xs font-bold text-accent">{s.filled}/{s.slots} filled</span>
          </div>
          <div className="w-full bg-bg-base rounded-full h-2 mb-4"><div className="bg-gradient-to-r from-accent to-[#006A8E] h-2 rounded-full transition-all" style={{ width: `${(s.filled/s.slots)*100}%` }}/></div>
          <div className="flex gap-3">
            <button className="flex-1 h-10 bg-[#006A8E]/10 text-[#006A8E] rounded-xl text-xs font-bold hover:bg-[#006A8E]/20 transition-all flex items-center justify-center gap-2"><UserCheck size={14}/> Auto-Match Students</button>
            <button className="flex-1 h-10 bg-accent/10 text-accent rounded-xl text-xs font-bold hover:bg-accent/20 transition-all flex items-center justify-center gap-2"><Star size={14}/> Mark Priority</button>
          </div>
        </div>
      ))}
      <h3 className="text-sm font-bold text-text-1 mt-6">Scholarship Applications</h3>
      {apps.filter(a => a.type === 'Scholarship').map(a => (
        <div key={a.id} className="flex items-center justify-between p-4 glass border border-white/5 rounded-xl">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">{a.name[0]}</div><div><p className="text-sm font-bold text-text-1">{a.name}</p><p className="text-[10px] text-text-3">{a.amount}</p></div></div>
          <div className="flex items-center gap-3"><StatusBadge status={a.status}/>{a.status==='Pending'&&<><button onClick={()=>handleAppAction(a.id,'approve')} className="text-success text-xs font-bold hover:underline">Approve</button><button onClick={()=>handleAppAction(a.id,'reject')} className="text-danger text-xs font-bold hover:underline">Reject</button></>}</div>
        </div>
      ))}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Notifications & <span className="text-[#006A8E]">Announcements</span></h2>
      <div className="p-8 glass border border-white/5 rounded-2xl">
        <h3 className="text-sm font-bold text-text-1 mb-4">Send New Announcement</h3>
        <textarea value={announcementText} onChange={e => setAnnouncementText(e.target.value)} placeholder="Type your announcement message..." rows={4} className="w-full bg-bg-base border border-border-default rounded-xl px-4 py-3 text-sm text-text-1 focus:border-accent/40 outline-none resize-none mb-4" />
        <div className="flex items-center gap-4 mb-4">
          <label className="text-[11px] font-bold text-text-3 uppercase">Target:</label>
          <select value={announcementTarget} onChange={e => setAnnouncementTarget(e.target.value)} className="h-10 px-3 bg-bg-base border border-border-default rounded-xl text-xs text-text-1 outline-none"><option value="all">All Students</option><option value="pending">Pending Applicants</option><option value="approved">Approved Applicants</option></select>
        </div>
        <button onClick={() => { setAnnouncementText(''); alert('Announcement sent!'); }} disabled={!announcementText} className="h-12 px-8 bg-[#006A8E] text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#006A8E]/90 transition-all disabled:opacity-50"><Send size={16}/> Send Announcement</button>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Reports & <span className="text-[#006A8E]">Analytics</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['Approval Rate',`${Math.round((MOCK_STATS.approved/MOCK_STATS.applications)*100)}%`,'success'],['Rejection Rate',`${Math.round((MOCK_STATS.rejected/MOCK_STATS.applications)*100)}%`,'danger'],['Pending Rate',`${Math.round((MOCK_STATS.pending/MOCK_STATS.applications)*100)}%`,'warning']].map(([l,v,c],i)=>(
          <div key={i} className="p-6 glass border border-white/5 rounded-2xl text-center">
            <p className={`text-4xl font-heading font-extrabold text-${c}`}>{v}</p>
            <p className="text-[11px] font-bold text-text-3 uppercase tracking-wider mt-2">{l}</p>
          </div>
        ))}
      </div>
      <div className="p-6 glass border border-white/5 rounded-2xl">
        <h3 className="text-sm font-bold text-text-1 mb-4">Application Trends</h3>
        <SimpleBar data={CHART_DATA} />
      </div>
      <div className="flex gap-4">
        <button className="flex-1 h-12 bg-[#006A8E]/10 text-[#006A8E] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#006A8E]/20 transition-all"><FileDown size={18}/> Export as PDF</button>
        <button className="flex-1 h-12 bg-success/10 text-success rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-success/20 transition-all"><FileDown size={18}/> Export as Excel</button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Admin <span className="text-[#006A8E]">Settings</span></h2>
      <div className="p-8 glass border border-white/5 rounded-2xl space-y-6">
        <div>
          <h4 className="text-sm font-bold text-text-1 mb-3">Role Management</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['District Admin','Full access to all panels'],['Verification Officer','Document verification only']].map(([r,d],i)=>(
              <div key={i} className="p-4 bg-bg-base/50 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006A8E]/10 flex items-center justify-center text-[#006A8E]"><UserCheck size={18}/></div>
                <div><p className="text-sm font-bold text-text-1">{r}</p><p className="text-[10px] text-text-3">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-1 mb-3">District Configuration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-[11px] font-bold text-text-3 uppercase tracking-wider block mb-2">District Name</label><input defaultValue="Patna" className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 outline-none"/></div>
            <div><label className="text-[11px] font-bold text-text-3 uppercase tracking-wider block mb-2">State</label><input defaultValue="Bihar" className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 outline-none"/></div>
          </div>
        </div>
        <button className="h-12 px-8 bg-[#006A8E] text-white rounded-xl font-bold text-sm hover:bg-[#006A8E]/90 transition-all">Save Settings</button>
      </div>
    </div>
  );

  const renderTab = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'applications': return renderApplications();
      case 'documents': return renderDocuments();
      case 'students': return renderStudents();
      case 'loans': return renderLoans();
      case 'scholarships': return renderScholarships();
      case 'notifications': return renderNotifications();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-1 font-body">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} shrink-0 h-full bg-bg-surface border-r border-white/5 flex flex-col transition-all duration-300`}>
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-[#006A8E] flex items-center justify-center text-white shrink-0"><Landmark size={20}/></div>
          {sidebarOpen && <div><p className="text-sm font-bold text-text-1">District Panel</p><p className="text-[10px] text-text-3">Admin Portal</p></div>}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.key ? 'bg-[#006A8E]/10 text-[#006A8E] font-bold' : 'text-text-3 hover:bg-white/5 hover:text-text-1'}`}>
              <item.icon size={18} className="shrink-0"/>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-all">
            <LogOut size={18}/>{sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5 text-text-3"><ChevronRight size={18} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`}/></button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-text-3 hidden sm:inline">Officer: {user?.displayName || user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-[#006A8E]/10 flex items-center justify-center text-[#006A8E] font-bold text-sm">{(user?.displayName || user?.email || 'A')[0].toUpperCase()}</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default DistrictAdminPanel;
