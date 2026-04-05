import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, GraduationCap, Landmark, ArrowRight, ArrowLeft, 
  Upload, Save, Download, CheckCircle2, FileText, 
  Archive, Sparkles, ChevronRight, Calculator, MapPin,
  Users, DollarSign, Building2, Briefcase, Info, BadgeDollarSign,
  CloudOff, Cloud, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';

// Firebase Imports
import { db, storage } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useUser } from '../context/UserContext';

// --- Auto-save Toast ---
const AutoSaveToast = ({ status }) => {
  if (!status) return null;
  const configs = {
    saving:  { icon: Loader2, text: 'Saving...', color: 'text-warning', spin: true },
    saved:   { icon: Cloud, text: 'Auto Saved ✅', color: 'text-success', spin: false },
    error:   { icon: CloudOff, text: 'Save Failed', color: 'text-danger', spin: false },
    loaded:  { icon: CheckCircle2, text: 'Draft Loaded', color: 'text-accent', spin: false },
  };
  const config = configs[status];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 shadow-2xl animate-fade-up ${config.color}`}>
      <Icon size={16} className={config.spin ? 'animate-spin' : ''} />
      <span className="text-xs font-bold">{config.text}</span>
    </div>
  );
};

// --- Reusable Components ---

const Stepper = ({ currentStep, onStepClick, stepStatus }) => {
  const steps = [
    { id: 1, label: 'Personal', icon: User },
    { id: 2, label: 'Family / Income', icon: Users },
    { id: 3, label: 'Academic', icon: GraduationCap },
    { id: 4, label: 'Bank + Loan', icon: Landmark }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-12 relative px-4">
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0" />
      <div 
        className="absolute top-1/2 left-0 h-[2px] bg-accent -translate-y-1/2 z-0 transition-all duration-500 shadow-accent-glow" 
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />
      
      {steps.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = stepStatus[step.id];
        const isPast = currentStep > step.id;
        const Icon = step.icon;

        return (
          <div 
            key={step.id} 
            className={`relative z-10 flex flex-col items-center cursor-pointer group`}
            onClick={() => onStepClick(step.id)}
          >
            <div className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4
              ${isActive ? 'bg-bg-base border-accent text-accent scale-110 shadow-lg shadow-accent/20' : ''}
              ${isCompleted ? 'bg-success border-success text-bg-base shadow-lg shadow-success/20' : ''}
              ${!isActive && !isCompleted ? 'bg-bg-base border-white/5 text-text-3 group-hover:border-white/20' : ''}
              ${!isActive && isCompleted && !isPast ? 'bg-success/20 border-success text-success' : ''}
            `}>
              {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={20} />}
            </div>
            <span className={`
              absolute -bottom-8 whitespace-nowrap text-[9px] font-bold uppercase tracking-widest transition-colors duration-300
              ${isActive ? 'text-accent' : isCompleted ? 'text-success' : 'text-text-3'}
            `}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const FormSection = ({ title, children, icon: Icon }) => (
  <div className="mb-10 animate-fade-up">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
        <Icon size={18} />
      </div>
      <h3 className="text-xl font-bold text-text-1">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const InputField = ({ label, type = "text", placeholder, name, value, onChange, required, options, radio, readOnly, errors = {} }) => {
  if (type === "select") {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <select 
          name={name}
          value={value}
          onChange={onChange}
          disabled={readOnly}
          className={`h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }

  if (radio) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <div className={`flex items-center gap-6 h-12 ${readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name={name} 
                  value={opt} 
                  checked={value === opt} 
                  onChange={onChange}
                  disabled={readOnly}
                  className="peer appearance-none w-5 h-5 border-2 border-border-default rounded-full checked:border-accent transition-all cursor-pointer" 
                />
                <div className="absolute w-2.5 h-2.5 bg-accent rounded-full scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-sm text-text-2 group-hover:text-text-1 transition-colors">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        {errors && errors[name] && <span className="text-[9px] font-bold text-danger animate-pulse uppercase tracking-widest">Required</span>}
      </div>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`
          h-12 bg-bg-base border rounded-xl px-4 text-sm text-text-1 placeholder:text-text-3 focus:outline-none transition-all
          ${errors && errors[name] ? 'border-danger/50 shadow-sm shadow-danger/10' : 'border-border-default'}
          ${readOnly ? 'opacity-70 bg-bg-base/50 border-border-default' : 'focus:border-accent/40 focus:ring-1 focus:ring-accent/40'}
        `}
      />
    </div>
  );
};

const UploadComponent = ({ label, desc, onUpload, preview, fileName, icon: Icon = Upload }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group min-h-[140px] border-2 border-dashed border-border-default rounded-2xl flex flex-col items-center justify-center p-6 bg-bg-base/30 hover:bg-bg-base/50 hover:border-accent/40 transition-all cursor-pointer overflow-hidden">
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            onUpload(file);
          }
        }}
      />
      {(preview || fileName) ? (
        <div className="flex flex-col items-center animate-fade-in z-0">
          <div className="w-16 h-16 rounded-xl bg-success/20 flex items-center justify-center text-success mb-2 border border-success/30">
             <CheckCircle2 size={32} />
          </div>
          <span className="text-[10px] text-accent font-bold uppercase">File Selected</span>
          <p className="text-[8px] text-text-3 max-w-[150px] truncate">{fileName || (preview && preview.name)}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center z-0">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3 group-hover:scale-110 transition-transform">
            <Icon size={20} />
          </div>
          <p className="text-sm font-bold text-text-1 mb-1">Click to upload</p>
          <p className="text-[10px] text-text-3 font-medium">{desc || 'JPG, PNG or PDF (Max 2MB)'}</p>
        </div>
      )}
    </div>
  </div>
);

