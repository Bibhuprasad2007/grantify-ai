import React from 'react';
import { UserCheck, FileText, Download, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const DocVerification = ({ loan }) => {
  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-3 border-2 border-dashed border-white/5 rounded-3xl">
        <UserCheck size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">No Document Selected for Review</p>
        <p className="text-xs mt-2 px-12 text-center">Please select a loan request from the "Loan Requests" tab to verify applicant documents.</p>
      </div>
    );
  }

  const documents = [
    { name: 'Aadhaar Card', status: loan.aadharVerified ? 'Verified' : 'Pending', key: 'aadhar' },
    { name: 'PAN Card', status: loan.panVerified ? 'Verified' : 'Pending', key: 'pan' },
    { name: 'Income Certificate', status: loan.incomeVerified ? 'Verified' : 'Pending', key: 'income' },
    { name: 'University Letter', status: loan.universityVerified ? 'Verified' : 'Pending', key: 'uni' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-white">Document <span className="text-success">Verification</span></h2>
          <p className="text-text-3 text-sm mt-1 uppercase tracking-widest font-bold">Reviewing: {loan.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(doc => (
          <div key={doc.name} className="p-5 glass border border-white/5 rounded-3xl flex justify-between items-center group hover:border-success/20 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-text-3 group-hover:text-success transition-colors">
                  <FileText size={24} />
               </div>
               <div>
                  <p className="text-sm font-bold text-white">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'Verified' ? 'bg-success' : 'bg-warning'}`} />
                     <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest">{doc.status}</p>
                  </div>
               </div>
            </div>
            <div className="flex gap-2 opacity-10 sm:opacity-100 group-hover:opacity-100 transition-opacity">
               <button className="w-9 h-9 bg-bg-base border border-white/5 rounded-xl flex items-center justify-center text-text-3 hover:text-white transition-all"><Download size={16} /></button>
               <button className="w-9 h-9 bg-success/10 border border-success/20 rounded-xl flex items-center justify-center text-success hover:bg-success/20 transition-all"><CheckCircle2 size={16} /></button>
               <button className="w-9 h-9 bg-danger/10 border border-danger/20 rounded-xl flex items-center justify-center text-danger hover:bg-danger/20 transition-all"><XCircle size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocVerification;
