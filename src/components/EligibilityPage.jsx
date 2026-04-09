import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  ArrowLeft,
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  Loader2,
  Sparkles,
  Landmark,
  Wand2
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

const EligibilityPage = ({ onBack, onApply }) => {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [autoFillDone, setAutoFillDone] = useState(false);
  const [data, setData] = useState({
    name: '',
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
    marks: '', 
    marks10th: '',
    marks12th: '',
    fatherOccupation: '',
    motherOccupation: '',
    bankName: '',
    district: '',
    state: ''
  });
  const [result, setResult] = useState(null);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        name: user.displayName || user.name || prev.name,
        category: user.category || prev.category,
        course: user.courseName || prev.course,
        annualIncome: user.annualIncome ? getIncomeBracket(user.annualIncome) : prev.annualIncome,
        marks: user.marks || prev.marks,
        marks10th: user.marks10th || prev.marks10th,
        marks12th: user.marks12th || prev.marks12th,
        fatherOccupation: user.fatherOccupation || prev.fatherOccupation,
        motherOccupation: user.motherOccupation || prev.motherOccupation,
        bankName: user.bankName || prev.bankName,
        district: user.district || prev.district,
        state: user.state || prev.state,
        gender: user.gender || prev.gender
      }));
    }
  }, [user]);

  const handleAutoFill = () => {
    if (!user) return;
    setData(prev => ({
      ...prev,
      name: user.displayName || user.name || prev.name,
      category: user.category || prev.category,
      course: user.courseName || prev.course,
      annualIncome: user.annualIncome ? getIncomeBracket(user.annualIncome) : prev.annualIncome,
      marks: user.marks || prev.marks,
      marks10th: user.marks10th || prev.marks10th,
      marks12th: user.marks12th || prev.marks12th,
      fatherOccupation: user.fatherOccupation || prev.fatherOccupation,
      motherOccupation: user.motherOccupation || prev.motherOccupation,
      bankName: user.bankName || prev.bankName,
      district: user.district || prev.district,
      state: user.state || prev.state,
      gender: user.gender || prev.gender
    }));
    setAutoFillDone(true);
    setTimeout(() => setAutoFillDone(false), 3000);
  };

  const getIncomeBracket = (income) => {
    const inc = parseInt(income);
    if (inc < 100000) return 'Below 1 Lakh';
    if (inc < 250000) return '1 Lakh - 2.5 Lakhs';
    if (inc < 500000) return '2.5 Lakhs - 5 Lakhs';
    return 'Above 5 Lakhs';
  };

  const parseIncome = (bracket) => {
    if (bracket === 'Below 1 Lakh') return 99999;
    if (bracket === '1 Lakh - 2.5 Lakhs') return 249999;
    if (bracket === '2.5 Lakhs - 5 Lakhs') return 499999;
    return 1000000;
  };

  const checkEligibility = async () => {
    if (!data.name || !data.category || !data.qualification || !data.institutionType || !data.annualIncome || !data.marks) {
      alert("Please fill all the required fields (*)");
      return;
    }

    setLoading(true);

    try {
      console.log("🔍 Checking eligibility with data:", data);
      const userMarks = parseFloat(data.marks || 0);
      const userIncome = parseIncome(data.annualIncome);
      
      let eligibleSchemes = [];

      if (data.lookingFor === 'Scholarship') {
        console.log("📡 Fetching scholarships...");
        const schemesSnap = await getDocs(collection(db, "governmentSchemes"));
        let allSchemes = schemesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // FALLBACK: If DB is empty, use seed data directly so UI always works
        if (allSchemes.length === 0) {
          allSchemes = [
            { schemeId: 'GOV-PM-SCHOLARSHIP', name: 'PM Scholarship Scheme', category: 'Central Government', amount: '₹36,200', tags: ['Central', 'Merit'], match: 92, status: 'Active' },
            { schemeId: 'GOV-NSP-OBC', name: 'Post Matric Scholarship for OBC', category: 'OBC Welfare', amount: '₹28,800', tags: ['OBC', 'Post-Matric'], match: 87, status: 'Active' },
            { schemeId: 'GOV-NSP-SC', name: 'Post Matric Scholarship for SC/ST', category: 'SC/ST Welfare', amount: '₹69,600', tags: ['SC', 'ST', 'Post-Matric'], match: 94, status: 'Active' },
            { schemeId: 'STATE-MEDHABRUTI', name: 'E-Medhabruti Scholarship', category: 'General', amount: '₹10,000', tags: ['State', 'Merit', 'General'], match: 85, status: 'Active' }
          ];
        }

        eligibleSchemes = allSchemes.filter(scheme => {
          if (!scheme) return false;
          const schemeCategory = (scheme.category || "").toLowerCase();
          const userCategory = (data.category || "").toLowerCase();
          
          // More forgiving matching logic
          const isCentralOrGeneral = schemeCategory.includes('central') || schemeCategory.includes('general');
          const exactMatch = schemeCategory.includes(userCategory) || userCategory.includes(schemeCategory);
          const tagMatch = scheme.tags?.some(t => t.toLowerCase().includes(userCategory) || userCategory.includes(t.toLowerCase()));
          
          const catMatch = isCentralOrGeneral || exactMatch || tagMatch || userCategory === "";
          
          const marksMatch = userMarks >= 50;
          let incomeLimit = 800000;
          if (scheme.eligibility?.some(e => e.includes('₹1 Lakh'))) incomeLimit = 100000;
          if (scheme.eligibility?.some(e => e.includes('₹2.5 Lakh'))) incomeLimit = 250000;
          if (scheme.eligibility?.some(e => e.includes('₹5 Lakh'))) incomeLimit = 500000;
          const incomeMatch = userIncome <= incomeLimit;

          return catMatch && marksMatch && incomeMatch;
        }).map(s => ({
          ...s,
          match: `${Math.min(95, 70 + Math.floor(userMarks/5))}%`,
          status: 'Eligible',
          benefit: s.amount || 'Varies',
          type: 'scholarship'
        }));

      } else {
        console.log("📡 Fetching loans...");
        const loansSnap = await getDocs(collection(db, "loans"));
        let allLoans = loansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // FALLBACK: If DB is empty, use seed data
        if (allLoans.length === 0) {
          allLoans = [
            { id: 'LOAN-OFFER-001', loanName: 'SBI Scholar Loan Scheme', bankName: 'State Bank of India', interestRate: '8.55%', approvalConfidence: 96 },
            { id: 'LOAN-OFFER-002', loanName: 'HDFC Education Loan', bankName: 'HDFC Bank', interestRate: '9.50%', approvalConfidence: 89 },
            { id: 'LOAN-OFFER-003', loanName: 'PNB Saraswati', bankName: 'Punjab National Bank', interestRate: '8.60%', approvalConfidence: 92 }
          ];
        }

        eligibleSchemes = allLoans.filter(loan => {
          const userMarks12 = parseFloat(data.marks12th || 0);
          const marksMatch = userMarks12 >= 50 || userMarks >= 50 || (userMarks12 === 0 && userMarks === 0);
          const incomeMatch = userIncome <= 1500000; // loans usually have higher income ceilings
          const bankMatch = !data.bankName || (loan.bankName || "").toLowerCase().includes(data.bankName.toLowerCase());
          return marksMatch && incomeMatch && bankMatch;
        }).map(l => {
          const userMarks12 = parseFloat(data.marks12th || 0);
          const score = Math.min(98, (l.approvalConfidence || 85) + (userMarks12 > 80 || userMarks > 80 ? 5 : 0));
          return {
            ...l,
            name: l.loanName || l.title || 'Educational Loan',
            match: `${score}%`,
            status: score > 90 ? 'High Chance' : 'Eligible',
            benefit: `Interest: ${l.interestRate || 'Competitive'}`,
            type: 'loan'
          };
        });
      }

      console.log(`✅ Found ${eligibleSchemes.length} matching schemes`);
      setResult(eligibleSchemes);
      
      if (user) {
        console.log("💾 Saving check history...");
        await setDoc(doc(db, `users/${user.uid}/eligibilityChecks`, Date.now().toString()), {
          ...data,
          marks: userMarks,
          timestamp: new Date().toISOString(),
          resultsCount: eligibleSchemes.length
        });
      }

      setTimeout(() => {
        setStep(2);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000);

    } catch (err) {
      console.error("❌ Eligibility Check Error:", err);
      alert("Eligibility check failed: " + (err.message || "Unknown error"));
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
            <div className="flex items-center justify-between mt-2">
              <p className="text-text-3 font-semibold">Help us find the best opportunities tailored for you.</p>
              <button
                type="button"
                onClick={handleAutoFill}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-ai to-accent rounded-xl text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
              >
                <Wand2 size={14} />
                {autoFillDone ? '✅ Filled!' : 'Auto Fill from Profile'}
              </button>
            </div>
          </div>
          
          <div className="p-8 lg:p-12 glass border border-white/5 rounded-[3rem] bg-bg-surface/50 relative overflow-hidden shadow-xl">
             {loading && <div className="scan-overlay" />}

             <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
                    {/* Looking For */}
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

                    {/* Common Fields */}
                    <div>
                        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Full Name <span className="text-danger">*</span></label>
                        <input 
                           type="text" 
                           placeholder="Enter your full name"
                           value={data.name}
                           onChange={(e) => setData({...data, name: e.target.value})}
                           className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none transition-all placeholder:opacity-50 placeholder:text-text-3"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Gender <span className="text-danger">*</span></label>
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
                        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Category <span className="text-danger">*</span></label>
                        <select 
                           value={data.category}
                           onChange={(e) => setData({...data, category: e.target.value})}
                           className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none transition-all"
                        >
                           <option value="">Select Category</option>
                           <option value="General">General</option>
                           <option value="ST">ST</option>
                           <option value="SC">SC</option>
                           <option value="OBC/SEBC">OBC/SEBC</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Qualification <span className="text-danger">*</span></label>
                        <select 
                           value={data.qualification}
                           onChange={(e) => setData({...data, qualification: e.target.value})}
                           className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                        >
                           <option value="">Select Qualification</option>
                           <option value="12th">12th</option>
                           <option value="Undergraduate">Undergraduate</option>
                           <option value="Postgraduate">Postgraduate</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Institution Type <span className="text-danger">*</span></label>
                        <select 
                           value={data.institutionType}
                           onChange={(e) => setData({...data, institutionType: e.target.value})}
                           className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                        >
                           <option value="">Select Institution</option>
                           <option value="Government">Government</option>
                           <option value="Private">Private</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Income Bracket <span className="text-danger">*</span></label>
                        <select 
                           value={data.annualIncome}
                           onChange={(e) => setData({...data, annualIncome: e.target.value})}
                           className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                        >
                           <option value="">Select Income Bracket</option>
                           <option value="Below 1 Lakh">Below 1 Lakh</option>
                           <option value="1 Lakh - 2.5 Lakhs">1 Lakh - 2.5 Lakhs</option>
                           <option value="2.5 Lakhs - 5 Lakhs">2.5 Lakhs - 5 Lakhs</option>
                           <option value="Above 5 Lakhs">Above 5 Lakhs</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Marks in Last Exam (%) <span className="text-danger">*</span></label>
                        <input 
                           type="number" 
                           placeholder="e.g. 85"
                           value={data.marks}
                           onChange={(e) => setData({...data, marks: e.target.value})}
                           className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                        />
                    </div>
                </div>

                {/* Conditional Loan Section */}
                {data.lookingFor === 'Educational Loan' && (
                  <div className="space-y-8 animate-fade-in pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                        <Landmark size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-text-1">Additional Loan Eligibility Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">10th Marks (%)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 90"
                            value={data.marks10th}
                            onChange={(e) => setData({...data, marks10th: e.target.value})}
                            className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">12th Marks (%)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 88"
                            value={data.marks12th}
                            onChange={(e) => setData({...data, marks12th: e.target.value})}
                            className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Father's Occupation</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Govt Servant"
                            value={data.fatherOccupation}
                            onChange={(e) => setData({...data, fatherOccupation: e.target.value})}
                            className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Mother's Occupation</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Teacher"
                            value={data.motherOccupation}
                            onChange={(e) => setData({...data, motherOccupation: e.target.value})}
                            className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">District</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Bhadrak"
                            value={data.district}
                            onChange={(e) => setData({...data, district: e.target.value})}
                            className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">State</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Odisha"
                            value={data.state}
                            onChange={(e) => setData({...data, state: e.target.value})}
                            className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1 mb-2 block">Preferred Bank</label>
                          <input 
                            type="text" 
                            placeholder="e.g. SBI, UCO"
                            value={data.bankName}
                            onChange={(e) => setData({...data, bankName: e.target.value})}
                            className="w-full h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent outline-none"
                          />
                        </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-8 border-t border-white/5">
                  <button 
                    onClick={checkEligibility}
                    disabled={loading}
                    className="h-14 px-12 bg-gradient-to-r from-accent to-accent-ai text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:scale-100"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {loading ? 'Analyzing Profile...' : 'Check Eligibility'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      );
    }

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
          <h2 className="text-3xl font-extrabold text-text-1">
             {data.lookingFor === 'Scholarship' ? 'Scholarship Results' : 'Educational Loan Results'}
          </h2>
          <p className="text-text-3">Based on your profile, we found {result.length} customized {data.lookingFor === 'Scholarship' ? 'scholarships' : 'loan offers'}.</p>
        </div>

        <div className="space-y-4">
          {result.map((item, idx) => (
            <div key={idx} className={`p-6 rounded-2xl glass border border-white/5 border-l-4 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-6 ${data.lookingFor === 'Scholarship' ? 'border-l-accent' : 'border-l-accent-ai'}`} style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="flex gap-4 items-center w-full sm:w-auto">
                <div className={`w-12 h-12 rounded-xl bg-bg-base border border-border-default flex items-center justify-center ${data.lookingFor === 'Scholarship' ? 'text-accent' : 'text-accent-ai'}`}>
                  {data.lookingFor === 'Scholarship' ? <GraduationCap size={24} /> : <Landmark size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-text-1 leading-tight">{item.name}</h4>
                  <p className="text-xs text-text-3 font-medium flex items-center gap-1 mt-1">
                    <Zap size={12} className="text-success" /> Benefit: <span className="text-success font-bold">{item.benefit}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Match Score</span>
                  <span className={`px-3 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-bold`}>
                    {item.match}
                  </span>
                </div>
                <button 
                  onClick={() => onApply && onApply(item)}
                  className="h-10 px-6 bg-accent text-bg-base text-xs font-bold rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg shadow-accent/20"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl border border-dashed border-border-default bg-bg-surface/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex gap-3 items-center">
              <AlertCircle className="text-accent-ai shrink-0" size={20} />
              <p className="text-xs text-text-2">Verify your documents to proceed with the full application.</p>
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
