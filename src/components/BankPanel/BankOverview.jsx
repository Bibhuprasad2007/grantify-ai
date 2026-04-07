import React from 'react';
import { 
  FileText, Clock, CheckCircle2, Wallet, 
  TrendingUp, TrendingDown, AlertCircle 
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="p-5 glass border border-white/5 rounded-2xl">
    <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} mb-4`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl font-heading font-extrabold text-white">{value}</p>
    <p className="text-[11px] font-bold text-text-3 uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const RiskBadge = ({ risk }) => {
  const map = {
    Low: 'bg-success/10 text-success border-success/20',
    Medium: 'bg-warning/10 text-warning border-warning/20',
    High: 'bg-danger/10 text-danger border-danger/20',
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${map[risk]}`}>
      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${risk === 'Low' ? 'bg-success' : risk === 'Medium' ? 'bg-warning' : 'bg-danger'}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{risk} Risk</span>
    </div>
  );
};

const BankOverview = ({ stats, highRiskLoans, onReviewLoan }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-white">Bank <span className="text-success">Overview</span></h2>
          <p className="text-text-3 text-sm mt-1">Real-time financial performance and risk monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={stats.requests} icon={FileText} color="accent" />
        <StatCard label="Pending Approval" value={stats.pending} icon={Clock} color="warning" />
        <StatCard label="Total Approved" value={stats.approved} icon={CheckCircle2} color="success" />
        <StatCard label="Disbursed" value={stats.disbursed} icon={Wallet} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 glass border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text-1">Disbursement Trends</h3>
            <div className="flex gap-2">
              <span className="text-[10px] text-text-3 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success" /> Approved</span>
              <span className="text-[10px] text-text-3 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent" /> Requested</span>
            </div>
          </div>
          <div className="h-48 flex items-end gap-3 px-4">
             {[30, 45, 25, 60, 80, 55, 70, 40, 90, 65, 50, 85].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹{h}L</div>
                 <div className="w-full bg-success/20 rounded-t-lg transition-all group-hover:bg-success/40" style={{ height: `${h}%` }} />
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m} className="text-[9px] text-text-3 font-bold uppercase">{m}</span>)}
          </div>
        </div>

        <div className="p-6 glass border border-white/5 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-text-1 mb-4 flex items-center gap-2">
             <AlertCircle size={16} className="text-danger" /> High Risk Alert
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {highRiskLoans.map(l => (
               <div key={l.id} className="p-3 rounded-xl bg-danger/5 border border-danger/10">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-xs font-bold text-text-1">{l.name}</p>
                     <p className="text-[10px] text-text-3 font-mono">{l.id}</p>
                   </div>
                   <RiskBadge risk={l.aiRisk} />
                 </div>
                 <button onClick={() => onReviewLoan(l)} className="w-full mt-3 py-1.5 bg-danger/10 text-danger text-[10px] font-bold rounded-lg hover:bg-danger/20 transition-all">Review Now</button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankOverview;
