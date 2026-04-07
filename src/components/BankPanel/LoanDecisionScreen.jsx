import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle, XCircle, Shield, FileText, 
  TrendingUp, Download, AlertTriangle, User, Landmark, 
  MapPin, GraduationCap, Briefcase, Activity
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const LoanDecisionScreen = ({ loan, onBack }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');

  if (!loan) return null;

  const handleDecision = async (newStatus) => {
    setIsUpdating(true);
    try {
      const collectionName = loan.collection || 'loanApplications';
      const loanRef = doc(db, collectionName, loan.id);
      await updateDoc(loanRef, {
        status: newStatus,
        bankNote: decisionNote,
        decisionAt: serverTimestamp(),
        lastUpdatedBy: 'Bank Officer (UCO-756181)'
      });
      alert(`Loan application successfully ${newStatus}!`);
      onBack();
    } catch (error) {
      console.error("Error updating loan:", error);
      alert("Failed to update loan status. Please check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-text-1">
      {/* Header Actions */}
      <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-3xl border border-white/5 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center gap-2 text-text-3 hover:text-white transition-all font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-white/5 rounded-xl">
          <ArrowLeft size={16} /> Back to Pipeline
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/5 border border-success/20 rounded-full">
            <Shield size={14} className="text-success" />
            <span className="text-[10px] font-black text-success uppercase">Secured by AI-Audit</span>
          </div>
          <button className="p-2.5 text-text-3 hover:text-white bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
             <Download size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Student Profile & Risk Summary */}
        <div className="lg:col-span-2 space-y-6 text-nowrap">
          <div className="p-8 glass border border-white/5 rounded-[40px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 blur-[100px] -mr-32 -mt-32" />
            
            <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
               <div className="w-24 h-24 rounded-3xl bg-bg-base border-2 border-white/5 flex items-center justify-center text-3xl font-black text-success shadow-2xl">
                 {loan.name?.[0] || 'S'}
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-heading font-black text-white">{loan.name}</h2>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-text-3 border border-white/10 uppercase tracking-widest">ID: {loan.id}</span>
                 </div>
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium text-text-3">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-success" /> {loan.district || 'Bhadrak'}, Odisha</span>
                    <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-success" /> {loan.course || 'B.Tech CS'}</span>
                    <span className="flex items-center gap-1.5"><Activity size={14} className="text-success" /> Applied: 24 Mar</span>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
               {[
                 { label: 'Requested Amount', value: loan.amount, color: 'text-white' },
                 { label: 'CIBIL Score', value: loan.cibil || 742, color: 'text-success' },
                 { label: 'AI Risk Level', value: loan.aiRisk || 'Low Risk', color: loan.aiRisk === 'High' ? 'text-danger' : 'text-success' },
               ].map(stat => (
                 <div key={stat.label} className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl group-hover:bg-white/[0.05] transition-all">
                    <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className={`text-2xl font-black font-heading ${stat.color}`}>{stat.value}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-8 glass border border-white/5 rounded-[40px]">
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
               <Shield size={20} className="text-success" /> District Official Audit
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <p className="text-xs font-bold text-text-3 uppercase tracking-widest">Verification Status</p>
                   <div className="space-y-3">
                      {[
                        { label: 'Income Certificate', status: 'Auto-Verified' },
                        { label: 'Residence Proof', status: 'In-Person Audit' },
                        { label: 'Credit History', status: 'AI Cleared' },
                      ].map(v => (
                        <div key={v.label} className="flex items-center justify-between p-3 bg-bg-base/50 rounded-2xl border border-white/5">
                           <span className="text-xs font-medium text-text-2">{v.label}</span>
                           <CheckCircle size={14} className="text-success" />
                        </div>
                      ))}
                   </div>
                </div>
                <div className="p-6 bg-success/5 border border-success/10 rounded-3xl">
                   <p className="text-[10px] font-black text-success uppercase tracking-widest mb-3">District Officer Note</p>
                   <p className="text-xs text-text-2 italic leading-relaxed">"Student exhibits high commitment to academic excellence. Family background verified via Ration Card records. Highly recommended for immediate sanctioning."</p>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Action Panel */}
        <div className="space-y-6">
           <div className="p-8 glass border border-white/5 rounded-[40px] sticky top-24">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                < Landmark size={20} className="text-success" /> Sanction Control
              </h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-text-3 uppercase tracking-widest mb-2 block">Officer Review Note</label>
                    <textarea 
                      value={decisionNote}
                      onChange={e => setDecisionNote(e.target.value)}
                      placeholder="Enter internal review notes or sanction conditions..."
                      className="w-full h-32 p-4 bg-bg-base border border-white/5 rounded-2xl text-xs text-text-1 resize-none outline-none focus:border-success/30 transition-all font-medium"
                    />
                 </div>

                 <div className="space-y-3">
                    <button 
                      onClick={() => handleDecision('Approved')}
                      disabled={isUpdating}
                      className="w-full h-14 bg-success text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-success/20 hover:bg-success/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isUpdating ? 'Executing...' : 'Approve & Sanction'} <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => handleDecision('Rejected')}
                      disabled={isUpdating}
                      className="w-full h-14 bg-white/5 text-danger font-black text-xs uppercase tracking-[0.2em] rounded-2xl border border-danger/20 hover:bg-danger/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      Reject Application <XCircle size={18} />
                    </button>
                 </div>

                 <p className="text-[9px] text-text-3 text-center uppercase font-bold tracking-widest leading-relaxed">
                   Sanctioning will notify the student and initiate the digital signature workflow via mobile ID.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDecisionScreen;
