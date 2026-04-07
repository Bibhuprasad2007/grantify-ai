import React, { useState } from 'react';
import { 
  ArrowLeft, ShieldCheck, CreditCard, 
  User, Calendar, Phone, CheckCircle2, 
  Loader2, Star, Target, MapPin, 
  Landmark, Mail, Fingerprint, Users
} from 'lucide-react';

const CibilScorePage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    pan: '',
    name: '',
    dob: '',
    aadhaar: '',
    mobile: '',
    email: '',
    fatherPhone: '',
    currAddress: '',
    permAddress: '',
    bankName: '',
    branch: '',
    accNo: '',
    ifsc: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFetchIFSC = () => {
    if (!formData.ifsc) return;
    // Simulate real fetch for UI feel
    fetch(`https://ifsc.razorpay.com/${formData.ifsc}`)
      .then(res => res.ok ? res.json() : Promise.reject('Invalid IFSC'))
      .then(data => {
        setFormData(prev => ({ ...prev, bankName: data.BANK || '', branch: data.BRANCH || '' }));
      })
      .catch(() => {
        setFormData(prev => ({ ...prev, bankName: 'Not Found', branch: 'Not Found' }));
      });
  };

  const handleCheck = (e) => {
    e.preventDefault();
    if (!formData.pan) {
      alert("PAN Card is mandatory for checking CIBIL Score!");
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to credit bureau
    setTimeout(() => {
      // Generate a mock score between 650 and 850
      const mockScore = Math.floor(Math.random() * (850 - 650 + 1)) + 650;
      setScore(mockScore);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2500);
  };

  const getScoreDetails = (s) => {
    if (s >= 750) return { label: 'Excellent', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };
    if (s >= 700) return { label: 'Good', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' };
    return { label: 'Fair', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' };
  };

  const resetForm = () => {
    setScore(null);
    setFormData({
      pan: '', name: '', dob: '', aadhaar: '', mobile: '', email: '', fatherPhone: '',
      currAddress: '', permAddress: '', bankName: '', branch: '', accNo: '', ifsc: ''
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
           <button onClick={onBack} className="flex items-center gap-2 text-text-3 hover:text-text-1 text-sm font-bold transition-colors mb-4">
             <ArrowLeft size={16} /> Back to Application
           </button>
           <h2 className="text-3xl font-heading font-extrabold text-white">Full <span className="text-accent">Eligibility Check</span></h2>
           <p className="text-text-3 font-semibold mt-2">Submit your complete details to fetch an accurate CIBIL and Eligibility Score.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 relative">
         
         {/* Form Section */}
         <div className={`p-8 lg:p-12 glass border border-white/5 rounded-[3rem] bg-bg-surface/50 transition-all duration-500 relative ${score ? 'hidden' : 'block'}`}>
            {loading && <div className="scan-overlay rounded-[3rem]" />}
            
            <div className="flex items-center gap-3 mb-10">
               <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                 <ShieldCheck size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-text-1">Comprehensive Bureau Details</h3>
                  <p className="text-text-3 text-xs font-bold uppercase tracking-widest mt-1">100% Safe & Secure Encryption</p>
               </div>
            </div>

            <form onSubmit={handleCheck} className="space-y-10">
               
               {/* 1. Personal Identity */}
               <div>
                 <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Personal Identity</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">PAN Card <span className="text-warning ml-1">(⚠️ Most Important)</span></label>
                     <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          required
                          name="pan" 
                          value={formData.pan}
                          onChange={handleInputChange}
                          placeholder="ABCDE1234F"
                          className="w-full h-12 bg-bg-base border border-warning/50 shadow-sm shadow-warning/10 rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-warning outline-none uppercase transition-all" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Aadhaar Card Number</label>
                     <div className="relative">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          name="aadhaar" 
                          value={formData.aadhaar}
                          onChange={handleInputChange}
                          placeholder="XXXX XXXX XXXX"
                          className="w-full h-12 bg-bg-base border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-accent/40 outline-none transition-all" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Full Name (As per PAN)</label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          required
                          name="name" 
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter legal name"
                          className="w-full h-12 bg-bg-base border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-accent/40 outline-none transition-all" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Date of Birth</label>
                     <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          type="date"
                          required
                          name="dob" 
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full h-12 bg-bg-base border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-accent/40 outline-none transition-all" 
                        />
                     </div>
                   </div>
                 </div>
               </div>

               {/* 2. Contact Details */}
               <div>
                 <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Contact Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Mobile Number <span className="text-accent ml-1">(For OTP Verification)</span></label>
                     <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          required
                          name="mobile" 
                          value={formData.mobile}
                          onChange={handleInputChange}
                          placeholder="+91"
                          className="w-full h-12 bg-bg-base border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-accent/40 outline-none transition-all" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Email ID</label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          type="email"
                          name="email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@email.com"
                          className="w-full h-12 bg-bg-base border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-accent/40 outline-none transition-all" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative md:col-span-2 lg:col-span-1">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Father's Phone Number</label>
                     <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          name="fatherPhone" 
                          value={formData.fatherPhone}
                          onChange={handleInputChange}
                          placeholder="+91"
                          className="w-full h-12 bg-bg-base border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-accent/40 outline-none transition-all" 
                        />
                     </div>
                   </div>
                 </div>
               </div>

               {/* 3. Address */}
               <div>
                 <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Address Details</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-2 relative md:col-span-2">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Current Address</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-3 text-text-3" size={18} />
                        <textarea 
                          name="currAddress" 
                          value={formData.currAddress}
                          onChange={handleInputChange}
                          placeholder="Enter current residential address"
                          rows={2}
                          className="w-full bg-bg-base border border-border-default rounded-xl pl-12 pr-4 py-3 text-sm text-text-1 focus:border-accent/40 outline-none transition-all resize-none" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative md:col-span-2">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Permanent Address</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-3 text-text-3" size={18} />
                        <textarea 
                          name="permAddress" 
                          value={formData.permAddress}
                          onChange={handleInputChange}
                          placeholder="Enter permanent address"
                          rows={2}
                          className="w-full bg-bg-base border border-border-default rounded-xl pl-12 pr-4 py-3 text-sm text-text-1 focus:border-accent/40 outline-none transition-all resize-none" 
                        />
                     </div>
                   </div>
                 </div>
               </div>

               {/* 4. Bank Information */}
               <div>
                 <h4 className="text-sm font-bold text-accent uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Bank & Account Details</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">IFSC Code</label>
                     <div className="flex gap-2">
                       <input 
                          name="ifsc" 
                          value={formData.ifsc}
                          onChange={handleInputChange}
                          placeholder="SBIN0001234"
                          className="flex-1 h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 outline-none uppercase transition-all" 
                       />
                       <button type="button" onClick={handleFetchIFSC} className="px-5 bg-accent/20 rounded-xl text-accent font-bold text-xs uppercase hover:bg-accent/30">Fetch</button>
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Bank Name</label>
                     <div className="relative">
                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          name="bankName" 
                          value={formData.bankName}
                          onChange={handleInputChange}
                          readOnly
                          placeholder="Auto-fetched"
                          className="w-full h-12 bg-bg-base/50 opacity-70 border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 outline-none transition-all cursor-not-allowed" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Branch Name</label>
                     <div className="relative">
                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          name="branch" 
                          value={formData.branch}
                          onChange={handleInputChange}
                          readOnly
                          placeholder="Auto-fetched"
                          className="w-full h-12 bg-bg-base/50 opacity-70 border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 outline-none transition-all cursor-not-allowed" 
                        />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2 relative">
                     <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">Bank Account Number</label>
                     <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={18} />
                        <input 
                          name="accNo"
                          type="password"
                          value={formData.accNo}
                          onChange={handleInputChange}
                          placeholder="Enter A/C Number"
                          className="w-full h-12 bg-bg-base border border-border-default rounded-xl pl-12 pr-4 text-sm text-text-1 focus:border-accent/40 outline-none transition-all" 
                        />
                     </div>
                   </div>
                 </div>
               </div>

               <div className="pt-6 mt-6 border-t border-white/10">
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full h-14 bg-gradient-to-r from-accent to-accent-ai text-white rounded-xl font-extrabold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-accent/20 transition-all disabled:opacity-50 text-lg shadow-lg"
                 >
                   {loading ? <Loader2 className="animate-spin" size={24} /> : <Target size={24} />}
                   {loading ? 'Analyzing Profile Data...' : 'Check Full Eligibility & CIBIL Score'}
                 </button>
               </div>
            </form>
         </div>

         {/* Results Section */}
         <div className={`flex flex-col justify-center items-center w-full max-w-2xl mx-auto p-12 glass border border-white/5 rounded-[3rem] bg-bg-surface/50 transition-all duration-700 ${score ? 'opacity-100 translate-y-0 scale-100' : 'hidden opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
            {score ? (
              <div className="text-center animate-scale-pop w-full">
                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 text-success mb-6 ring-8 ring-success/5">
                   <CheckCircle2 size={40} />
                 </div>
                 
                 <h4 className="text-3xl font-heading font-extrabold text-white mb-2">Verified Successfully</h4>
                 <p className="text-text-3 mb-10">Your details have been matched with Bureau records.</p>
                 
                 <div className="relative w-56 h-56 mx-auto mb-10">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        strokeDasharray={`${(score / 900) * 283} 283`}
                        className={`transition-all duration-1000 ease-out ${getScoreDetails(score).color}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className={`text-6xl font-heading font-extrabold ${getScoreDetails(score).color}`}>
                         {score}
                       </span>
                       <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest mt-2 bg-bg-base/50 px-3 py-1 rounded-full border border-white/5">Out of 900</span>
                    </div>
                 </div>

                 <div className={`p-6 rounded-2xl border ${getScoreDetails(score).bg} ${getScoreDetails(score).border} inline-flex items-center gap-4 mb-10 w-full justify-center max-w-sm`}>
                    <Star className={getScoreDetails(score).color} size={32} />
                    <div className="text-left">
                       <p className={`font-bold text-xl ${getScoreDetails(score).color}`}>Rating: {getScoreDetails(score).label}</p>
                       <p className="text-sm text-text-1/70 font-medium mt-1">
                         {score >= 750 ? "Pre-approved for instant disbursement!" : "Eligible for standard loan processing."}
                       </p>
                    </div>
                 </div>

                 <div className="border-t border-white/10 pt-10 flex gap-4 justify-center w-full">
                    <button onClick={resetForm} className="h-14 px-8 rounded-xl border border-border-default text-text-1 font-bold hover:bg-white/5 transition-all text-sm w-full sm:w-auto">
                      Re-Check Score
                    </button>
                    <button onClick={onBack} className="h-14 px-10 rounded-xl bg-accent text-bg-base font-bold hover:bg-white hover:shadow-accent-glow transition-all text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-accent/20">
                       Continue Application <ArrowLeft size={18} className="rotate-180" />
                    </button>
                 </div>
              </div>
            ) : null}
         </div>

      </div>
    </div>
  );
};

export default CibilScorePage;
