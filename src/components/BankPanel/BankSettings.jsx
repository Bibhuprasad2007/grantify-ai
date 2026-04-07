import React from 'react';
import { PieChart, Users } from 'lucide-react';

const BankSettings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
       <h2 className="text-2xl font-heading font-extrabold text-white">Bank <span className="text-success">Settings</span></h2>
       <div className="p-8 glass border border-white/5 rounded-3xl space-y-8">
          <div>
            <h4 className="text-sm font-bold text-text-1 mb-4 flex items-center gap-2"><PieChart size={18} className="text-success" /> Lending Policies</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {['Min CIBIL Score', 'Base Interest Rate', 'Max Tenure', 'Risk Margin'].map(l => (
                 <div key={l} className="p-4 bg-bg-base/50 rounded-2xl border border-white/5">
                   <p className="text-[10px] text-text-3 font-bold uppercase mb-2">{l}</p>
                   <input 
                     defaultValue={l.includes('CIBIL') ? '600' : l.includes('Rate') ? '8.5%' : '15 yrs'} 
                     className="bg-transparent text-sm font-bold text-white outline-none w-full focus:text-success transition-colors" 
                   />
                 </div>
               ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-1 mb-4 flex items-center gap-2"><Users size={18} className="text-success" /> Staff Management</h4>
            <div className="space-y-2">
               {['Officer Amit (Loan Manager)', 'Officer Priya (Verification)'].map(s => (
                 <div key={s} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success font-bold text-[10px]">
                       {s[0]}
                     </div>
                     <span className="text-xs font-bold text-text-1">{s}</span>
                   </div>
                   <button className="text-[10px] font-bold text-text-3 hover:text-white uppercase tracking-wider transition-colors">Manage</button>
                 </div>
               ))}
            </div>
          </div>
       </div>
       <div className="flex justify-end">
          <button className="h-12 px-8 bg-success text-white font-bold rounded-2xl shadow-lg shadow-success/20 hover:bg-success/90 transition-all">
            Save All Configurations
          </button>
       </div>
    </div>
  );
};

export default BankSettings;
