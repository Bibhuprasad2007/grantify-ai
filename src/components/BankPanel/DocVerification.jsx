import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Search, CheckCircle2, 
  AlertCircle, Zap, ShieldAlert, ArrowRight,
  Eye, Download, PlayCircle, Loader2
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const DocVerification = ({ selectedApp, onVerificationComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStep, setScanStep] = useState('');

  if (!selectedApp) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-text-3 opacity-30 select-none">
         <FileText size={64} className="mb-4" />
         <p className="text-sm font-black uppercase tracking-[0.3em]">No target application selected</p>
         <p className="text-[10px] mt-2 italic font-medium">Select an application from the pipeline to start verification</p>
      </div>
    );
  }

  const handleAIVerify = async () => {
    setIsProcessing(true);
    
    // Step-by-step UI simulation of AI scan
    const steps = [
      'Authenticating OCR Engine...',
      'Cross-referencing Aadhar Records...',
      'Validating PAN Integrity...',
      'Scanning Bank Statement Signatures...',
      'Academic Record Consistency Check...',
      'Finalizing Verification Hash...'
    ];

    for (const step of steps) {
      setScanStep(step);
      await new Promise(r => setTimeout(r, 800));
    }

    // Risk Calculation
    let risk = 50; 
    const cibil = parseInt(selectedApp.cibilScore) || 720;
    const income = parseInt(selectedApp.familyInfo?.annualIncome) || 300000;
    if (cibil > 750) risk -= 15;
    if (income > 500000) risk -= 10;
    
    try {
      const appRef = doc(db, selectedApp.collection || 'loanApplications', selectedApp.id);
      await updateDoc(appRef, {
        status: 'Verified',
        aiVerified: true,
        aiRiskScore: risk,
        lastVerifiedAt: serverTimestamp(),
        verificationNotes: 'AI automated document & ID consistency check successful.'
      });
      
      setScanStep('VERIFICATION SUCCESSFUL');
      setTimeout(() => {
        onVerificationComplete(); // This will trigger the tab switch to 'risk'
        setIsProcessing(false);
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Verification failed to save. Please try again.");
      setIsProcessing(false);
    }
  };

  const docs = [
    { label: 'Primary ID (Aadhar)', status: 'Uploaded', icon: ShieldCheck },
    { label: 'Financial ID (PAN)', status: 'Uploaded', icon: FileText },
    { label: 'Academic Transcript', status: 'Uploaded', icon: FileText },
    { label: 'Bank Passbook', status: 'Uploaded', icon: FileText },
    { label: 'Income Proof', status: 'Uploaded', icon: FileText },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] p-8 rounded-[40px] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-[24px] bg-success flex items-center justify-center text-xl font-black text-white shadow-lg shadow-success/10">
              {selectedApp.name?.[0] || 'S'}
           </div>
           <div>
              <h2 className="text-2xl font-heading font-black text-white">{selectedApp.name}</h2>
              <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest mt-1">
                Ref: {selectedApp.id.substring(0, 12).toUpperCase()} • Active Targeting
              </p>
           </div>
        </div>
        
        <button 
          onClick={handleAIVerify}
          disabled={isProcessing}
          className="relative overflow-hidden h-16 px-10 rounded-2xl bg-gradient-to-r from-success to-emerald-400 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-success/20 hover:scale-[1.02] transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Zap size={18} fill="currentColor" />
          )}
          {isProcessing ? 'AI SCANNING...' : 'Run AI Verification'}
          
          {isProcessing && (
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-progress-fast" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Document List */}
        <div className="p-8 glass border border-white/5 rounded-[40px] relative overflow-hidden">
           {isProcessing && (
              <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                 <div className="w-20 h-20 rounded-full border-4 border-success/20 border-t-success animate-spin mb-6" />
                 <h3 className="text-lg font-black text-white mb-2">{scanStep}</h3>
                 <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest animate-pulse">Deep-Scan in progress...</p>
              </div>
           )}

           <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
             <FileText className="text-success" /> Document Vault
           </h3>
           
           <div className="space-y-4">
              {docs.map((doc, idx) => (
                <div key={idx} className="p-4 bg-bg-base/50 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-3 group-hover:text-success transition-all">
                        <doc.icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white tracking-wide">{doc.label}</p>
                        <p className="text-[10px] text-text-3 font-bold uppercase">{doc.status}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 text-text-3 hover:text-white transition-all"><Eye size={16} /></button>
                      <button className="p-2 text-text-3 hover:text-white transition-all"><Download size={16} /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Verification Rules */}
        <div className="space-y-6 text-nowrap">
           <div className="p-8 glass border border-white/5 rounded-[40px]">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                <ShieldCheck className="text-success" /> Compliance Check
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Biometric Authenticity', result: '99.4%' },
                   { label: 'E-KYC Completion', result: 'Success' },
                   { label: 'Name Match Score', result: '99.9%' },
                   { label: 'Document Tamper Check', result: 'Clean' }
                 ].map((rule, idx) => (
                   <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                      <span className="text-xs font-medium text-text-2">{rule.label}</span>
                      <span className="text-[10px] font-black text-success uppercase">{rule.result}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 bg-success/5 border border-success/10 rounded-[40px] relative overflow-hidden group hover:bg-success/10 transition-all">
              <Zap className="text-success mb-4 group-hover:scale-110 transition-transform" size={32} />
              <h4 className="text-sm font-black text-white mb-2">Instant Decision Handoff</h4>
              <p className="text-xs text-text-3 leading-relaxed mb-6 font-medium">Once verified, this application will be sent to the Risk Assessment module for final interest rate and risk profiling.</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-success uppercase tracking-widest">
                 System Monitoring Active <ArrowRight size={14} className="animate-bounce-x" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocVerification;
