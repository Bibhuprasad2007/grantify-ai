import React from 'react';
import { ShieldCheck, Target, Zap, Activity } from 'lucide-react';

const RiskAssessment = ({ loans = [] }) => {
  const highRiskCount = loans.filter(l => l.aiRisk === 'High').length;
  const lowRiskCount = loans.filter(l => l.aiRisk === 'Low').length;
  const portfolioHealth = loans.length ? Math.round((lowRiskCount / loans.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Risk <span className="text-success">Assessment</span></h2>
      
      {loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass border border-white/5 rounded-3xl text-text-3 px-6 text-center">
           <ShieldCheck size={48} className="mb-4 opacity-20" />
           <p className="text-sm font-bold uppercase tracking-widest opacity-50">Awaiting Submissions for Risk Profiling</p>
           <p className="text-xs mt-2">AI-powered risk modelling will begin once initial applications are received.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 glass border border-white/5 rounded-3xl md:col-span-2">
            <h3 className="text-sm font-bold text-text-1 mb-6 flex items-center gap-2 font-mono uppercase tracking-widest text-success"><Activity size={18} /> Live Risk Modelling</h3>
            <div className="space-y-8">
               {[
                 { label: 'Low Risk Portfolio', value: portfolioHealth, color: 'success' },
                 { label: 'High Risk Exposure', value: loans.length ? Math.round((highRiskCount / loans.length) * 100) : 0, color: 'danger' },
                 { label: 'Data Connectivity', value: 100, color: 'accent' },
               ].map(item => (
                 <div key={item.label}>
                   <div className="flex justify-between mb-2">
                     <span className="text-xs font-bold text-text-3 uppercase tracking-wider">{item.label}</span>
                     <span className="text-xs font-bold text-white">{item.value}%</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                     <div className={`h-full bg-${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }} />
                   </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="p-6 glass border border-white/5 rounded-3xl bg-success/5 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full border-4 border-success flex items-center justify-center mb-4">
               <span className="text-2xl font-black text-white">{portfolioHealth > 80 ? 'A+' : portfolioHealth > 50 ? 'B' : '...'}</span>
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Live Portfolio Rating</h4>
            <p className="text-[10px] text-text-3 mt-2 leading-relaxed">Based on {loans.length} active application profiles in the current cycle.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
