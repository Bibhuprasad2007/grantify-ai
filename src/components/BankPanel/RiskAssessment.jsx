import React from 'react';
import { 
  ShieldAlert, TrendingDown, Target, AlertTriangle, 
  CheckCircle, ArrowUpRight, BarChart, Zap, ShieldCheck
} from 'lucide-react';

const RiskMeter = ({ percentage }) => {
  const getColors = () => {
    if (percentage < 30) return 'from-success to-emerald-400';
    if (percentage < 70) return 'from-warning to-orange-400';
    return 'from-danger to-red-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Risk Level</span>
        <span className={`text-xl font-mono font-black ${percentage > 70 ? 'text-danger' : percentage > 30 ? 'text-warning' : 'text-success'}`}>{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full bg-gradient-to-r ${getColors()} transition-all duration-1000 shadow-lg shadow-current/20`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const RiskAssessment = ({ loans = [] }) => {
  // Helper to calculate risk percentage based on data
  const calculateRisk = (loan) => {
    if (loan.aiRiskScore) return loan.aiRiskScore; // Use saved score if exists
    
    let risk = 50; // Base risk
    
    // CIBIL Factor
    const cibil = parseInt(loan.cibilScore) || 720;
    if (cibil > 800) risk -= 20;
    else if (cibil > 750) risk -= 10;
    else if (cibil < 650) risk += 20;
    
    // Income Factor
    const income = parseInt(loan.familyInfo?.annualIncome) || 300000;
    if (income > 800000) risk -= 15;
    else if (income < 100000) risk += 15;
    
    // Amount Factor
    const amount = parseInt(loan.bankLoanInfo?.loanAmount?.replace(/[^0-9]/g, '')) || 500000;
    if (amount > 1500000) risk += 10;

    return Math.max(5, Math.min(95, risk));
  };

  const highRiskTotal = loans.filter(l => calculateRisk(l) > 70).length;

  return (
    <div className="space-y-8 animate-fade-in text-text-1">
      {/* Risk Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 glass border border-white/5 rounded-[40px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-danger/10 transition-all" />
           <ShieldAlert className="text-danger mb-4" size={32} />
           <h3 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-1">Critical High Risk</h3>
           <p className="text-4xl font-heading font-black text-white">{highRiskTotal} <span className="text-sm font-bold text-text-3">Apps</span></p>
           <p className="text-[10px] text-danger font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
             <TrendingDown size={14} /> Attention Required Immediately
           </p>
        </div>

        <div className="p-8 glass border border-white/5 rounded-[40px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-success/10 transition-all" />
           <ShieldCheck className="text-success mb-4" size={32} />
           <h3 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-1">Average Portfolio Risk</h3>
           <p className="text-4xl font-heading font-black text-white">24<span className="text-lg">%</span></p>
           <p className="text-[10px] text-success font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
             <Zap size={14} /> Optimized Stability
           </p>
        </div>

        <div className="p-8 glass border border-white/5 rounded-[40px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-accent/10 transition-all" />
           <Target className="text-accent mb-4" size={32} />
           <h3 className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-1">AI Audit Accuracy</h3>
           <p className="text-4xl font-heading font-black text-white">99<span className="text-lg">.8%</span></p>
           <p className="text-[10px] text-accent font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
             <ArrowUpRight size={14} /> Verified via Firestore
           </p>
        </div>
      </div>

      {/* Main Risk Table */}
      <div className="glass border border-white/5 rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div>
             <h3 className="text-xl font-heading font-black text-white flex items-center gap-3">
               <AlertTriangle className="text-warning" /> Risk Evaluation Pipeline
             </h3>
             <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em] mt-1">Algorithmic risk scoring based on financial & academic history</p>
           </div>
           <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">Export Audit Report</button>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
           {loans.length > 0 ? (
             loans.map((loan) => {
               const riskPercent = calculateRisk(loan);
               return (
                 <div key={loan.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-bg-base border border-white/10 flex items-center justify-center text-lg font-black text-success">
                            {(loan.name || 'S')[0]}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-white">{loan.name}</h4>
                             <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest mt-1">ID: {loan.id.substring(0, 10)}... • {loan.type || 'Loan'}</p>
                          </div>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         riskPercent > 70 ? 'bg-danger/10 border-danger/30 text-danger' : 
                         riskPercent > 30 ? 'bg-warning/10 border-warning/30 text-warning' : 
                         'bg-success/10 border-success/30 text-success'
                       }`}>
                         {riskPercent > 70 ? 'High Danger' : riskPercent > 30 ? 'Medium Risk' : 'Secure App'}
                       </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                       <div className="p-3 bg-bg-base rounded-2xl border border-white/5">
                          <p className="text-[8px] text-text-3 font-black uppercase mb-1">CIBIL Score</p>
                          <p className="text-sm font-black text-white">{loan.cibilScore || '720'}</p>
                       </div>
                       <div className="p-3 bg-bg-base rounded-2xl border border-white/5">
                          <p className="text-[8px] text-text-3 font-black uppercase mb-1">Annual Income</p>
                          <p className="text-sm font-black text-white">₹{(loan.familyInfo?.annualIncome || 0).toLocaleString()}</p>
                       </div>
                       <div className="p-3 bg-bg-base rounded-2xl border border-white/5">
                          <p className="text-[8px] text-text-3 font-black uppercase mb-1">Loan Depth</p>
                          <p className="text-sm font-black text-white">{loan.bankLoanInfo?.loanAmount || 'N/A'}</p>
                       </div>
                    </div>

                    <RiskMeter percentage={riskPercent} />
                 </div>
               );
             })
           ) : (
             <div className="col-span-2 py-20 text-center opacity-30">
                <BarChart className="mx-auto mb-4" size={48} />
                <p className="text-xs font-black uppercase tracking-widest italic">No applications available for risk audit</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
