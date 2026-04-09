import React, { useState, useEffect } from 'react';
import { 
  Plus, Upload, Sparkles, Landmark, GraduationCap, 
  Target, TrendingUp, CheckCircle2, Circle, Clock,
  ArrowUpRight, Bookmark, ShieldCheck,
  ChevronRight, ArrowRight, UserPlus, Info,
  FileEdit, Loader2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { doc, onSnapshot, collection, setDoc } from 'firebase/firestore';

const QuickAction = ({ icon: Icon, label, primary, ai, onClick }) => (
  <button 
    onClick={onClick}
    className={`
    flex items-center gap-2.5 px-5 h-12 rounded-2xl text-sm font-bold transition-all duration-300
    ${primary ? 'bg-accent text-bg-base hover:bg-white hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-0.5' : ''}
    ${ai ? 'bg-gradient-to-r from-accent to-accent-ai text-white hover:shadow-[0_0_20px_rgba(129,140,248,0.4)] hover:-translate-y-0.5' : ''}
    ${!primary && !ai ? 'bg-bg-elevated/40 border border-white/5 text-text-1 hover:bg-bg-elevated hover:border-white/10 hover:-translate-y-0.5 backdrop-blur-md' : ''}
  `}>
    <Icon size={18} className={ai ? 'animate-pulse' : ''} />
    {label}
  </button>
);

const KPICard = ({ title, value, desc, icon: Icon, colorClass, status, progress, delay }) => (
  <div className={`p-6 glass-card rounded-[2rem] relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-500 stagger-up-${delay}`}>
    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
    
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-bg-base border border-border-default shadow-inner`}>
        <Icon size={24} className={colorClass.split(' ')[2] || 'text-accent'} />
      </div>
      {status && (
        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-white/5 border border-white/5 ${status.color}`}>
          {status.text}
        </span>
      )}
    </div>

    <div>
      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 mb-1">{title}</h3>
      <p className="text-2xl font-mono font-bold text-text-1 group-hover:text-accent transition-colors tracking-tight">{value}</p>
      <p className="text-[11px] text-text-3 mt-1.5 font-medium flex items-center gap-1.5">
        {desc}
      </p>
    </div>

    {progress !== undefined && (
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${colorClass}`} style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] font-mono font-bold text-text-2 tracking-tighter">{progress}%</span>
      </div>
    )}
  </div>
);

const ProgressTracker = ({ loanData, scholarshipData }) => {
  const [activeTab, setActiveTab] = useState('loan');
  const activeApp = activeTab === 'loan' ? loanData : scholarshipData;
  const status = activeApp?.status || 'Not Started';
  const type = activeTab === 'loan' ? 'Loan' : 'Scholarship';

  useEffect(() => {
    if (!loanData && scholarshipData) setActiveTab('scholarship');
    if (loanData && !scholarshipData) setActiveTab('loan');
  }, [loanData, scholarshipData]);

  const getStepState = (stepIndex) => {
    if (status === 'Not Started') return 'idle';
    
    // Status Hierarchy: Draft -> Submitted (Pending) -> Verified -> Approved -> Disbursed
    const statusMap = {
      'Draft': 1,
      'Submitted': 1,
      'Pending': 1,
      'Verified': 2,
      'Approved': 3,
      'Disbursed': 4,
      'Rejected': -1
    };

    const currentLevel = statusMap[status] || 0;

    if (status === 'Rejected') return stepIndex === 0 ? 'completed' : 'idle';
    if (stepIndex < currentLevel) return 'completed';
    if (stepIndex === currentLevel) return 'active';
    return 'idle';
  };

  const steps = [
    { label: 'Form Filed', time: status !== 'Not Started' ? 'Completed' : 'Pending', state: getStepState(0), icon: status !== 'Not Started' ? CheckCircle2 : Circle },
    { label: 'KYC/Doc Verify', time: (getStepState(1) === 'completed') ? 'Completed' : (getStepState(1) === 'active') ? 'In Progress' : 'Pending', state: getStepState(1), icon: getStepState(1) === 'completed' ? CheckCircle2 : getStepState(1) === 'active' ? Clock : Circle },
    { label: 'Admin Review', time: (getStepState(2) === 'completed') ? 'Completed' : (getStepState(2) === 'active') ? 'In Progress' : 'Pending', state: getStepState(2), icon: getStepState(2) === 'completed' ? CheckCircle2 : getStepState(2) === 'active' ? ShieldCheck : Circle },
    { label: 'Final Approval', time: (getStepState(3) === 'completed') ? 'Approved' : 'Pending', state: getStepState(3), icon: getStepState(3) === 'completed' ? CheckCircle2 : Circle },
    { label: 'Disbursement', time: status === 'Disbursed' ? 'Done' : 'Pending', state: getStepState(4), icon: Landmark },
  ];

  const activeWidth = status === 'Disbursed' ? '100%' : status === 'Approved' ? '75%' : status === 'Verified' ? '50%' : (status === 'Submitted' || status === 'Pending') ? '25%' : '0%';

  return (
    <div className="p-8 rounded-[2.5rem] glass border border-white/5 mt-10 stagger-up-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40 shadow-accent-glow">
            <TrendingUp size={18} className="text-accent" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-1">Application Journey</h3>
            <p className="text-[11px] text-text-3 font-semibold uppercase tracking-widest">
              Live tracking from backend database
            </p>
          </div>
        </div>

        <div className="flex bg-bg-base/50 p-1 rounded-xl border border-white/5 shadow-inner">
           <button 
             onClick={() => setActiveTab('loan')}
             className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'loan' ? 'bg-accent text-bg-base shadow-lg shadow-accent/20' : 'text-text-3 hover:text-text-1'}`}
           >
             Loan Journey
           </button>
           <button 
             onClick={() => setActiveTab('scholarship')}
             className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeTab === 'scholarship' ? 'bg-accent-ai text-white shadow-lg shadow-accent-ai/20' : 'text-text-3 hover:text-text-1'}`}
           >
             Scholarship Journey
           </button>
        </div>

        <div className={`px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 ${
          status === 'Approved' || status === 'Disbursed' ? 'bg-success/10 border-success/30 text-success' :
          status === 'Rejected' ? 'bg-danger/10 border-danger/30 text-danger' :
          status === 'Not Started' ? 'bg-white/5 border-white/10 text-text-3' :
          'bg-warning/10 border-warning/30 text-warning'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'Approved' ? 'bg-success animate-pulse' : status === 'Rejected' ? 'bg-danger' : 'bg-warning animate-pulse'}`}></span>
          {status === 'Submitted' ? 'Under Review' : status === 'Verified' ? 'Verified' : status}
        </div>
      </div>

      <div className="relative flex justify-between items-start px-4 overflow-x-auto min-w-[600px] pb-4">
        <div className="absolute top-6 left-12 right-12 h-[2.5px] bg-border-default z-0"></div>
        <div className="absolute top-6 left-12 h-[2.5px] bg-accent z-0 transition-all duration-1000 shadow-accent-glow" style={{ width: activeWidth }}></div>

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center group/step min-w-[100px]">
            <div className={`
              w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300
              ${step.state === 'completed' ? 'bg-success border-success text-white shadow-lg shadow-success/20' : ''}
              ${step.state === 'active' ? 'bg-bg-base border-accent text-accent pulse-ring' : ''}
              ${step.state === 'idle' ? 'bg-bg-base border-border-default text-text-3' : ''}
              group-hover/step:scale-110
            `}>
              <step.icon size={20} />
            </div>
            <div className="text-center mt-4">
              <p className={`text-xs font-bold transition-colors ${step.state === 'idle' ? 'text-text-3' : 'text-text-1'}`}>{step.label}</p>
              <p className={`text-[10px] mt-1 font-extrabold uppercase tracking-tight ${step.state === 'completed' ? 'text-success' : step.state === 'active' ? 'text-accent' : 'text-text-3'}`}>{step.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScholarshipCard = ({ sponsor, name, org, amount, deadline, tags, match, aiRecommended, onApply }) => (
  <div className="p-6 rounded-[2rem] glass-card group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full overflow-hidden">
    {aiRecommended && (
      <div className="absolute top-4 right-4 py-1 px-3 rounded-full bg-accent-ai/20 border border-accent-ai/40 flex items-center gap-2 animate-fade-in">
        <Sparkles size={12} className="text-accent-ai" />
        <span className="text-[10px] font-bold text-accent-ai uppercase tracking-wider">AI RECOMMENDED</span>
      </div>
    )}

    <div className="flex gap-4 items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border border-white/5 bg-gradient-to-br ${sponsor.color}`}>
        {sponsor.text}
      </div>
      <div>
        <h4 className="text-sm font-bold text-text-1 group-hover:text-accent transition-colors line-clamp-1">{name}</h4>
        <p className="text-xs text-text-3 font-semibold mt-0.5">{org}</p>
      </div>
    </div>

    <div className="flex-1">
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-mono font-extrabold text-accent">{amount}</span>
        <span className="text-[11px] font-bold text-text-3 uppercase tracking-widest">Award</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, idx) => (
          <span key={idx} className="text-[9px] font-extrabold uppercase tracking-[.1em] px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-text-2 group-hover:text-text-1 group-hover:bg-bg-elevated transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-4 mb-6 p-3 rounded-2xl bg-bg-base/30 border border-white/5">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/5" />
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent" strokeDasharray={113} strokeDashoffset={113 - (113 * match) / 100} strokeLinecap="round" />
        </svg>
        <span className="absolute text-[10px] font-mono font-extrabold text-text-1 tracking-tighter">{match}%</span>
      </div>
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 leading-none mb-1">Candidate Match</p>
        <div className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold rounded-md uppercase">High Fit</div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button 
        onClick={onApply}
        className="flex-1 h-11 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-bold hover:bg-accent hover:text-bg-base transition-all duration-300 flex items-center justify-center group/btn gap-2"
      >
        Apply Now <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
      <button className="w-11 h-11 rounded-xl glass border border-white/5 text-text-3 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center">
        <Bookmark size={18} />
      </button>
    </div>
  </div>
);

