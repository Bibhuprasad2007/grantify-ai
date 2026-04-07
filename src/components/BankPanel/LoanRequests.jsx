import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = {
    Pending: 'bg-warning/10 text-warning border-warning/20',
    Approved: 'bg-success/10 text-success border-success/20',
    Rejected: 'bg-danger/10 text-danger border-danger/20',
  };
  return <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${map[status] || 'bg-white/5 text-text-3 border-white/10'}`}>{status}</span>;
};

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

const LoanRequests = ({ loans, onReviewLoan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All Risks');

  const filteredLoans = loans.filter(l => 
    (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.id.toLowerCase().includes(searchTerm.toLowerCase())) && 
    (filterRisk === 'All Risks' || l.aiRisk === filterRisk)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-heading font-extrabold text-white">Loan <span className="text-success">Requests</span></h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" size={16} />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="App ID, Name..." 
              className="h-10 pl-10 pr-4 bg-bg-base border border-border-default rounded-xl text-xs text-text-1 outline-none w-56" 
            />
          </div>
          <select 
            value={filterRisk} 
            onChange={e => setFilterRisk(e.target.value)} 
            className="h-10 px-3 bg-bg-base border border-border-default rounded-xl text-xs text-text-1 outline-none"
          >
            <option>All Risks</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <div className="glass border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 font-bold uppercase tracking-widest text-[10px] text-text-3">
               {['Application','Applicant','Amount','CIBIL','AI Risk','Status','Action'].map(h => <th key={h} className="px-6 py-4">{h}</th>)}
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {filteredLoans.map(loan => (
              <tr key={loan.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5 font-mono text-xs">{loan.id}</td>
                <td className="px-6 py-5 text-white">{loan.name}</td>
                <td className="px-6 py-5 font-bold">{loan.amount}</td>
                <td className="px-6 py-5 text-success">{loan.cibil}</td>
                <td className="px-6 py-5"><RiskBadge risk={loan.aiRisk} /></td>
                <td className="px-6 py-5"><StatusBadge status={loan.status} /></td>
                <td className="px-6 py-5">
                  <button onClick={() => onReviewLoan(loan)} className="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLoans.length === 0 && (
          <div className="text-center py-12 text-text-3 text-sm">No loan requests found matching your filters.</div>
        )}
      </div>
    </div>
  );
};

export default LoanRequests;
