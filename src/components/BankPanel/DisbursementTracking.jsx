import React from 'react';
import { Wallet, FileDown } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = {
    Completed: 'bg-success/10 text-success border-success/20',
    Processing: 'bg-accent/10 text-accent border-accent/20',
  };
  return <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${map[status] || 'bg-white/5 text-text-3 border-white/10'}`}>{status}</span>;
};

const DisbursementTracking = ({ disbursements }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-heading font-extrabold text-white">Disbursement <span className="text-success">Tracking</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disbursements.map((d, i) => (
          <div key={i} className="p-6 glass border border-white/5 rounded-3xl group hover:border-success/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/5 flex items-center justify-center text-success">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{d.name}</p>
                  <p className="text-[10px] text-text-3 font-bold uppercase">{d.method} • {d.date}</p>
                </div>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[10px] text-text-3 font-bold uppercase">Amount</p>
                  <p className="text-lg font-bold text-success">{d.amount}</p>
               </div>
               <button className="px-4 py-2 bg-white/5 text-text-1 text-[10px] font-bold rounded-xl border border-white/10 hover:bg-white/10 flex items-center gap-2 transition-all">
                 <FileDown size={14} /> Receipt
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisbursementTracking;