const LoanCard = ({ title, interestRate, maxAmount, tenure, approvalConfidence, aiTag, delay }) => {
  const initials = title ? title.substring(0, 2).toUpperCase() : 'L';
  const popular = approvalConfidence > 90;
  
  return (
    <div className={`p-8 rounded-[2.5rem] glass relative group overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 stagger-up-${delay}`}>
      {popular && (
        <div className="absolute top-0 right-10 py-1.5 px-6 bg-gradient-to-r from-accent to-accent-ai text-[10px] font-extrabold text-bg-base rounded-b-xl uppercase tracking-widest shadow-xl shadow-accent/20 z-10">
          Most Popular
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-extrabold bg-bg-base border border-border-default text-accent`}>
            {initials}
          </div>
          <div>
            <h4 className="text-base font-bold text-text-1 group-hover:text-accent transition-colors">{title}</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-bold text-success uppercase tracking-widest">{aiTag}</span>
              <span className="text-[10px] font-bold text-text-3 ml-2 tracking-tighter">({approvalConfidence}% Match)</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-text-3 uppercase tracking-[.2em] mb-1">Fixed Rate</p>
          <span className="text-3xl font-mono font-extrabold text-white">{interestRate}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 border-y border-border-default/50 py-6">
        <div>
          <p className="text-[10px] font-extrabold text-text-3 uppercase tracking-widest mb-1.5">Max Amount</p>
          <p className="text-xl font-bold text-text-1">{maxAmount}</p>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-text-3 uppercase tracking-widest mb-1.5">Tenure</p>
          <p className="text-xl font-bold text-text-1">{tenure}</p>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {['No hidden processing fees', 'Instant disbursement in 24hrs', 'Flexible grace period of 6 months'].map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-xs font-semibold text-text-2 group-hover:text-text-1 transition-colors">
            <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={12} className="text-success" />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex gap-4 h-12">
        <button className="flex-1 rounded-xl bg-bg-base border border-border-default text-sm font-bold text-text-1 hover:bg-bg-elevated transition-colors">
          Compare Plans
        </button>
        <button className="flex-1 rounded-xl bg-accent text-bg-base text-sm font-bold hover:bg-white shadow-xl hover:shadow-accent-glow transition-all">
          Claim Offer
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ onApplyLoan, onApplyScholarship }) => {
  const { user } = useUser();
  const [loanData, setLoanData] = useState(null);
  const [scholarshipData, setScholarshipData] = useState(null);
  const [loanOffers, setLoanOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore listeners
  useEffect(() => {
    if (!user?.uid) return;

    const unsubLoan = onSnapshot(doc(db, "loanApplications", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setLoanData(docSnap.data());
      } else {
        setLoanData(null);
      }
    });

    const unsubScholarship = onSnapshot(doc(db, "scholarshipApplications", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setScholarshipData(docSnap.data());
      } else {
        setScholarshipData(null);
      }
    });

    // Listen to all loans automatically
    const unsubOffers = onSnapshot(collection(db, "loans"), (querySnapshot) => {
      const offersList = [];
      querySnapshot.forEach((doc) => {
        offersList.push({ id: doc.id, ...doc.data() });
      });
      setLoanOffers(offersList);
    });

    setLoading(false);

    return () => {
      unsubLoan();
      unsubScholarship();
      unsubOffers();
    };
  }, [user?.uid]);

  const totalApps = (loanData ? 1 : 0) + (scholarshipData ? 1 : 0);
  const submittedApps = [loanData, scholarshipData].filter(d => d?.status === 'Submitted').length;
  const draftApps = [loanData, scholarshipData].filter(d => d?.status === 'Draft').length;

  const displayName = user?.displayName?.split(' ')[0] || 'User';

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      {/* Header Section */}
      <section className="stagger-up-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-text-1 tracking-tight leading-tight mb-2">
              Welcome back, <span className="text-gradient">{displayName}!</span> 👋
            </h1>
            <p className="text-text-2 text-sm font-semibold flex items-center gap-2">
              {totalApps > 0 
                ? <>You have {totalApps} application{totalApps > 1 ? 's' : ''} • {submittedApps} submitted • {draftApps} draft</>
                : 'Start your journey by applying for a loan or scholarship below.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard 
          title="Active Loan App" 
          value={loanData?.bankLoanInfo?.loanAmount ? `₹${Number(loanData.bankLoanInfo.loanAmount).toLocaleString()}` : 'N/A'}
          desc={loanData ? `Status: ${loanData.status}` : 'No application yet'}
          icon={Landmark}
          colorClass="from-accent to-accent-ai text-accent"
          status={loanData ? { text: loanData.status === 'Submitted' ? 'SUBMITTED' : 'DRAFT', color: loanData.status === 'Submitted' ? 'text-success' : 'text-warning' } : null}
          delay={1}
        />
        <KPICard 
          title="Scholarship App" 
          value={scholarshipData ? '1 Active' : 'None'}
          desc={scholarshipData ? `Status: ${scholarshipData.status}` : 'Apply for scholarships'}
          icon={GraduationCap}
          colorClass="from-accent-ai to-purple-500 text-accent-ai"
          status={scholarshipData ? { text: scholarshipData.status === 'Submitted' ? 'SUBMITTED' : 'DRAFT', color: scholarshipData.status === 'Submitted' ? 'text-success' : 'text-warning' } : null}
          delay={2}
        />
        <KPICard 
          title="Total Applications" 
          value={totalApps.toString()} 
          desc={`${submittedApps} submitted, ${draftApps} draft`}
          icon={Target}
          colorClass="from-success to-emerald-500 text-success"
          progress={totalApps > 0 ? Math.round((submittedApps / totalApps) * 100) : 0}
          delay={3}
        />
        <KPICard 
          title="Documents Status" 
          value={totalApps > 0 ? 'Active' : 'Pending'}
          desc={totalApps > 0 ? 'Files uploaded to storage' : 'No documents yet'}
          icon={ShieldCheck}
          colorClass="from-blue-400 to-indigo-500 text-blue-400"
          delay={4}
        />
      </section>

      {/* Active Applications */}
      {(loanData || scholarshipData) && (
        <section className="mt-10 stagger-up-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-success rounded-full"></div>
            <h3 className="text-xl font-heading font-bold text-text-1">Your Applications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loanData && (
              <div className="p-6 glass-card rounded-3xl border border-white/5 flex items-center justify-between hover:border-accent/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${loanData.status === 'Submitted' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {loanData.status === 'Submitted' ? <CheckCircle2 size={24} /> : <FileEdit size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-1 group-hover:text-accent transition-colors">Loan Application</h4>
                    <p className="text-[10px] text-text-3 font-semibold uppercase tracking-widest mt-0.5">
                      ID: {loanData.applicationId} • Amt: ₹{Number(loanData.bankLoanInfo?.loanAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${loanData.status === 'Submitted' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {loanData.status}
                  </span>
                  {loanData.status === 'Draft' && (
                    <button onClick={onApplyLoan} className="text-[10px] font-bold text-accent hover:underline">Continue →</button>
                  )}
                </div>
              </div>
            )}
            {scholarshipData && (
              <div className="p-6 glass-card rounded-3xl border border-white/5 flex items-center justify-between hover:border-accent-ai/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${scholarshipData.status === 'Submitted' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {scholarshipData.status === 'Submitted' ? <CheckCircle2 size={24} /> : <FileEdit size={24} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-1 group-hover:text-accent-ai transition-colors">Scholarship Application</h4>
                    <p className="text-[10px] text-text-3 font-semibold uppercase tracking-widest mt-0.5">
                      ID: {scholarshipData.applicationId} • {scholarshipData.personalInfo?.name || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${scholarshipData.status === 'Submitted' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {scholarshipData.status}
                  </span>
                  {scholarshipData.status === 'Draft' && (
                    <button onClick={onApplyScholarship} className="text-[10px] font-bold text-accent-ai hover:underline">Continue →</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Progress Journey */}
      <ProgressTracker loanData={loanData} scholarshipData={scholarshipData} />

      {/* Scholarship Section */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full"></div>
            <h3 className="text-xl font-heading font-bold text-text-1">AI Recommended Scholarships</h3>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-text-3 hover:text-accent transition-colors">
            View Market <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <ScholarshipCard 
            sponsor={{ text: 'KL', color: 'from-amber-400 to-orange-600' }}
            name="Knight-Hennessy Scholarship"
            org="Stanford University"
            amount="$85,000"
            deadline="28 Days Left"
            tags={['Global', 'Graduate', 'Full-Funded']}
            match={98}
            aiRecommended
            onApply={onApplyScholarship}
          />
          <ScholarshipCard 
            sponsor={{ text: 'G+', color: 'from-blue-500 to-indigo-600' }}
            name="Future Innovators Grant"
            org="Google Edu Foundation"
            amount="$12,500"
            deadline="15 Days Left"
            tags={['Tech', 'Undergraduate', 'Merit-Based']}
            match={85}
            aiRecommended
            onApply={onApplyScholarship}
          />
          <ScholarshipCard 
            sponsor={{ text: 'FS', color: 'from-emerald-400 to-teal-700' }}
            name="Global Sustainability Award"
            org="Future Society"
            amount="$25,000"
            deadline="42 Days Left"
            tags={['ESG', 'Research', 'Ph.D']}
            match={72}
            onApply={onApplyScholarship}
          />
        </div>
      </section>

      {/* Loan Offers Section */}
      <section className="mt-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent-ai rounded-full"></div>
            <h3 className="text-xl font-heading font-bold text-text-1">Curated Loan Offers</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-bg-elevated/40 text-[10px] font-bold text-text-3 uppercase tracking-widest">
            <Info size={12} className="text-accent" /> Rates fixed for 90 days
            {loanOffers.length === 0 && (
              <button 
                onClick={async () => {
                  await setDoc(doc(db, "loans", "LOAN-OFFER-001"), {
                    // Backward compatibility for Android app
                    title: 'SBI Scholar Loan Scheme',
                    interestRate: "8.55% - 10.75%",
                    interestRateValue: 8.55,
                    maxAmount: "₹20,00,000",
                    maxAmountValue: 2000000,
                    tenure: "5 - 15 years",
                    approvalConfidence: 96,
                    aiTag: "Best for Edu",
                    // New comprehensive fields
                    loanId: "LOAN-OFFER-001",
                    bankName: "State Bank of India",
                    loanType: "Education Loan",
                    loanName: "SBI Scholar Loan Scheme",
                    maxLoanAmount: 2000000,
                    minLoanAmount: 50000,
                    processingFee: "0 - 1%",
                    loanTenure: "5 - 15 years",
                    moratoriumPeriod: "Course Duration + 6 months",
                    features: ["No collateral up to ₹7.5 Lakhs", "1% concession for female students", "Quick approval online"],
                    eligibility: {
                      nationality: "Indian",
                      age: "18-35 years",
                      academicRequirement: "Secured admission to a recognized institute",
                      admission: "Entrance exam or merit-based"
                    },
                    requiredDocuments: ["Aadhar/PAN", "Admission Letter", "Mark sheets", "Income proof of co-borrower"],
                    repaymentDetails: {
                      emiStart: "After moratorium period ends",
                      prepaymentCharges: "Nil",
                      emiExample: "₹20,500/month for ₹20L at 8.85% for 12 years"
                    },
                    status: "Available",
                    rating: 4.5,
                    applyLink: "/apply-loan/sbi",
                    createdAt: new Date().toISOString()
                  });
                }}
                className="ml-2 text-accent underline cursor-pointer"
              >
                Seed Default Offers
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loanOffers.map((offer, idx) => (
            <LoanCard key={offer.id} {...offer} delay={idx + 1} />
          ))}
        </div>
      </section>

      {/* Quick Stats Footer */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 p-8 rounded-[2.5rem] bg-bg-elevated/20 border border-border-default stagger-up-4">
        {[
          { label: 'Total Applications', value: totalApps.toString(), sub: 'Loan + Scholarship' },
          { label: 'Submitted', value: submittedApps.toString(), sub: 'Under Review' },
          { label: 'Drafts', value: draftApps.toString(), sub: 'Continue anytime' },
          { label: 'Account', value: displayName, sub: user?.email || '' }
        ].map((stat, i) => (
          <div key={i} className="px-6 py-2 border-r last:border-0 border-border-default">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-text-1 group-hover:text-accent transition-colors">{stat.value}</p>
            <p className="text-[10px] font-semibold text-text-3 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