// --- Main Form Component ---

const LoanForm = ({ onBackToDashboard }) => {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [topWarning, setTopWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [appId, setAppId] = useState('');
  
  // File objects (not saved to Firestore directly)
  const [files, setFiles] = useState({
    profilePhoto: null, incomeCert: null, salarySlip: null,
    admissionLetter: null, feeStructure: null, passbook: null
  });
  // File names from previously uploaded files (from Firestore)
  const [uploadedFileNames, setUploadedFileNames] = useState({});

  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '', dob: '', gender: '', category: '', aadhaar: '', pan: '', mobile: '', email: '',
    // Step 2: Family
    fatherName: '', motherName: '', guardianName: '', parentOccupation: '', employer: '', annualIncome: '',
    // Step 3: Academic
    lastQual: '', board: '', passingYear: '', marks: '', courseName: '', stream: '', collegeName: '', collegeType: '', admissionNo: '', admissionDate: '',
    // Step 4: Bank/Loan
    holderName: '', accNo: '', confirmAccNo: '', ifsc: '', bankName: '', branchName: '',
    loanAmount: '', tuitionFee: '', hostelFee: '', otherExpenses: ''
  });

  // Generate or restore appId
  useEffect(() => {
    setAppId(`LOAN-${user.uid.substring(0, 6).toUpperCase()}`);
  }, [user.uid]);

  // Auto-fill: Load existing draft on mount
  useEffect(() => {
    if (!user?.uid) return;
    const loadDraft = async () => {
      try {
        const docRef = doc(db, "loanApplications", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const p = data.personalInfo || {};
          const f = data.familyInfo || {};
          const a = data.academicInfo || {};
          const b = data.bankLoanInfo || {};
          
          setFormData({
            name: p.name || '', dob: p.dob || '', gender: p.gender || '', category: p.category || '',
            aadhaar: p.aadhaar || '', pan: p.pan || '', mobile: p.mobile || '', email: p.email || '',
            fatherName: f.fatherName || '', motherName: f.motherName || '', guardianName: f.guardianName || '',
            parentOccupation: f.parentOccupation || '', employer: f.employer || '', annualIncome: f.annualIncome || '',
            lastQual: a.lastQual || '', board: a.board || '', passingYear: a.passingYear || '',
            marks: a.marks || '', courseName: a.courseName || '', stream: a.stream || '',
            collegeName: a.collegeName || '', collegeType: a.collegeType || '', admissionNo: a.admissionNo || '',
            admissionDate: a.admissionDate || '',
            holderName: b.holderName || '', accNo: b.accNo || '', confirmAccNo: b.accNo || '',
            ifsc: b.ifsc || '', bankName: b.bankName || '', branchName: b.branchName || '',
            loanAmount: b.loanAmount || '', tuitionFee: b.tuitionFee || '', hostelFee: b.hostelFee || '',
            otherExpenses: b.otherExpenses || ''
          });

          if (data.lastStep) setStep(data.lastStep);
          if (data.applicationId) setAppId(data.applicationId);

          // Restore file names for UI
          const fileNames = {};
          if (p.photoUrl) fileNames.profilePhoto = 'profile_photo (uploaded)';
          if (f.incomeCertUrl) fileNames.incomeCert = 'income_cert (uploaded)';
          if (f.salarySlipUrl) fileNames.salarySlip = 'salary_slip (uploaded)';
          if (a.admissionUrl) fileNames.admissionLetter = 'admission_letter (uploaded)';
          if (a.feeUrl) fileNames.feeStructure = 'fee_structure (uploaded)';
          if (b.passbookUrl) fileNames.passbook = 'passbook (uploaded)';
          setUploadedFileNames(fileNames);

          setSaveStatus('loaded');
          setTimeout(() => setSaveStatus(null), 2000);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };
    loadDraft();
  }, [user?.uid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateStep = (s, updateState = true) => {
    const newErrors = {};
    const stepFields = {
      1: ['name', 'dob', 'gender', 'category', 'aadhaar', 'mobile', 'email'],
      2: ['fatherName', 'motherName', 'parentOccupation', 'annualIncome'],
      3: ['lastQual', 'board', 'passingYear', 'marks', 'courseName', 'collegeName', 'admissionNo'],
      4: ['holderName', 'accNo', 'confirmAccNo', 'ifsc', 'loanAmount', 'tuitionFee']
    };

    if (stepFields[s]) {
      stepFields[s].forEach(field => {
        if (!formData[field]) newErrors[field] = 'Required';
      });
    }

    if (s === 4 && formData.accNo !== formData.confirmAccNo) {
      newErrors.confirmAccNo = 'Account numbers do not match';
    }

    if (updateState) {
      setErrors(newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  // Auto-save to Firestore (merge)
  const saveToFirestore = useCallback(async (status = "Draft", currentStep = step) => {
    if (!user?.uid) return;
    setSaveStatus('saving');
    try {
      const dataToSave = {
        applicationId: appId,
        userId: user.uid,
        email: user.email,
        personalInfo: {
          name: formData.name, dob: formData.dob, gender: formData.gender,
          category: formData.category, aadhaar: formData.aadhaar, pan: formData.pan,
          mobile: formData.mobile, email: formData.email
        },
        familyInfo: {
          fatherName: formData.fatherName, motherName: formData.motherName,
          guardianName: formData.guardianName, parentOccupation: formData.parentOccupation,
          employer: formData.employer, annualIncome: formData.annualIncome
        },
        academicInfo: {
          lastQual: formData.lastQual, board: formData.board, passingYear: formData.passingYear,
          marks: formData.marks, courseName: formData.courseName, stream: formData.stream,
          collegeName: formData.collegeName, collegeType: formData.collegeType,
          admissionNo: formData.admissionNo, admissionDate: formData.admissionDate
        },
        bankLoanInfo: {
          holderName: formData.holderName, accNo: formData.accNo, ifsc: formData.ifsc,
          bankName: formData.bankName, branchName: formData.branchName,
          loanAmount: formData.loanAmount, tuitionFee: formData.tuitionFee,
          hostelFee: formData.hostelFee, otherExpenses: formData.otherExpenses
        },
        status: status,
        lastStep: currentStep,
        updatedAt: serverTimestamp()
      };

      // Only add createdAt on first save
      const existingDoc = await getDoc(doc(db, "loanApplications", user.uid));
      if (!existingDoc.exists()) {
        dataToSave.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, "loanApplications", user.uid), dataToSave, { merge: true });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [user, formData, appId, step]);

  const handleNext = () => {
    if (validateStep(step)) {
      setIsValidating(true);
      const nextStep = step + 1;
      saveToFirestore("Draft", nextStep);
      setTimeout(() => {
        setStep(nextStep);
        setIsValidating(false);
        window.scrollTo(0, 0);
      }, 1000);
    } else {
      setTopWarning('Please complete all required fields');
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSaveDraft = () => {
    saveToFirestore("Draft", step);
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // 1. Upload files
      const basePath = `loanApplications/${user.uid}`;
      const photoUrl = await uploadFile(files.profilePhoto, `${basePath}/profile.jpg`);
      const incomeCertUrl = await uploadFile(files.incomeCert, `${basePath}/income_cert.pdf`);
      const salarySlipUrl = await uploadFile(files.salarySlip, `${basePath}/salary_slip.pdf`);
      const admissionUrl = await uploadFile(files.admissionLetter, `${basePath}/admission.pdf`);
      const feeUrl = await uploadFile(files.feeStructure, `${basePath}/fee_structure.pdf`);
      const passbookUrl = await uploadFile(files.passbook, `${basePath}/passbook.pdf`);

      // 2. Build file URLs object (only non-null)
      const fileUrls = {};
      if (photoUrl) fileUrls['personalInfo.photoUrl'] = photoUrl;
      if (incomeCertUrl) fileUrls['familyInfo.incomeCertUrl'] = incomeCertUrl;
      if (salarySlipUrl) fileUrls['familyInfo.salarySlipUrl'] = salarySlipUrl;
      if (admissionUrl) fileUrls['academicInfo.admissionUrl'] = admissionUrl;
      if (feeUrl) fileUrls['academicInfo.feeUrl'] = feeUrl;
      if (passbookUrl) fileUrls['bankLoanInfo.passbookUrl'] = passbookUrl;

      // 3. Final save with status = Submitted
      await saveToFirestore("Submitted", 4);
      
      // 4. Merge file URLs
      if (Object.keys(fileUrls).length > 0) {
        await setDoc(doc(db, "loanApplications", user.uid), fileUrls, { merge: true });
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error submitting application. Please check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchIFSC = () => {
    if (!formData.ifsc) return;
    setIsValidating(true);
    // Real fetch from Razorpay IFSC API
    fetch(`https://ifsc.razorpay.com/${formData.ifsc}`)
      .then(res => res.ok ? res.json() : Promise.reject('Invalid IFSC'))
      .then(data => {
        setFormData(prev => ({ ...prev, bankName: data.BANK || '', branchName: data.BRANCH || '' }));
        setIsValidating(false);
      })
      .catch(() => {
        setFormData(prev => ({ ...prev, bankName: 'Not Found', branchName: 'Not Found' }));
        setIsValidating(false);
      });
  };

  const generatePDF = () => {
    const doc2 = new jsPDF();
    doc2.setFontSize(22);
    doc2.text("Loan Application Summary", 20, 20);
    doc2.setFontSize(12);
    doc2.text(`Application ID: ${appId}`, 20, 35);
    doc2.text(`Applicant Name: ${formData.name}`, 20, 45);
    doc2.text(`Email: ${formData.email}`, 20, 55);
    doc2.text(`Loan Amount: ₹${formData.loanAmount}`, 20, 65);
    doc2.text(`Status: Submitted - Under Review`, 20, 75);
    doc2.text(`Date: ${new Date().toLocaleDateString()}`, 20, 85);
    doc2.save(`Loan_App_${appId}.pdf`);
  };

  if (isSuccess) {
    return (
      <div className="max-w-[1200px] mx-auto py-20 px-4 min-h-screen">
        <div className="glass-card rounded-[3rem] p-12 text-center relative overflow-hidden animate-fade-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-emerald-500" />
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto mb-8 shadow-xl shadow-success/10 animate-scale-pop">
            <CheckCircle2 size={50} />
          </div>
          <h2 className="text-4xl font-heading font-extrabold text-white mb-4">Application Submitted!</h2>
          <p className="text-text-3 text-lg mb-8 max-w-lg mx-auto">Your loan application has been received and is currently under review. You can track the status in your dashboard.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            <div className="p-6 bg-bg-base/40 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Application ID</p>
              <p className="text-lg font-mono font-bold text-accent">{appId}</p>
            </div>
            <div className="p-6 bg-bg-base/40 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Current Status</p>
              <p className="text-lg font-bold text-warning uppercase">Under Review</p>
            </div>
            <div className="p-6 bg-bg-base/40 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Time Period</p>
              <p className="text-lg font-bold text-text-1">24-48 Hours</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
             <button onClick={generatePDF} className="h-14 px-8 rounded-xl bg-bg-elevated border border-border-default text-text-1 font-bold flex items-center gap-2 hover:border-accent/40 transition-all">
               <Download size={20} /> Download PDF
             </button>
             <button onClick={onBackToDashboard} className="h-14 px-10 rounded-xl bg-accent text-bg-base font-bold flex items-center gap-2 hover:bg-white hover:shadow-accent-glow transition-all">
               Return to Dashboard <ArrowRight size={20} />
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4 pb-32">
      <AutoSaveToast status={saveStatus} />

      <div className="flex items-center justify-between mb-8">
        <div>
           <button onClick={onBackToDashboard} className="flex items-center gap-2 text-text-3 hover:text-text-1 text-sm font-bold transition-colors mb-4">
             <ArrowLeft size={16} /> Back to Dashboard
           </button>
           <h2 className="text-3xl font-heading font-extrabold text-white">Loan <span className="text-accent">Application</span></h2>
           <p className="text-text-3 text-sm font-mono mt-1">REF: {appId}</p>
        </div>
        <div className="hidden sm:block">
           <div className="px-5 py-2.5 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-xs font-bold flex items-center gap-2">
             <BadgeDollarSign size={16} /> INSTANT DISBURSEMENT ELIGIBLE
           </div>
        </div>
      </div>

      <Stepper stepStatus={{
        1: step > 1 || validateStep(1, false),
        2: step > 2 || validateStep(2, false),
        3: step > 3 || validateStep(3, false),
        4: step > 4 || validateStep(4, false)
      }} currentStep={step} onStepClick={setStep} />

      <form className="p-8 lg:p-12 glass rounded-[3rem] border border-white/5 bg-bg-surface/50 relative overflow-hidden">
         {isValidating && <div className="scan-overlay" />}

         {step === 1 && (
           <div className="animate-slide-in-right">
              <FormSection title="Personal Information" icon={User}>
                <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" required errors={errors} />
                <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required errors={errors} />
                <InputField label="Gender" name="gender" radio options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleInputChange} required errors={errors} />
                <InputField label="Category" name="category" type="select" options={['General', 'OBC', 'SC', 'ST', 'EWS']} value={formData.category} onChange={handleInputChange} required errors={errors} />
                <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} placeholder="XXXX XXXX XXXX" required errors={errors} />
                <InputField label="PAN Number" name="pan" value={formData.pan} onChange={handleInputChange} placeholder="ABCDE1234F" errors={errors} />
                <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+91" required errors={errors} />
                <InputField label="Email Address" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@email.com" required errors={errors} />
                <div className="md:col-span-2">
                  <UploadComponent label="Profile Photo" onUpload={(f) => setFiles(p => ({...p, profilePhoto: f}))} preview={files.profilePhoto} fileName={uploadedFileNames.profilePhoto} />
                </div>
              </FormSection>
           </div>
         )}

         {step === 2 && (
           <div className="animate-slide-in-right">
              <FormSection title="Family & Income" icon={Users}>
                <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required errors={errors} />
                <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} required errors={errors} />
                <InputField label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleInputChange} />
                <InputField label="Occupation" name="parentOccupation" value={formData.parentOccupation} onChange={handleInputChange} required errors={errors} />
                <InputField label="Employer Details" name="employer" value={formData.employer} onChange={handleInputChange} />
                <InputField label="Annual Income" name="annualIncome" type="number" value={formData.annualIncome} onChange={handleInputChange} required errors={errors} />
                <UploadComponent label="Income Certificate" onUpload={(f) => setFiles(p => ({...p, incomeCert: f}))} preview={files.incomeCert} fileName={uploadedFileNames.incomeCert} />
                <UploadComponent label="Salary Slip (3 months)" onUpload={(f) => setFiles(p => ({...p, salarySlip: f}))} preview={files.salarySlip} fileName={uploadedFileNames.salarySlip} />
              </FormSection>
           </div>
         )}

         {step === 3 && (
           <div className="animate-slide-in-right">
              <FormSection title="Academic Details" icon={GraduationCap}>
                <InputField label="Last Qualification" name="lastQual" value={formData.lastQual} onChange={handleInputChange} required errors={errors} />
                <InputField label="Board / University" name="board" value={formData.board} onChange={handleInputChange} required errors={errors} />
                <InputField label="Passing Year" name="passingYear" value={formData.passingYear} onChange={handleInputChange} required errors={errors} />
                <InputField label="Marks / CGPA" name="marks" value={formData.marks} onChange={handleInputChange} required errors={errors} />
                <InputField label="Course Name" name="courseName" value={formData.courseName} onChange={handleInputChange} required errors={errors} />
                <InputField label="Stream / Branch" name="stream" value={formData.stream} onChange={handleInputChange} errors={errors} />
                <InputField label="College Name" name="collegeName" value={formData.collegeName} onChange={handleInputChange} required errors={errors} />
                <InputField label="College Type" name="collegeType" type="select" options={['Government', 'Private', 'Autonomous']} value={formData.collegeType} onChange={handleInputChange} errors={errors} />
                <InputField label="Admission Number" name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} required errors={errors} />
                <InputField label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleInputChange} errors={errors} />
                <UploadComponent label="Admission Letter" onUpload={(f) => setFiles(p => ({...p, admissionLetter: f}))} preview={files.admissionLetter} fileName={uploadedFileNames.admissionLetter} />
                <UploadComponent label="Fee Structure" onUpload={(f) => setFiles(p => ({...p, feeStructure: f}))} preview={files.feeStructure} fileName={uploadedFileNames.feeStructure} />
              </FormSection>
           </div>
         )}

         {step === 4 && (
           <div className="animate-slide-in-right">
              <FormSection title="Bank & Loan Information" icon={Landmark}>
                <InputField label="Account Holder Name" name="holderName" value={formData.holderName} onChange={handleInputChange} required errors={errors} />
                <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                  <InputField label="Account Number" name="accNo" type="password" value={formData.accNo} onChange={handleInputChange} required errors={errors} />
                  <InputField label="Confirm Account" name="confirmAccNo" value={formData.confirmAccNo} onChange={handleInputChange} required errors={errors} />
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">IFSC Code <span className="text-danger">*</span></label>
                  <div className="flex gap-2">
                    <input name="ifsc" value={formData.ifsc} onChange={handleInputChange} className="flex-1 h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 outline-none" />
                    <button type="button" onClick={handleFetchIFSC} className="px-6 bg-accent/20 rounded-xl text-accent font-bold text-xs uppercase">Fetch</button>
                  </div>
                </div>
                <InputField label="Bank Name" name="bankName" value={formData.bankName} readOnly placeholder="Auto-fetched" errors={errors} />
                <InputField label="Branch Name" name="branchName" value={formData.branchName} readOnly placeholder="Auto-fetched" errors={errors} />
                <div className="md:col-span-2">
                   <UploadComponent label="Bank Passbook / Cheque" onUpload={(f) => setFiles(p => ({...p, passbook: f}))} preview={files.passbook} fileName={uploadedFileNames.passbook} icon={Landmark} />
                </div>
              </FormSection>

              <FormSection title="Loan Details" icon={DollarSign}>
                 <InputField label="Loan Amount Required" name="loanAmount" type="number" value={formData.loanAmount} onChange={handleInputChange} required errors={errors} />
                 <InputField label="Tuition Fee" name="tuitionFee" type="number" value={formData.tuitionFee} onChange={handleInputChange} required errors={errors} />
                 <InputField label="Hostel Fee" name="hostelFee" type="number" value={formData.hostelFee} onChange={handleInputChange} errors={errors} />
                 <InputField label="Other Expenses" name="otherExpenses" type="number" value={formData.otherExpenses} onChange={handleInputChange} errors={errors} />
              </FormSection>
           </div>
         )}

         {/* Footer Nav */}
         <div className="mt-12 flex flex-col sm:flex-row justify-between gap-4 pt-10 border-t border-white/5">
            <div className="flex gap-4">
               {step > 1 && (
                 <button type="button" onClick={handleBack} className="h-12 px-8 rounded-xl border border-border-default text-text-1 font-bold flex items-center gap-2 hover:bg-white/5 transition-all">
                   <ArrowLeft size={18} /> Back
                 </button>
               )}
               <button type="button" onClick={handleSaveDraft} className="h-12 px-8 rounded-xl border border-border-default text-text-3 font-bold flex items-center gap-2 hover:text-accent hover:border-accent/30 transition-all">
                 <Save size={18} /> Save Draft
               </button>
            </div>

            {step < 4 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={isValidating}
                className="w-full sm:w-auto h-12 px-12 rounded-xl bg-accent text-bg-base font-bold flex items-center gap-2 justify-center hover:bg-white hover:shadow-accent-glow transition-all"
              >
                {isValidating ? 'Validating...' : <>Next Step <ArrowRight size={18} /></>}
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-14 px-16 rounded-2xl bg-gradient-to-r from-accent to-accent-ai text-white font-extrabold flex items-center gap-2 justify-center hover:shadow-2xl hover:shadow-accent/20 transition-all shadow-xl"
              >
                {isSubmitting ? 'Uploading to Firebase...' : <>Submit Application <Sparkles size={18} /></>}
              </button>
            )}
         </div>
      </form>
    </div>
  );
};

export default LoanForm;
