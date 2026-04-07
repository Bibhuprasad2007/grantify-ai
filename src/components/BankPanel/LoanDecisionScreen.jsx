import React from 'react';
import { 
  ChevronRight, Star, CheckCircle2, XCircle, 
  RefreshCw, Send 
} from 'lucide-react';

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

const LoanDecisionScreen = ({ loan, onBack }) => {
  return (
    <div className="space-y-6 animate-fade-in">
       <button onClick={onBack} className="flex items-center gap-2 text-text-3 hover:text-text-1 text-sm font-bold transition-all">
         <ChevronRight size={16} className="rotate-180" /> Back to List
       </button>
       
       <div className="p-8 glass border border-white/5 rounded-3xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
         
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
           <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center text-success font-bold text-2xl">
               {loan.name[0]}
             </div>
             <div>
               <h3 className="text-2xl font-heading font-extrabold text-white">{loan.name}</h3>
               <div className="flex gap-3 mt-1 text-text-3 text-xs">
                 <span>App ID: {loan.id}</span>
                 <span>•</span>
                 <span className="text-success font-bold">District Approved</span>
               </div>
             </div>
           </div>
           <div className="flex gap-3">
              <RiskBadge risk={loan.aiRisk} />
              <div className="px-4 py-2 bg-bg-base/50 border border-white/5 rounded-xl flex items-center gap-2">
                <Star size={14} className="text-warning fill-warning" />
                <span className="text-xs font-bold text-warning">CIBIL: {loan.cibil}</span>
              </div>
           </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="space-y-6">
             <section>
               <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3">Applicant Overview</h4>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   ['Loan Amount', loan.amount],
                   ['Education', 'B.Tech CS'],
                   ['Family Income', '₹4,50,000/yr'],
                   ['District Remark', 'Highly Recommended'],
                 ].map(([l, v], i) => (
                   <div key={i} className="p-4 bg-bg-base/40 rounded-2xl border border-white/5">
                     <p className="text-[10px] text-text-3 font-bold uppercase">{l}</p>
                     <p className="text-sm font-bold text-text-1 mt-1">{v}</p>
                   </div>
                 ))}
               </div>
             </section>

             <section>
               <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3">AI Risk Assessment</h4>
               <div className="p-5 bg-bg-base/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 bg-white/5 rounded-full h-2">
                      <div className={`h-2 rounded-full ${loan.aiRisk === 'Low' ? 'bg-success w-[90%]' : 'bg-warning w-[60%]'}`} />
                    </div>
                    <span className="text-xs font-bold text-text-1">{loan.aiRisk === 'Low' ? 'Safe' : 'Watch'}</span>
                  </div>
                  <p className="text-xs text-text-3 leading-relaxed">
                    AI Prediction: Application shows 94% repayment probability based on high credit score and stable family income. Recommended for immediate approval at standard interest rates.
                  </p>
               </div>
             </section>
           </div>

           <div className="space-y-6">
             <section>
               <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3">Decision Execution</h4>
               <div className="p-6 bg-success/5 border border-success/20 rounded-2xl space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-3 uppercase block mb-1.5 ml-1">Sanctioned Amount</label>
                    <input defaultValue={loan.amount} className="w-full bg-bg-base border border-white/10 h-11 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-success/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-text-3 uppercase block mb-1.5 ml-1">Interest Rate (%)</label>
                      <input defaultValue="8.5" className="w-full bg-bg-base border border-white/10 h-11 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-success/50" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-3 uppercase block mb-1.5 ml-1">Tenure (Years)</label>
                      <input defaultValue="7" className="w-full bg-bg-base border border-white/10 h-11 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-success/50" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 h-12 bg-success text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-success/90 transition-all shadow-lg shadow-success/20 transition-transform hover:scale-[1.02]">
                      <CheckCircle2 size={18} /> Approve & Disburse
                    </button>
                    <button className="w-12 h-12 bg-bg-base text-text-3 hover:text-danger rounded-2xl flex items-center justify-center border border-white/5 transition-all outline-none">
                      <XCircle size={20} />
                    </button>
                  </div>
               </div>
             </section>

             <section>
                <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3">Actions</h4>
                <div className="flex gap-3">
                   <button className="flex-1 h-10 bg-white/5 text-text-1 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2 transition-all">
                     <RefreshCw size={14} /> Request Re-Verification
                   </button>
                   <button className="flex-1 h-10 bg-white/5 text-text-1 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2 transition-all">
                     <Send size={14} /> Clarify with District
                   </button>
                </div>
             </section>
           </div>
         </div>
       </div>
    </div>
  );
};

export default LoanDecisionScreen;
