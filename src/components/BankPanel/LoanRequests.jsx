import React, { useState } from 'react';
import { 
  Search, Eye, Filter, ArrowUpDown, 
  Calendar, CheckCircle2, Clock, AlertCircle,
  FileText, Activity, CheckCircle, XCircle
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="p-6 glass border border-white/5 rounded-[32px] flex items-center gap-4 group hover:border-white/10 transition-all">
    <div className={`w-12 h-12 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-text-3 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className={`text-2xl font-black font-heading ${color === 'white' ? 'text-white' : `text-${color}`}`}>{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'bg-warning/10 text-warning border-warning/20',
    Approved: 'bg-success/10 text-success border-success/20',
    Rejected: 'bg-danger/10 text-danger border-danger/20',
  };
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${map[status] || 'bg-white/5 text-text-3 border-white/10'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'Approved' ? 'bg-success' : status === 'Pending' ? 'bg-warning' : 'bg-danger'}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
    </div>
  );
};

const RiskBadge = ({ risk }) => {
  const map = {
    Low: 'bg-success/10 text-success border-success/20',
    Medium: 'bg-warning/10 text-warning border-warning/20',
    High: 'bg-danger/10 text-danger border-danger/20',
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${map[risk]}`}>
      <span className="text-[9px] font-black uppercase tracking-widest">{risk} Risk</span>
    </div>
  );
};

const LoanRequests = ({ loans = [], stats = {}, onReviewLoan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');

  const filteredLoans = loans.filter(l => {
    const matchesSearch = (l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.id?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
    const matchesRisk = filterRisk === 'All' || l.aiRisk === filterRisk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 🔹 1. Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Requests" value={stats.requests || 0} icon={FileText} color="white" />
        <StatCard label="Pending Requests" value={stats.pending || 0} icon={Clock} color="warning" />
        <StatCard label="Approved Loans" value={stats.approved || 0} icon={CheckCircle} color="success" />
        <StatCard label="Rejected Apps" value={stats.rejected || 0} icon={XCircle} color="danger" />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pt-4">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-white">Application <span className="text-success">Pipeline</span></h2>
          <p className="text-text-3 text-sm mt-1 uppercase tracking-widest font-bold font-mono">Real-time Management Table</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search by ID or Student Name..." 
              className="w-full h-12 pl-12 pr-4 bg-bg-surface/50 border border-white/5 rounded-2xl text-sm text-text-1 placeholder:text-text-3/50 outline-none focus:border-success/30 transition-all font-medium" 
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-12 px-4 bg-bg-surface/50 border border-white/5 rounded-2xl text-[11px] font-bold text-text-3 uppercase tracking-wider outline-none cursor-pointer hover:border-white/10 transition-all">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="h-12 px-4 bg-bg-surface/50 border border-white/5 rounded-2xl text-[11px] font-bold text-text-3 uppercase tracking-wider outline-none cursor-pointer hover:border-white/10 transition-all">
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
            
            <button className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-text-3 hover:text-white transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="glass border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Application ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Student Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Type</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">CIBIL/Risk</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Current Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-text-3 uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLoans.length > 0 ? (
                filteredLoans.map(loan => (
                  <tr key={loan.id} className="group hover:bg-white/[0.03] transition-colors cursor-default">
                    <td className="px-6 py-6 font-mono text-xs font-bold text-text-2 group-hover:text-success transition-all">{loan.id}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-bg-base flex items-center justify-center text-xs font-bold border border-white/5 text-text-2">
                          {(loan.name || 'S')[0]}
                        </div>
                        <p className="text-sm font-bold text-text-1 group-hover:text-white transition-colors">{loan.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-black text-white">{loan.amount}</td>
                    <td className="px-6 py-6">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                        loan.type === 'Loan' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      }`}>
                        {loan.type}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-white">Score: {loan.cibil || 'N/A'}</span>
                        <RiskBadge risk={loan.aiRisk || 'Low'} />
                      </div>
                    </td>
                    <td className="px-6 py-6 text-success font-bold text-[10px] uppercase tracking-wider">
                       <div className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Verified</div>
                    </td>
                    <td className="px-6 py-6"><StatusBadge status={loan.status || 'Pending'} /></td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        <button onClick={() => onReviewLoan(loan)} className="px-4 py-2 bg-success/10 text-success text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-success hover:text-white transition-all">Verify</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-32 text-center text-text-3 opacity-30 font-bold uppercase tracking-widest italic text-sm">No applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanRequests;
