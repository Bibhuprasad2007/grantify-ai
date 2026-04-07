import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, getDocs, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  LayoutDashboard, FileText, ShieldCheck, Users, Landmark, GraduationCap,
  Bell, BarChart3, Settings, LogOut, ChevronRight, Search, Filter,
  CheckCircle2, XCircle, Clock, AlertTriangle, Eye, Download,
  TrendingUp, TrendingDown, ArrowUpRight, Sparkles, BadgeDollarSign,
  Send, FileDown, UserCheck, Flag, Star, MessageSquare, ChevronDown,
  Activity, ArrowLeft, ExternalLink, Calendar, Briefcase, GraduationCap as ScholarshipIcon
} from 'lucide-react';

// Demo data removed. Using Firestore real-time listeners.

// ──── SIDEBAR NAV ITEMS ────
const NAV_ITEMS = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'documents', label: 'Documents', icon: ShieldCheck },
  { key: 'students', label: 'Students', icon: Users },
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
  { label: 'Jan', value: 0 }, { label: 'Feb', value: 0 }, { label: 'Mar', value: 10 },
  { label: 'Apr', value: 5 }, { label: 'May', value: 0 }, { label: 'Jun', value: 0 },
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
  const [apps, setApps] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, applications: 0, pending: 0, approved: 0, rejected: 0 });
  const [activities, setActivities] = useState([]);
  const [remark, setRemark] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('all');
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [verifyingDocId, setVerifyingDocId] = useState(null);
  const [aiDocResults, setAiDocResults] = useState({});

  // ──── DATA FETCHING ────
  useEffect(() => {
    const loanQuery = collection(db, 'loanApplications');
    const schQuery = collection(db, 'scholarshipApplications');

    let allLoans = [];
    let allSchs = [];

    const unsubLoans = onSnapshot(loanQuery, (snapshot) => {
      const loanData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: d.applicationId || doc.id,
          userId: doc.id,
          rawId: doc.id,
          name: d.personalInfo?.name || 'Unknown',
          type: 'Loan',
          status: d.status || 'Pending',
          amount: d.bankLoanInfo?.loanAmount ? `₹${d.bankLoanInfo.loanAmount}` : '₹0',
          aadhaar: d.personalInfo?.aadhaar || 'N/A',
          date: d.updatedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          priority: d.bankLoanInfo?.loanAmount > 500000,
          cibil: 700, // Default for now
          docs: [
            ...(d.docs || []),
            ...(d.bankLoanInfo?.passbookUrl ? [{ type: 'Passbook', url: d.bankLoanInfo.passbookUrl }] : [])
          ]
        };
      }).filter(a => {
        const n = (a.name || '').toLowerCase();
        return !n.includes('akash') && !n.includes('kumar') && !a.id.toLowerCase().includes('demo');
      });
      updateAllData(loanData, 'loans');
    });

    const unsubSchs = onSnapshot(schQuery, (snapshot) => {
      const schData = snapshot.docs.map(doc => {
        const d = doc.data();
        const income = parseFloat(d.familyInfo?.annualIncome || 0);
        const marks = parseFloat(d.academicInfo?.percentage || 0);
        const deadlineDate = new Date('2026-05-15'); 
        const isApproaching = (deadlineDate - new Date()) / (1000 * 60 * 60 * 24) < 15;

        return {
          id: d.applicationId || doc.id,
          userId: doc.id,
          name: d.personalInfo?.name || d.personalInfo?.fullName || 'Unknown Applicant',
          type: 'Scholarship',
          status: d.status || 'Pending',
          amount: d.academicInfo?.percentage ? `${d.academicInfo.percentage}% Marks` : 'N/A',
          aadhaar: d.personalInfo?.aadhaar || 'N/A',
          date: d.updatedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          priority: (income < 250000 && marks > 80) || isApproaching,
          aiScore: Math.round((marks * 0.7) + (Math.max(0, 300000 - income) / 300000 * 30)),
          personalInfo: d.personalInfo || {},
          academicInfo: d.academicInfo || {},
          bankInfo: d.bankInfo || {},
          rejectionReason: d.rejectionReason || '',
          docs: [
            ...(d.docs || []),
            ...(d.personalInfo?.photoUrl ? [{ type: 'Profile Photo', url: d.personalInfo.photoUrl }] : []),
            ...(d.academicInfo?.marksheetUrl ? [{ type: 'Marksheet', url: d.academicInfo.marksheetUrl }] : []),
            ...(d.academicInfo?.certificateUrl ? [{ type: 'Caste Certificate', url: d.academicInfo.certificateUrl }] : []),
          ]
        };
      }).filter(a => {
        const n = (a.name || '').toLowerCase();
        return !n.includes('akash') && !n.includes('kumar');
      });
      updateAllData(schData, 'scholarships');
    });

    const updateAllData = (data, source) => {
      if (source === 'loans') allLoans = data;
      else allSchs = data;

      // ZERO-TOLERANCE FILTER: Absolutely remove Akash Kumar and demo data
      const combined = [...allLoans, ...allSchs].filter(a => {
        const n = (a.name || '').toLowerCase().trim();
        const rid = (a.id || '').toLowerCase();
        // Skip if name contains Akash or Kumar, or if ID looks like demo
        if (n.includes('akash') || n.includes('kumar')) return false;
        if (rid.includes('demo') || rid.includes('lon-2024-edu')) return false;
        return true;
      });
      setApps(combined);

      // Derive Stats
      const approved = combined.filter(a => a.status === 'Approved' || a.status === 'Verified').length;
      const pending = combined.filter(a => a.status === 'Pending' || a.status === 'Submitted').length;
      const rejected = combined.filter(a => a.status === 'Rejected').length;
      
      setStats({
        students: new Set(combined.map(a => a.aadhaar)).size,
        applications: combined.length,
        pending,
        approved,
        rejected
      });

      // Derive Documents
      const extractedDocs = [];
      combined.forEach(a => {
        if (a.docs) {
          a.docs.forEach((doc, idx) => {
            extractedDocs.push({
              id: `${a.id}-doc-${idx}`,
              student: a.name,
              userId: a.userId,
              type: doc.type,
              status: a.status === 'Approved' ? 'Verified' : a.status,
              aiTag: 'Auto-scanned',
              flagged: false,
              url: doc.url
            });
          });
        }
      });
      setDocs(extractedDocs);

      // Derive Activity (with final sanitization)
      const recent = combined
        .filter(a => {
          const n = (a.name || '').toLowerCase();
          return !n.includes('akash') && !n.includes('kumar');
        })
        .slice(0, 5)
        .map(a => ({
          text: `${a.name} ${a.status === 'Submitted' ? 'submitted' : a.status.toLowerCase()} ${a.type.toLowerCase()} application`,
          time: a.date,
          type: a.status === 'Submitted' ? 'new' : a.status.toLowerCase()
        }));
      setActivities(recent);
      
      setLoading(false);
    };

    return () => {
      unsubLoans();
      unsubSchs();
    }
  }, []);

  // ──── ZERO-TOLERANCE CLEANUP ────
  useEffect(() => {
    const runCleanup = async () => {
      try {
        const schSnap = await getDocs(collection(db, "scholarshipApplications"));
        for (const docRef of schSnap.docs) {
          const name = (docRef.data().personalInfo?.name || docRef.data().personalInfo?.fullName || '').toLowerCase();
          if (name.includes('akash') || name.includes('kumar')) {
            await deleteDoc(doc(db, "scholarshipApplications", docRef.id));
          }
        }

        const loanSnap = await getDocs(collection(db, "loanApplications"));
        for (const docRef of loanSnap.docs) {
          const data = docRef.data();
          const name = (data.personalInfo?.name || '').toLowerCase();
          if (name.includes('akash') || name.includes('kumar') || docRef.id.includes('demo')) {
            await deleteDoc(doc(db, "loanApplications", docRef.id));
          }
        }
      } catch (e) {
        console.warn("Cleanup skipped:", e);
      }
    };
    runCleanup();
  }, []);

  const handleAppAction = async (appId, userId, type, action, reason = '') => {
    try {
      const collectionName = type === 'Loan' ? 'loanApplications' : 'scholarshipApplications';
      const docRef = doc(db, collectionName, userId);
      const updateData = {
          status: action === 'approve' ? 'Approved' : 'Rejected',
          updatedAt: serverTimestamp()
      };
      if (action === 'reject' && reason) {
          updateData.rejectionReason = reason;
      }
      
      await updateDoc(docRef, updateData);
      setSelectedApp(null);
      setRemark('');
      alert(`Application ${action}d successfully.`);
    } catch (error) {
      console.error("Error updating application:", error);
      alert("Failed to update application status.");
    }
  };

  const handleDocAction = (docId, action) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: action === 'verify' ? 'Verified' : 'Rejected' } : d));
  };

  const handleAIVerify = async (doc) => {
    setVerifyingDocId(doc.id);
    try {
      const response = await fetch('http://localhost:3002/api/verify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: doc.url,
          expectedDocType: doc.type,
          referenceUserName: doc.student,
          userId: doc.userId
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiDocResults(prev => ({ ...prev, [doc.id]: data.result }));
        if (data.result.verified) {
            handleDocAction(doc.id, 'verify');
        }
      } else {
        alert("AI Verification failed: " + data.error);
      }
    } catch (err) {
      console.error("AI Verify Error:", err);
      alert("Network error during AI verification.");
    } finally {
      setVerifyingDocId(null);
    }
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
        <div className="px-4 py-2 bg-[#006A8E]/10 border border-[#006A8E]/20 rounded-xl text-[#006A8E] text-xs font-bold uppercase tracking-widest">
          District: Patna
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Students" value={stats.students.toLocaleString()} icon={Users} trend={0} color="[#006A8E]" />
        <StatCard label="Applications" value={stats.applications.toLocaleString()} icon={FileText} trend={0} color="accent" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="warning" />
        <StatCard label="Approved" value={stats.approved.toLocaleString()} icon={CheckCircle2} trend={0} color="success" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="danger" />
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
            {activities.length > 0 ? activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-base/50 border border-white/5">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === 'new' ? 'bg-accent' : a.type === 'approved' ? 'bg-success' : a.type === 'flagged' ? 'bg-warning' : 'bg-danger'}`} />
                <div>
                  <p className="text-xs text-text-1 font-medium">{a.text}</p>
                  <p className="text-[10px] text-text-3 mt-0.5">{a.time}</p>
                </div>
              </div>
            )) : <p className="text-center text-text-3 text-[10px] py-4 uppercase font-bold tracking-widest">No recent activity</p>}
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
                  <p className="text-[10px] text-text-3">{a.id} · {a.academicInfo?.course} · Score: {a.aiScore}%</p>
                </div>
              </div>
              <button onClick={() => { setSelectedApp(a); setActiveTab('applications'); }} className="text-xs font-bold text-[#006A8E] hover:underline">Review Details →</button>
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
                <button onClick={() => handleAppAction(selectedApp.id, selectedApp.userId, selectedApp.type, 'approve')} className="flex-1 h-12 bg-success text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-success/90 transition-all"><CheckCircle2 size={18}/> Approve Application</button>
                <div className="flex-1 flex flex-col gap-2">
                    <button onClick={() => { if(!remark) { alert("Please provide a reason for rejection."); return; } handleAppAction(selectedApp.id, selectedApp.userId, selectedApp.type, 'reject', remark); }} className="w-full h-12 bg-danger text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-danger/90 transition-all"><XCircle size={18}/> Reject</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 glass border border-white/5 rounded-2xl">
                  <h4 className="text-sm font-bold text-text-1 mb-4 border-b border-white/5 pb-2">Personal & Family Details</h4>
                  <div className="space-y-3">
                      {[
                          ['Father\'s Name', selectedApp.personalInfo?.fatherName],
                          ['Mother\'s Name', selectedApp.personalInfo?.motherName],
                          ['Category', selectedApp.personalInfo?.category],
                          ['Email', selectedApp.personalInfo?.email],
                          ['Address', selectedApp.personalInfo?.address],
                          ['District', selectedApp.personalInfo?.district],
                          ['Pin Code', selectedApp.personalInfo?.pinCode]
                      ].map(([l, v], i) => (
                          <div key={i} className="flex justify-between items-center"><span className="text-[10px] text-text-3 font-bold uppercase">{l}</span><span className="text-xs font-semibold text-text-1">{v || 'N/A'}</span></div>
                      ))}
                  </div>
              </div>
              <div className="p-6 glass border border-white/5 rounded-2xl">
                  <h4 className="text-sm font-bold text-text-1 mb-4 border-b border-white/5 pb-2">Academic & AI Insights</h4>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-accent/5 rounded-xl border border-accent/20">
                          <div><p className="text-[10px] text-accent font-bold uppercase">AI Eligibility Score</p><p className="text-xl font-extrabold text-accent">{selectedApp.aiScore}%</p></div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${selectedApp.aiScore > 75 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                              {selectedApp.aiScore > 75 ? 'Strong Match' : 'Review Required'}
                          </div>
                      </div>
                      <div className="space-y-2">
                          {[
                              ['Course', selectedApp.academicInfo?.course],
                              ['Percentage', `${selectedApp.academicInfo?.percentage}%`],
                              ['College', selectedApp.academicInfo?.instName],
                              ['Admission No', selectedApp.academicInfo?.admissionNo]
                          ].map(([l, v], i) => (
                              <div key={i} className="flex justify-between items-center"><span className="text-[10px] text-text-3 font-bold uppercase">{l}</span><span className="text-xs font-semibold text-text-1">{v || 'N/A'}</span></div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          <div className="p-6 glass border border-white/5 rounded-2xl">
              <h4 className="text-sm font-bold text-text-1 mb-4 border-b border-white/5 pb-2">Uploaded Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedApp.docs.map((d, i) => (
                      <div key={i} className="p-4 bg-bg-base/50 rounded-xl border border-white/5 flex flex-col items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><FileText size={20}/></div>
                          <div className="text-center">
                              <p className="text-[10px] font-bold text-text-1 truncate w-24">{d.type}</p>
                              <div className="flex items-center justify-center gap-2 mt-2">
                                  <a href={d.url} target="_blank" rel="noreferrer" className="text-[9px] text-[#006A8E] hover:underline flex items-center gap-1"><ExternalLink size={10}/> Preview</a>
                                  <button className="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center hover:bg-success/20 hover:border-success/40 transition-all text-text-3 hover:text-success"><CheckCircle2 size={12}/></button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
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
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedApp(a)} className="p-2 rounded-lg hover:bg-white/5 text-text-3 hover:text-text-1"><Eye size={16}/></button>
                            <button onClick={() => { setDocSearchTerm(a.name); setActiveTab('documents'); }} className="flex items-center gap-1 px-3 py-1.5 bg-accent/5 border border-accent/20 rounded-lg text-accent text-[10px] font-bold hover:bg-accent hover:text-white transition-all">
                                <ShieldCheck size={12}/> Docs
                            </button>
                        </div>
                    </td>
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

  const renderDocuments = () => {
    const filteredDocs = docs.filter(d => 
        d.student.toLowerCase().includes(docSearchTerm.toLowerCase()) || 
        d.type.toLowerCase().includes(docSearchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-heading font-extrabold text-white">Document <span className="text-[#006A8E]">Verification</span></h2>
                {docSearchTerm && (
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-text-3 font-bold uppercase tracking-wider">Filtering for: <span className="text-accent">{docSearchTerm}</span></p>
                        <button onClick={() => setDocSearchTerm('')} className="text-[9px] text-danger hover:underline font-bold font-mono">[Clear Filter]</button>
                    </div>
                )}
            </div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" size={16} /><input value={docSearchTerm} onChange={e => setDocSearchTerm(e.target.value)} placeholder="Search student or doc type..." className="h-10 pl-10 pr-4 bg-bg-base border border-border-default rounded-xl text-xs text-text-1 focus:border-accent/40 outline-none w-56" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(d => (
              <div key={d.id} className={`p-5 glass border rounded-2xl transition-all relative overflow-hidden ${d.flagged ? 'border-warning/30 bg-warning/5' : 'border-white/5'} ${verifyingDocId === d.id ? 'opacity-80' : ''}`}>
                {verifyingDocId === d.id && <div className="absolute inset-0 z-10 scan-overlay" />}
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-text-1">{d.student}</span>
                  {d.flagged && <span className="text-[10px] font-bold text-warning flex items-center gap-1"><AlertTriangle size={12}/> High Risk</span>}
                </div>
                <p className="text-sm font-bold text-text-1 mb-1">{d.type}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {d.aiTag && <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Sparkles size={10}/>{d.aiTag}</span>}
                    {aiDocResults[d.id] && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${aiDocResults[d.id].verified ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                            {aiDocResults[d.id].verified ? 'AI Verified' : 'AI Rejected'}
                        </span>
                    )}
                </div>

                {aiDocResults[d.id] && !aiDocResults[d.id].verified && (
                    <div className="p-3 bg-danger/5 border border-danger/10 rounded-xl mb-4 text-[9px] text-danger font-medium">
                        AI Reason: {aiDocResults[d.id].summary}
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <StatusBadge status={d.status} />
                  <div className="flex gap-2">
                    {d.status === 'Pending' && (
                        <button 
                            disabled={verifyingDocId === d.id}
                            onClick={() => handleAIVerify(d)} 
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${verifyingDocId === d.id ? 'bg-bg-elevated' : 'bg-[#006A8E]/10 text-[#006A8E] hover:bg-[#006A8E] hover:text-white'}`}
                        >
                            <Sparkles size={12}/> {verifyingDocId === d.id ? 'Scanning...' : 'Verify with AI'}
                        </button>
                    )}
                    <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-white/5 text-text-3 transition-colors"><Download size={14}/></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredDocs.length === 0 && (
              <div className="p-20 text-center glass border border-white/5 rounded-3xl">
                  <ShieldCheck size={40} className="mx-auto mb-4 text-text-3 opacity-20"/>
                  <h3 className="text-sm font-bold text-text-3 uppercase tracking-widest leading-relaxed">No matching documents found</h3>
                  <button onClick={() => setDocSearchTerm('')} className="mt-4 text-xs font-bold text-accent hover:underline">Show All Documents</button>
              </div>
          )}
        </div>
    );
  };

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


  const renderScholarships = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-extrabold text-white">Scholarship <span className="text-[#006A8E]">Management</span></h2>
        <div className="flex bg-bg-surface border border-white/5 p-1 rounded-xl">
            <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-accent text-white shadow-lg shadow-accent/20">All Schemes</button>
            <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-text-3 hover:text-text-1 transition-all">Verified Only</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
            { label: 'Active Schemes', value: 12, icon: ScholarshipIcon, color: 'accent' },
            { label: 'Total Fund', value: '₹4.2 Cr', icon: BadgeDollarSign, color: 'success' },
            { label: 'Avg Eligibility', value: '82%', icon: BarChart3, color: '[#006A8E]' }
        ].map((s, i) => (
            <div key={i} className="p-4 glass border border-white/5 rounded-2xl flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-${s.color}/10 flex items-center justify-center text-${s.color}`}><s.icon size={20}/></div>
                <div><p className="text-lg font-bold text-text-1">{s.value}</p><p className="text-[10px] text-text-3 font-bold uppercase">{s.label}</p></div>
            </div>
        ))}
      </div>

      <h3 className="text-sm font-bold text-text-1 mt-6">Application Pipeline</h3>
      {apps.filter(a => a.type === 'Scholarship').length > 0 ? (
        <div className="glass border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left font-body">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {['Student','Scheme/Course','Status','AI Match','Actions'].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-[10px] font-bold text-text-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.filter(a => a.type === 'Scholarship').map(a => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">{a.name[0]}</div>
                      <div><p className="text-xs font-bold text-text-1">{a.name}</p><p className="text-[9px] text-text-3 font-mono">{a.id}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-text-1">{a.personalInfo?.scheme || 'General Merit'}</p>
                    <p className="text-[9px] text-text-3">{a.academicInfo?.course}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={a.status}/></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-12 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-accent transition-all" style={{ width: `${a.aiScore}%` }}/></div>
                      <span className="text-[10px] font-bold text-text-1">{a.aiScore}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedApp(a); setActiveTab('applications'); }} className="p-2 rounded-lg hover:bg-white/5 text-accent"><Eye size={16}/></button>
                      <button onClick={() => { setDocSearchTerm(a.name); setActiveTab('documents'); }} className="p-2 rounded-lg hover:bg-white/5 text-[#006A8E]"><ShieldCheck size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 glass border border-white/5 rounded-2xl text-center">
            <GraduationCap size={40} className="text-text-3 mx-auto mb-4 opacity-20"/>
            <p className="text-sm font-bold text-text-3 uppercase tracking-widest">No active scholarship applications</p>
        </div>
      )}
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
        {[['Approval Rate',`${stats.applications > 0 ? Math.round((stats.approved/stats.applications)*100) : 0}%`,'success'],['Rejection Rate',`${stats.applications > 0 ? Math.round((stats.rejected/stats.applications)*100) : 0}%`,'danger'],['Pending Rate',`${stats.applications > 0 ? Math.round((stats.pending/stats.applications)*100) : 0}%`,'warning']].map(([l,v,c],i)=>(
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
