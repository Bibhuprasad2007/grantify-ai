import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, Filter, ArrowRight, Clock, 
  CheckCircle2, XCircle, FileEdit, GraduationCap, 
  Landmark, ChevronRight, Calendar, IndianRupee,
  ShieldCheck, AlertCircle, UserCircle
} from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

const StatusBadge = ({ status }) => {
  const map = {
    'Submitted': 'bg-success/10 text-success border-success/20',
    'Pending': 'bg-warning/10 text-warning border-warning/20',
    'Approved': 'bg-success/10 text-success border-success/20',
    'Verified': 'bg-success/10 text-success border-success/20',
    'Rejected': 'bg-danger/10 text-danger border-danger/20',
    'Draft': 'bg-white/5 text-text-3 border-white/10',
  };
  return (
    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${map[status] || map['Draft']}`}>
      {status}
    </span>
  );
};

const DetailsModal = ({ app, onClose }) => {
  if (!app) return null;
  const isScholarship = app._type === 'Scholarship';

  const Section = ({ title, children, icon: Icon }) => (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          <Icon size={16} />
        </div>
        <h5 className="text-sm font-bold text-text-1 uppercase tracking-widest">{title}</h5>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="p-4 rounded-xl bg-bg-base/40 border border-white/5">
      <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-semibold text-text-1">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 ml-[72px] md:ml-64 transition-all duration-300">
      <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-bg-surface w-full max-w-3xl max-h-[85vh] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative animate-fade-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-bg-elevated/20">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isScholarship ? 'bg-accent-ai/20 text-accent-ai' : 'bg-accent/20 text-accent'}`}>
              {isScholarship ? <GraduationCap size={24} /> : <Landmark size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-1">{isScholarship ? (app.personalInfo?.scheme || 'Scholarship') : 'Education Loan'}</h3>
              <p className="text-[10px] text-text-3 font-extrabold uppercase tracking-[.2em] mt-0.5">ID: {app.applicationId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-bg-base border border-white/5 text-text-3 hover:text-text-1 hover:border-white/20 transition-all flex items-center justify-center"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Section title="Personal Information" icon={UserCircle}>
            <InfoRow label="Full Name" value={app.personalInfo?.name} />
            <InfoRow label="Aadhaar Number" value={app.personalInfo?.aadhaar} />
            <InfoRow label="Gender" value={app.personalInfo?.gender} />
            <InfoRow label="Category" value={app.personalInfo?.category} />
            <InfoRow label="Date of Birth" value={app.personalInfo?.dob} />
            <InfoRow label="Mobile" value={app.personalInfo?.mobile} />
            <InfoRow label="Email" value={app.personalInfo?.email} />
            <InfoRow label="Address" value={app.personalInfo?.address} />
          </Section>

          <div className="h-px bg-white/5 my-8" />

          <Section title="Academic Information" icon={GraduationCap}>
            <InfoRow label="Current Course" value={app.academicInfo?.course || app.bankLoanInfo?.courseName} />
            <InfoRow label="Institute Name" value={app.academicInfo?.instName || app.bankLoanInfo?.collegeName} />
            <InfoRow label="Board/University" value={app.academicInfo?.board} />
            <InfoRow label="Percentage / GPA" value={app.academicInfo?.percentage ? `${app.academicInfo.percentage}%` : 'N/A'} />
            <InfoRow label="Passing Year" value={app.academicInfo?.passingYear} />
            <InfoRow label="Admission No" value={app.academicInfo?.admissionNo} />
          </Section>

          <div className="h-px bg-white/5 my-8" />

          <Section title="Bank Details" icon={Landmark}>
            <InfoRow label="Bank Name" value={app.bankInfo?.bankName} />
            <InfoRow label="Branch Name" value={app.bankInfo?.branchName} />
            <InfoRow label="Account Holder" value={app.bankInfo?.accHolder} />
            <InfoRow label="Account Number" value={app.bankInfo?.accNo ? `****${app.bankInfo.accNo.slice(-4)}` : 'N/A'} />
            <InfoRow label="IFSC Code" value={app.bankInfo?.ifsc} />
          </Section>

          {app.docs && app.docs.length > 0 && (
            <>
              <div className="h-px bg-white/5 my-8" />
              <Section title="Verified Documents" icon={ShieldCheck}>
                {app.docs.map((doc, i) => (
                  <div key={i} className="p-4 rounded-xl bg-success/5 border border-success/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-xs font-bold text-text-1">{doc.type}</span>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-accent hover:underline">VIEW DOCUMENT →</a>
                  </div>
                ))}
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end bg-bg-elevated/10">
          <button 
            onClick={onClose}
            className="px-8 h-12 rounded-xl bg-accent text-bg-base text-sm font-bold hover:shadow-accent-glow transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationCard = ({ app, type, onViewDetails }) => {
  const isScholarship = type === 'Scholarship';
  const Icon = isScholarship ? GraduationCap : Landmark;
  const accentColor = isScholarship ? 'text-accent-ai' : 'text-accent';
  const bgColor = isScholarship ? 'bg-accent-ai/10' : 'bg-accent/10';

  return (
    <div className="p-6 rounded-3xl glass border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor} ${accentColor} border border-white/5 shadow-inner`}>
            <Icon size={28} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-text-1 group-hover:text-accent transition-colors">
              {isScholarship ? (app.personalInfo?.scheme || 'Scholarship Scheme') : (app.loanType || 'Education Loan')}
            </h4>
            <p className="text-[11px] text-text-3 font-semibold uppercase tracking-widest mt-0.5 flex items-center gap-2">
              ID: <span className="font-mono text-text-2">{app.applicationId || 'N/A'}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="p-4 rounded-2xl bg-bg-base/40 border border-white/5">
          <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Calendar size={10} className="text-accent"/> Applied On
          </p>
          <p className="text-sm font-bold text-text-1">{app.updatedAt?.toDate() ? app.updatedAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-bg-base/40 border border-white/5">
          <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <IndianRupee size={10} className="text-success"/> {isScholarship ? 'Expected Grant' : 'Requested Amount'}
          </p>
          <p className="text-sm font-bold text-text-1">
            {isScholarship ? '₹25,000' : `₹${Number(app.bankLoanInfo?.loanAmount || 0).toLocaleString()}`}
          </p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-text-3 uppercase tracking-widest px-1">
          <span>Application Progress</span>
          <span className={app.status === 'Approved' ? 'text-success' : 'text-accent'}>
            {app.status === 'Approved' ? '100%' : app.status === 'Submitted' ? '60%' : '20%'}
          </span>
        </div>
        <div className="h-2 bg-bg-base rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${app.status === 'Approved' ? 'bg-success' : 'bg-gradient-to-r from-accent to-accent-ai'}`}
            style={{ width: app.status === 'Approved' ? '100%' : app.status === 'Submitted' ? '60%' : '20%' }}
          />
        </div>
      </div>

      {app.rejectionReason && (
        <div className="mt-6 p-4 rounded-2xl bg-danger/5 border border-danger/10 flex items-start gap-3 relative z-10">
          <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-danger uppercase tracking-widest mb-1">Rejection Reason</p>
            <p className="text-xs text-text-2 font-medium">{app.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3 relative z-10">
        <button 
          onClick={() => onViewDetails(app)}
          className="flex-1 h-11 rounded-xl bg-bg-elevated border border-border-default text-xs font-bold text-text-1 hover:border-accent/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          View Details <ChevronRight size={14} />
        </button>
        {app.status === 'Draft' && (
          <button className="px-6 h-11 rounded-xl bg-accent text-bg-base text-xs font-bold hover:shadow-lg hover:shadow-accent/20 transition-all">
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

const ApplicationsPage = () => {
  const { user } = useUser();
  const [scholarshipApps, setScholarshipApps] = useState([]);
  const [loanApps, setLoanApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const qSch = query(collection(db, "scholarshipApplications"), where("userId", "==", user.uid));
    const unsubSch = onSnapshot(qSch, (snapshot) => {
      setScholarshipApps(snapshot.docs.map(d => ({ ...d.data(), id: d.id, _type: 'Scholarship' })));
      setLoading(false);
    });

    const qLoan = query(collection(db, "loanApplications"), where("userId", "==", user.uid));
    const unsubLoan = onSnapshot(qLoan, (snapshot) => {
      setLoanApps(snapshot.docs.map(d => ({ ...d.data(), id: d.id, _type: 'Loan' })));
    });

    return () => {
      unsubSch();
      unsubLoan();
    };
  }, [user?.uid]);

  const apps = [
    ...scholarshipApps,
    ...loanApps
  ].filter(a => 
    (a.applicationId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.personalInfo?.scheme || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.loanType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto py-10 animate-fade-in">
      {/* Details Modal overlay */}
      {selectedApp && (
        <DetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}

      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
              <ClipboardList size={24} />
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-text-1">My <span className="text-accent">Applications</span></h1>
          </div>
          <p className="text-text-3 text-sm font-semibold uppercase tracking-widest leading-none">Track and manage your submitted requests</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or Type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-bg-surface border border-border-default rounded-xl text-xs text-text-1 focus:border-accent/40 outline-none transition-all"
            />
          </div>
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-bg-surface border border-white/5 text-text-3 hover:text-text-1">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-text-3 text-[10px] font-bold uppercase tracking-[.2em]">Synchronizing Data...</p>
        </div>
      ) : apps.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {apps.map((app, i) => (
            <ApplicationCard 
              key={i} 
              app={app} 
              type={app._type} 
              onViewDetails={(selected) => setSelectedApp(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center glass border border-white/5 rounded-[3rem] bg-bg-surface/50">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
            <ShieldCheck size={32} className="text-text-3 opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-text-1 mb-2">No Applications Found</h3>
          <p className="text-text-3 text-sm max-w-xs mx-auto mb-10 leading-relaxed font-medium">You haven't started any applications yet. Click below to begin your journey.</p>
          <div className="flex gap-4">
            <button className="px-8 h-12 bg-accent text-bg-base rounded-xl text-sm font-bold hover:shadow-accent-glow transition-all">Apply for Loan</button>
            <button className="px-8 h-12 bg-bg-elevated border border-border-default rounded-xl text-sm font-bold text-text-1 hover:border-white/20 transition-all">Browse Scholarships</button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-20 p-8 rounded-[2.5rem] bg-gradient-to-br from-bg-surface to-bg-base border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-accent-ai/10 flex items-center justify-center text-accent-ai shrink-0">
            <AlertCircle size={32} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-text-1">Having trouble with an application?</h4>
            <p className="text-sm text-text-3 font-medium mt-1">Our AI assistant can help you resolve issues or answer schema-related questions.</p>
          </div>
        </div>
        <button className="h-12 px-10 rounded-xl bg-accent-ai text-white text-sm font-bold hover:shadow-lg hover:shadow-accent-ai/20 transition-all">
          Chat with AI Assistant
        </button>
      </div>
    </div>
  );
};

export default ApplicationsPage;
