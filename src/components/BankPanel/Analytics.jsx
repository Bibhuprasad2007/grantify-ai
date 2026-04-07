import React from 'react';
import { BarChart3, TrendingUp, PieChart, Download, Activity } from 'lucide-react';

const Analytics = ({ loans = [] }) => {
  const approvedCount = loans.filter(l => l.status === 'Approved').length;
  const pendingCount = loans.filter(l => l.status === 'Pending').length;
  const rejectedCount = loans.filter(l => l.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-white">Reports & <span className="text-success">Analytics</span></h2>
          <p className="text-text-3 text-xs mt-1 uppercase tracking-widest font-bold">Total Processed: {loans.length}</p>
        </div>
        <button className="px-4 py-2 bg-success text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-success/90 shadow-lg shadow-success/20 transition-all">
           <Download size={16} /> Export Data
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass border border-white/5 rounded-3xl text-text-3 px-6 text-center">
           <BarChart3 size={48} className="mb-4 opacity-20" />
           <p className="text-sm font-bold uppercase tracking-widest opacity-50">No Data Available for Analysis</p>
           <p className="text-xs mt-2">Reports and trends will be generated once applications are submitted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 p-6 glass border border-white/5 rounded-3xl">
              <h3 className="text-sm font-bold text-text-1 mb-6 flex items-center gap-2 uppercase tracking-widest font-mono text-success"><Activity size={18} /> Processing Trends</h3>
              <div className="h-64 flex items-end justify-center gap-4 border-b border-white/10 pb-4 mb-4">
                 {[
                   { h: (approvedCount / loans.length) * 100, label: 'Approved', color: 'success' },
                   { h: (pendingCount / loans.length) * 100, label: 'Pending', color: 'warning' },
                   { h: (rejectedCount / loans.length) * 100, label: 'Rejected', color: 'danger' },
                 ].map((bar, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-2 max-w-[80px]">
                     <div className={`w-full bg-${bar.color}/20 rounded-t-lg transition-all hover:bg-${bar.color}/40`} style={{ height: `${Math.max(bar.h, 5)}%` }} />
                     <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider">{bar.label}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="flex flex-col gap-6">
              {[
                { label: 'Active Requests', value: pendingCount, trend: 'LIVE', icon: Activity },
                { label: 'Approval Rate', value: `${loans.length ? Math.round((approvedCount/loans.length)*100) : 0}%`, trend: 'PORTFOLIO', icon: PieChart },
              ].map(stat => (
                <div key={stat.label} className="p-6 glass border border-white/5 rounded-3xl flex-1 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-success">
                         <stat.icon size={20} />
                      </div>
                      <span className="text-[10px] font-black text-white py-1 px-2 rounded-lg bg-white/5">{stat.trend}</span>
                   </div>
                   <div>
                      <p className="text-2xl font-heading font-black text-white mt-4">{stat.value}</p>
                      <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mt-1">{stat.label}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
