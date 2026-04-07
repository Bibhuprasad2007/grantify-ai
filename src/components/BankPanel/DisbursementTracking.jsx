import React, { useState } from 'react';
import { 
  Search, Eye, Clock, CheckCircle2, Circle, 
  MapPin, User, FileText, ChevronRight,
  TrendingUp, ShieldCheck, Landmark, BadgeDollarSign,
  ArrowLeft, Activity, Box
} from 'lucide-react';

const TrackingStep = ({ label, date, status, icon: Icon, isLast }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  return (
    <div className="flex gap-6 relative group">
      {!isLast && (
        <div className={`absolute left-[19px] top-10 w-[2px] h-[calc(100%-16px)] transition-all duration-700 ${isCompleted ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-white/5'}`} />
      )}
      
      <div className={`
        relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
        ${isCompleted ? 'bg-success border-success text-white shadow-xl shadow-success/20' : ''}
        ${isActive ? 'bg-bg-base border-accent text-accent animate-pulse-ring' : ''}
        ${!isCompleted && !isActive ? 'bg-bg-base border-white/5 text-text-3' : ''}
      `}>
        {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={18} />}
      </div>

      <div className="pb-10">
        <h4 className={`text-sm font-black transition-colors ${isCompleted ? 'text-white' : isActive ? 'text-accent' : 'text-text-3'}`}>{label}</h4>
        <div className="flex items-center gap-2 mt-1">
           <p className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-success' : 'text-text-3'}`}>
             {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending Queue'}
           </p>
           {date && <span className="text-[9px] text-text-3 font-mono opacity-50 px-1.5 py-0.5 border border-white/5 rounded-md italic">{date}</span>}
        </div>
      </div>
    </div>
  );
};

const DisbursementTracking = ({ disbursements = [] }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = disbursements.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedApp) {
    // Generate Steps based on status
    const getStepStatus = (stepIdx) => {
      const statusOrder = ['Draft', 'Submitted', 'Verified', 'Approved', 'Disbursed'];
      const currentIdx = statusOrder.indexOf(selectedApp.status || 'Submitted');
      
      // Map stages to DB status
      if (stepIdx === 0) return 'completed'; // Student Panel
      if (stepIdx === 1) return 'completed'; // System Processing
      if (stepIdx === 2) return currentIdx >= 1 ? 'completed' : 'active'; // Bank Panel Review
      if (stepIdx === 3) return currentIdx >= 2 ? 'completed' : (currentIdx === 1 ? 'active' : 'pending'); // Verification
      if (stepIdx === 4) return currentIdx >= 3 ? 'completed' : (currentIdx === 2 ? 'active' : 'pending'); // Risk
      if (stepIdx === 5) return currentIdx >= 3 ? 'completed' : (currentIdx === 2 ? 'active' : 'pending'); // Final Submission
      if (stepIdx === 6) return currentIdx >= 3 ? 'completed' : 'pending'; // Sanction
      if (stepIdx === 7) return currentIdx >= 4 ? 'completed' : 'pending'; // Disbursement
      return 'pending';
    };

    const steps = [
      { label: 'Student Portal Submission', icon: User },
      { label: 'AI System AI-Audit Processing', icon: Activity },
      { label: 'Bank Panel Initial Review', icon: Landmark },
      { label: 'Document Verification Protocol', icon: FileText },
      { label: 'Risk Assessment Audit', icon: ShieldCheck },
      { label: 'Digital Final Submission', icon: Box },
      { label: 'Loan Sanction Generation', icon: CheckCircle2 },
      { label: 'Final Fund Disbursement', icon: BadgeDollarSign },
    ];

    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-3xl border border-white/5 backdrop-blur-md sticky top-0 z-20">
          <button onClick={() => setSelectedApp(null)} className="flex items-center gap-2 text-text-3 hover:text-white transition-all font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-white/5 rounded-xl">
            <ArrowLeft size={16} /> Back to List
          </button>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs font-black text-white">{selectedApp.name}</p>
                <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Tracking ID: TRK-{selectedApp.id.substring(0, 8).toUpperCase()}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 p-10 glass border border-white/5 rounded-[40px]">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 border-b border-white/5 pb-4">Real-time Lifecycle Tracker</h3>
              <div className="pl-4">
                {steps.map((step, idx) => (
                  <TrackingStep 
                    key={idx}
                    label={step.label}
                    icon={step.icon}
                    status={getStepStatus(idx)}
                    isLast={idx === steps.length - 1}
                    date={getStepStatus(idx) === 'completed' ? '24 Mar 2024' : null}
                  />
                ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="p-8 glass border border-white/5 rounded-[40px]">
                 <h4 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-6">Subject Meta-Data</h4>
                 <div className="space-y-4">
                    <div className="p-4 bg-bg-base/50 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-text-3 font-bold uppercase mb-1">Requested Fund</p>
                        <p className="text-xl font-black text-success">{selectedApp.amount}</p>
                    </div>
                    <div className="p-4 bg-bg-base/50 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-text-3 font-bold uppercase mb-1">College/Inst</p>
                        <p className="text-sm font-bold text-white line-clamp-1">{selectedApp.academicInfo?.collegeName || 'N/A'}</p>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-success/5 border border-success/10 rounded-[40px] text-center">
                 <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto mb-4 border border-success/30">
                    <ShieldCheck size={32} />
                 </div>
                 <h4 className="text-sm font-black text-white mb-2">Authenticated View</h4>
                 <p className="text-[10px] text-text-3 leading-relaxed">This view is end-to-end encrypted and synced with the Central Hub.</p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h2 className="text-3xl font-heading font-black text-white tracking-tight">Active Fund <span className="text-success text-gradient">Tracking</span></h2>
            <p className="text-text-3 text-sm mt-1 uppercase tracking-widest font-black font-mono">End-to-end Pipeline Management</p>
         </div>
         <div className="relative group min-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-success transition-colors" size={18} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Tracker or Name..." 
              className="w-full h-14 pl-12 pr-4 bg-white/[0.02] border border-white/5 rounded-2xl text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:border-success/30 transition-all font-medium"
            />
         </div>
      </div>

      <div className="glass border border-white/5 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-text-3 uppercase tracking-widest">Student Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-3 uppercase tracking-widest">Application No</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-3 uppercase tracking-widest">Tracking ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-3 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-3 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-xl bg-bg-base flex items-center justify-center text-xs font-black border border-white/5 text-success">
                            {(item.name || 'S')[0]}
                         </div>
                         <p className="text-sm font-bold text-text-1">{item.name}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-mono font-bold text-text-3">{item.applicationId || 'APP-' + item.id.substring(0, 6).toUpperCase()}</td>
                    <td className="px-8 py-6 text-xs font-mono font-bold text-success">TRK-{item.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                          item.status === 'Disbursed' ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning'
                       }`}>
                          {item.status || 'In Transit'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex justify-center">
                          <button 
                            onClick={() => setSelectedApp(item)}
                            className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-text-3 hover:text-success hover:border-success/30 transition-all"
                          >
                             <Eye size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="5" className="px-8 py-32 text-center text-text-3 opacity-30 font-bold uppercase tracking-widest italic text-sm">No trace records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisbursementTracking;
