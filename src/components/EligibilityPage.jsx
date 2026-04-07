import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  ArrowLeft,
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  Loader2,
  Sparkles
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

const EligibilityPage = ({ onBack }) => {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    lookingFor: 'Scholarship',
    gender: 'Male',
    category: '',
    specialCategory: '',
    qualification: '',
    course: '',
    institutionType: '',
    studyingInOdisha: true,
    kaliaBeneficiary: false,
    labourCard: false,
    annualIncome: '',
    marks: '' // string
  });
  const [result, setResult] = useState(null);

  const checkEligibility = async () => {
    // Basic validation
    if (!data.category || !data.qualification || !data.course || !data.institutionType || !data.annualIncome || !data.marks) {
      alert("Please fill all the required fields (*)");
      return;
    }

    setLoading(true);

    try {
      // 1. Save data to Firebase if user is logged in
      if (user) {
        const payload = {
          ...data,
          marks: parseFloat(data.marks),
          timestamp: new Date().toISOString()
        };
        // Creating a record under the user's document
        await setDoc(doc(db, `users/${user.uid}/eligibilityChecks`, Date.now().toString()), payload);
      }

      // 2. Simple mock logic for demonstration
      const score = parseFloat(data.marks);
      let eligibleSchemes = [];
      
      if (score >= 75) {
        eligibleSchemes.push({ name: 'State Academic Excellence Fund', match: '92%', status: 'Eligible', benefit: 'Tuition Waiver' });
      }
      if (data.category !== 'General' && data.category !== '') {
        eligibleSchemes.push({ name: 'Central Reservation Scholarship', match: '100%', status: 'Highly Eligible', benefit: '₹35,000 / year' });
      }
      if (eligibleSchemes.length === 0) {
        eligibleSchemes.push({ name: 'General Student Aid', match: '85%', status: 'Standard', benefit: '₹10,000 / year' });
      }

      setResult(eligibleSchemes);
      
      // Artificial delay for loading UI aesthetics
      setTimeout(() => {
        setStep(2);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);

    } catch (err) {
      console.error("Error saving eligibility data: ", err);
      alert("Something went wrong saving your data. Please try again.");
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="animate-fade-up">
          <div className="mb-10">
            <button onClick={onBack} className="flex items-center gap-2 text-text-3 hover:text-text-1 text-sm font-bold transition-colors mb-6">
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-heading font-extrabold text-text-1 tracking-tight">Check <span className="text-accent">Eligibility</span></h2>
            <p className="text-text-3 font-semibold mt-2">Help us find the best opportunities tailored for you.</p>
          </div>
          
          <div className="p-8 lg:p-12 glass border border-white/5 rounded-[3rem] bg-bg-surface/50 relative overflow-hidden shadow-xl">
             {loading && <div className="scan-overlay" />}

             {/* Form Grid */}
             <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                   {/* Column 1 */}
                   <div className="space-y-8">
                      {/* Looking For Option */}
                      <div className="col-span-1 md:col-span-2">
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Looking for <span className="text-danger">*</span></label>
                         <div className="flex bg-bg-base rounded-full p-1 border border-border-default w-fit shadow-inner">
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${data.lookingFor === 'Scholarship' ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, lookingFor: 'Scholarship'})}
                            >
                               Scholarship
                            </button>
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${data.lookingFor === 'Educational Loan' ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, lookingFor: 'Educational Loan'})}
                            >
                               Educational Loan
                            </button>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Choose your gender <span className="text-danger">*</span></label>
                         <div className="flex bg-bg-base rounded-full p-1 border border-border-default w-fit shadow-inner">
                            {['Male', 'Female', 'Others'].map(g => (
                               <button 
                                 key={g}
                                 className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${data.gender === g ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                                 onClick={() => setData({...data, gender: g})}
                               >
                                  {g}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Select your category <span className="text-danger">*</span></label>
                         <div className="relative">
                           <select 
                             value={data.category}
                             onChange={(e) => setData({...data, category: e.target.value})}
                             className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer outline-none placeholder:text-text-3"
                           >
                              <option value="">Select Category</option>
                              <option value="General">General</option>
                              <option value="ST">ST</option>
                              <option value="SC">SC</option>
                              <option value="OBC/SEBC">OBC/SEBC</option>
                              <option value="EBC">EBC</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Highest qualification <span className="text-danger">*</span></label>
                         <div className="relative">
                           <select 
                             value={data.qualification}
                             onChange={(e) => setData({...data, qualification: e.target.value})}
                             className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer outline-none placeholder:text-text-3"
                           >
                              <option value="">Select Qualification</option>
                              <option value="10th">10th</option>
                              <option value="12th">12th</option>
                              <option value="Undergraduate">Undergraduate</option>
                              <option value="Postgraduate">Postgraduate</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Institution Type <span className="text-danger">*</span></label>
                         <div className="relative">
                           <select 
                             value={data.institutionType}
                             onChange={(e) => setData({...data, institutionType: e.target.value})}
                             className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer outline-none placeholder:text-text-3"
                           >
                              <option value="">Select Institution</option>
                              <option value="Government">Government</option>
                              <option value="Private">Private</option>
                              <option value="Aided">Aided</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Does parents have a KALIA beneficiary? <span className="text-danger">*</span></label>
                         <div className="flex bg-bg-base rounded-full p-1 border border-border-default w-fit shadow-inner">
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${data.kaliaBeneficiary ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, kaliaBeneficiary: true})}
                            >
                               Yes
                            </button>
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${!data.kaliaBeneficiary ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, kaliaBeneficiary: false})}
                            >
                               No
                            </button>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Yearly family income <span className="text-danger">*</span></label>
                         <div className="relative">
                           <select 
                             value={data.annualIncome}
                             onChange={(e) => setData({...data, annualIncome: e.target.value})}
                             className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer outline-none placeholder:text-text-3"
                           >
                              <option value="">Select Income Bracket</option>
                              <option value="Below 1 Lakh">Below 1 Lakh</option>
                              <option value="1 Lakh - 2.5 Lakhs">1 Lakh - 2.5 Lakhs</option>
                              <option value="2.5 Lakhs - 5 Lakhs">2.5 Lakhs - 5 Lakhs</option>
                              <option value="Above 5 Lakhs">Above 5 Lakhs</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </div>
                         </div>
                      </div>
                   </div>

                   {/* Column 2 */}
                   <div className="space-y-8 md:pt-[76px]">
                      
                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Special category</label>
                         <div className="relative">
                           <select 
                             value={data.specialCategory}
                             onChange={(e) => setData({...data, specialCategory: e.target.value})}
                             className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer outline-none placeholder:text-text-3"
                           >
                              <option value="">Select Option</option>
                              <option value="None">None</option>
                              <option value="PWD">PWD (Persons with Disabilities)</option>
                              <option value="Single Girl Child">Single Girl Child</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Course you are pursuing to study <span className="text-danger">*</span></label>
                         <div className="relative">
                           <select 
                             value={data.course}
                             onChange={(e) => setData({...data, course: e.target.value})}
                             className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer outline-none placeholder:text-text-3"
                           >
                              <option value="">Select Course</option>
                              <option value="B.Tech">B.Tech / B.E.</option>
                              <option value="MBBS">MBBS / Medical</option>
                              <option value="B.Sc">B.Sc / B.A. / B.Com</option>
                              <option value="MBA">MBA / PGDM</option>
                              <option value="Other">Other</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-3">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </div>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Studying in Odisha <span className="text-danger">*</span></label>
                         <div className="flex bg-bg-base rounded-full p-1 border border-border-default w-fit shadow-inner">
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${data.studyingInOdisha ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, studyingInOdisha: true})}
                            >
                               Yes
                            </button>
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${!data.studyingInOdisha ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, studyingInOdisha: false})}
                            >
                               No
                            </button>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Does parent hold a labour card? <span className="text-danger">*</span></label>
                         <div className="flex bg-bg-base rounded-full p-1 border border-border-default w-fit shadow-inner">
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${data.labourCard ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, labourCard: true})}
                            >
                               Yes
                            </button>
                            <button 
                               className={`px-7 py-2.5 rounded-full text-xs font-bold transition-all ${!data.labourCard ? 'bg-accent text-bg-base shadow-lg shadow-accent/20 scale-105' : 'text-text-2 hover:bg-white/5 hover:text-text-1'}`}
                               onClick={() => setData({...data, labourCard: false})}
                            >
                               No
                            </button>
                         </div>
                      </div>

                      <div>
                         <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Total marks in last exam <span className="text-danger">*</span></label>
                         <div className="relative">
                            <input 
                              type="number" 
                              className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 placeholder:text-text-3 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 outline-none transition-all pr-10"
                              placeholder="Enter percentage"
                              value={data.marks}
                              onChange={(e) => setData({...data, marks: e.target.value})}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-text-3">
                               %
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-8 mb-2 flex justify-end">
                   <button 
                     disabled={loading}
                     onClick={checkEligibility}
                     className="w-full sm:w-auto h-12 px-12 bg-gradient-to-r from-accent to-accent-ai text-white rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-xl hover:shadow-accent/20 text-sm"
                   >
                     {loading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
                     {loading ? 'Analyzing Profile...' : 'Check Eligibility'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      );
    }
    
    // Step 2: Results
    return (
      <div className="animate-fade-up max-w-[1000px] mx-auto pb-10">
        <div className="mb-8">
           <button 
             onClick={() => setStep(1)} 
             className="flex items-center gap-2 text-text-3 hover:text-text-1 text-sm font-bold transition-all"
           >
             <ArrowLeft size={16} /> Back to Edit Form
           </button>
        </div>

        <div className="text-center mb-10 mt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4 ring-8 ring-success/5 animate-scale-pop">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-heading text-text-1">Eligibility Results</h2>
          <p className="text-text-3">Based on your profile, we found {result.length} customized opportunities.</p>
        </div>

        <div className="space-y-4">
          {result.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass border border-white/5 border-l-4 border-l-accent animate-fade-in flex items-center justify-between" style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-bg-base border border-border-default flex items-center justify-center text-accent">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-text-1">{item.name}</h4>
                  <p className="text-xs text-text-3 font-medium flex items-center gap-1 mt-1">
                    <Zap size={12} className="text-success" /> Benefit: <span className="text-success">{item.benefit}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1.5">Match Score</span>
                <span className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold">
                  {item.match}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl border border-dashed border-border-default bg-bg-surface/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex gap-3 items-center">
              <AlertCircle className="text-accent-ai shrink-0" size={20} />
              <p className="text-xs text-text-2">Register now to unlock the full application process for these schemes.</p>
           </div>
           <button onClick={() => setStep(1)} className="text-sm font-bold text-accent hover:text-white transition-colors shrink-0">Re-check Profile</button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4 pb-32">
        {renderStep()}
    </div>
  );
};

export default EligibilityPage;
