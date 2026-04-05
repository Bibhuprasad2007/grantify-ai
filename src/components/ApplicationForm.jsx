import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, GraduationCap, Landmark, ArrowRight, ArrowLeft, 
  Upload, Save, Download, CheckCircle2, FileText, 
  Archive, Sparkles, ChevronRight, Calculator, MapPin,
  Cloud, CloudOff, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Academic Info', icon: GraduationCap },
    { id: 3, label: 'Bank Info', icon: Landmark }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-12 relative">
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
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4
              ${isActive ? 'bg-bg-base border-accent text-accent scale-110 shadow-lg shadow-accent/20' : ''}
              ${isCompleted ? 'bg-success border-success text-bg-base shadow-lg shadow-success/20' : ''}
              ${!isActive && !isCompleted ? 'bg-bg-base border-white/5 text-text-3 group-hover:border-white/20' : ''}
              ${!isActive && isCompleted && !isPast ? 'bg-success/20 border-success text-success' : ''}
            `}>
              {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={20} />}
            </div>
            <span className={`
              absolute -bottom-7 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest transition-colors duration-300
              ${isActive ? 'text-accent' : isCompleted ? 'text-success' : 'text-text-3'}
            `}>
              {step.label} {isCompleted && '✔'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <div className="mb-10 animate-fade-up">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 bg-accent rounded-full" />
      <h3 className="text-lg font-bold text-text-1">{title}</h3>
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
          name={name} value={value} onChange={onChange} disabled={readOnly}
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
                <input type="radio" name={name} value={opt} checked={value === opt} onChange={onChange} disabled={readOnly}
                  className="peer appearance-none w-5 h-5 border-2 border-border-default rounded-full checked:border-accent transition-all cursor-pointer" />
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
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
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
    <div className="relative group min-h-[140px] border-2 border-dashed border-border-default rounded-2xl flex flex-col items-center justify-center p-6 bg-bg-base/30 hover:bg-bg-base/50 hover:border-accent/40 transition-all cursor-pointer">
      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => { const file = e.target.files[0]; if (file) onUpload(file); }}
      />
      {(preview || fileName) ? (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-xl bg-success/20 flex items-center justify-center text-success mb-2 border border-success/30">
            <CheckCircle2 size={32} />
          </div>
          <span className="text-[10px] text-accent font-bold uppercase">File Selected</span>
          <p className="text-[8px] text-text-3 max-w-[150px] truncate">{fileName || (preview && preview.name)}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
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

const ApplicationForm = ({ onBackToDashboard }) => {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [topWarning, setTopWarning] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [appId, setAppId] = useState('');
  
  // File objects
  const [files, setFiles] = useState({
    profilePhoto: null, marksheet: null, certificate: null, passbook: null
  });
  const [uploadedFileNames, setUploadedFileNames] = useState({});
  
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '', category: '', gender: '', religion: '', dob: '', 
    aadhaar: '', mobile: '', altMobile: '', email: '', 
    fatherName: '', motherName: '', guardianName: '',
    district: '', block: '', ward: '', village: '', pinCode: '', address: '',
    academicYear: '2024-25', department: '', scheme: '',

    // Step 2: Academic
    course: '', board: '', passingYear: '', rollNo: '',
    totalMarks: '', securedMarks: '', percentage: '',
    instDistrict: '', instBlock: '', instName: '', branch: '', 
    natureOfCourse: '', courseYear: '', admissionNo: '', admissionDate: '',
    lastCourse: '', lastYear: '', lastMarks: '', lastPercentage: '',

    // Step 3: Bank
    ifsc: '', bankName: '', branchName: '', 
    accHolder: '', accNo: '', confirmAccNo: '',
  });

  // Generate appId
  useEffect(() => {
    setAppId(`SCH-${user.uid.substring(0, 6).toUpperCase()}`);
  }, [user.uid]);

  // Auto calculate percentage
  useEffect(() => {
    if (formData.totalMarks && formData.securedMarks) {
      const perc = ((parseFloat(formData.securedMarks) / parseFloat(formData.totalMarks)) * 100).toFixed(2);
      setFormData(prev => ({ ...prev, percentage: perc }));
    }
  }, [formData.totalMarks, formData.securedMarks]);

  // Auto-fill: Load existing draft
  useEffect(() => {
    if (!user?.uid) return;
    const loadDraft = async () => {
      try {
        const docRef = doc(db, "scholarshipApplications", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const p = data.personalInfo || {};
          const a = data.academicInfo || {};
          const b = data.bankInfo || {};

          setFormData({
            name: p.name || '', category: p.category || '', gender: p.gender || '', religion: p.religion || '',
            dob: p.dob || '', aadhaar: p.aadhaar || '', mobile: p.mobile || '', altMobile: p.altMobile || '',
            email: p.email || '', fatherName: p.fatherName || '', motherName: p.motherName || '',
            guardianName: p.guardianName || '', district: p.district || '', block: p.block || '',
            ward: p.ward || '', village: p.village || '', pinCode: p.pinCode || '', address: p.address || '',
            academicYear: p.academicYear || '2024-25', department: p.department || '', scheme: p.scheme || '',
            course: a.course || '', board: a.board || '', passingYear: a.passingYear || '', rollNo: a.rollNo || '',
            totalMarks: a.totalMarks || '', securedMarks: a.securedMarks || '', percentage: a.percentage || '',
            instDistrict: a.instDistrict || '', instBlock: a.instBlock || '', instName: a.instName || '',
            branch: a.branch || '', natureOfCourse: a.natureOfCourse || '', courseYear: a.courseYear || '',
            admissionNo: a.admissionNo || '', admissionDate: a.admissionDate || '',
            lastCourse: a.lastCourse || '', lastYear: a.lastYear || '', lastMarks: a.lastMarks || '',
            lastPercentage: a.lastPercentage || '',
            ifsc: b.ifsc || '', bankName: b.bankName || '', branchName: b.branchName || '',
            accHolder: b.accHolder || '', accNo: b.accNo || '', confirmAccNo: b.accNo || '',
          });

          if (data.lastStep) setStep(data.lastStep);
          if (data.applicationId) setAppId(data.applicationId);

          const fileNames = {};
          if (p.photoUrl) fileNames.profilePhoto = 'profile_photo (uploaded)';
          if (a.marksheetUrl) fileNames.marksheet = 'marksheet (uploaded)';
          if (a.certificateUrl) fileNames.certificate = 'certificate (uploaded)';
          if (b.passbookUrl) fileNames.passbook = 'passbook (uploaded)';
          setUploadedFileNames(fileNames);

          setSaveStatus('loaded');
          setTimeout(() => setSaveStatus(null), 2000);
        }
      } catch (error) {
        console.error("Error loading scholarship draft:", error);
      }
    };
    loadDraft();
  }, [user?.uid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePersonal = () => {
    const fields = ['name', 'category', 'gender', 'dob', 'aadhaar', 'mobile', 'email', 'district', 'pinCode'];
    const newErrors = {};
    fields.forEach(f => { if (!formData[f]) newErrors[f] = 'This field is required'; });
    return newErrors;
  };

  const validateAcademic = () => {
    const fields = ['course', 'totalMarks', 'securedMarks', 'instName'];
    const newErrors = {};
    fields.forEach(f => { if (!formData[f]) newErrors[f] = 'This field is required'; });
    return newErrors;
  };

  const validateBank = () => {
    const fields = ['ifsc', 'bankName', 'branchName', 'accNo', 'confirmAccNo'];
    const newErrors = {};
    fields.forEach(f => { if (!formData[f]) newErrors[f] = 'This field is required'; });
    if (formData.accNo && formData.confirmAccNo && formData.accNo !== formData.confirmAccNo) {
      newErrors.confirmAccNo = 'Account numbers do not match';
    }
    return newErrors;
  };

  const validateStep = (s) => {
    let newErrors = {};
    if (s === 1) newErrors = validatePersonal();
    else if (s === 2) newErrors = validateAcademic();
    else if (s === 3) newErrors = validateBank();
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepComplete = (s) => {
    if (s === 1) return Object.keys(validatePersonal()).length === 0;
    if (s === 2) return Object.keys(validateAcademic()).length === 0;
    if (s === 3) return Object.keys(validateBank()).length === 0;
    return false;
  };

  const calculateProgress = () => {
    const steps = [1, 2, 3];
    const completed = steps.filter(s => isStepComplete(s)).length;
    return Math.round((completed / 3) * 100);
  };

  // Auto-save to Firestore
  const saveToFirestore = useCallback(async (status = "Draft", currentStep = step) => {
    if (!user?.uid) return;
    setSaveStatus('saving');
    try {
      const dataToSave = {
        applicationId: appId,
        userId: user.uid,
        email: user.email,
        personalInfo: {
          name: formData.name, category: formData.category, gender: formData.gender, religion: formData.religion,
          dob: formData.dob, aadhaar: formData.aadhaar, mobile: formData.mobile, altMobile: formData.altMobile,
          email: formData.email, fatherName: formData.fatherName, motherName: formData.motherName,
          guardianName: formData.guardianName, district: formData.district, block: formData.block,
          ward: formData.ward, village: formData.village, pinCode: formData.pinCode, address: formData.address,
          academicYear: formData.academicYear, department: formData.department, scheme: formData.scheme
        },
        academicInfo: {
          course: formData.course, board: formData.board, passingYear: formData.passingYear, rollNo: formData.rollNo,
          totalMarks: formData.totalMarks, securedMarks: formData.securedMarks, percentage: formData.percentage,
          instDistrict: formData.instDistrict, instBlock: formData.instBlock, instName: formData.instName,
          branch: formData.branch, natureOfCourse: formData.natureOfCourse, courseYear: formData.courseYear,
          admissionNo: formData.admissionNo, admissionDate: formData.admissionDate,
          lastCourse: formData.lastCourse, lastYear: formData.lastYear, lastMarks: formData.lastMarks,
          lastPercentage: formData.lastPercentage,
        },
        bankInfo: {
          ifsc: formData.ifsc, bankName: formData.bankName, branchName: formData.branchName,
          accHolder: formData.accHolder, accNo: formData.accNo
        },
        status: status,
        lastStep: currentStep,
        updatedAt: serverTimestamp()
      };

      const existingDoc = await getDoc(doc(db, "scholarshipApplications", user.uid));
      if (!existingDoc.exists()) {
        dataToSave.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, "scholarshipApplications", user.uid), dataToSave, { merge: true });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [user, formData, appId, step]);

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleNext = () => {
    setTopWarning('');
    if (!validateStep(step)) {
      setTopWarning('Please complete all required fields before continuing');
      return;
    }

    setIsValidating(true);
    const nextStep = step + 1;
    saveToFirestore("Draft", nextStep);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(nextStep);
      setIsValidating(false);
    }, 1200);
  };

  const onStepClick = (targetId) => {
    setTopWarning('');
    if (targetId === step) return;
    if (targetId < step) {
      setStep(targetId);
      return;
    }
    for (let i = 1; i < targetId; i++) {
      if (!isStepComplete(i)) {
        setTopWarning(`Step ${i} must be fully completed before proceeding to Step ${targetId}`);
        setStep(i);
        validateStep(i);
        return;
      }
    }
    setStep(targetId);
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev - 1);
  };

  const handleFetchIFSC = () => {
    if (!formData.ifsc) return;
    setIsSubmitting(true);
    fetch(`https://ifsc.razorpay.com/${formData.ifsc}`)
      .then(res => res.ok ? res.json() : Promise.reject('Invalid'))
      .then(data => {
        setFormData(prev => ({ ...prev, bankName: data.BANK || '', branchName: data.BRANCH || '' }));
        setIsSubmitting(false);
      })
      .catch(() => {
        setFormData(prev => ({ ...prev, bankName: 'Not Found', branchName: 'Not Found' }));
        setIsSubmitting(false);
      });
  };

  const handleDraft = () => {
    saveToFirestore("Draft", step);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    try {
      const basePath = `scholarshipApplications/${user.uid}`;
      const photoUrl = await uploadFile(files.profilePhoto, `${basePath}/profile.jpg`);
      const marksheetUrl = await uploadFile(files.marksheet, `${basePath}/marksheet.pdf`);
      const certificateUrl = await uploadFile(files.certificate, `${basePath}/certificate.pdf`);
      const passbookUrl = await uploadFile(files.passbook, `${basePath}/passbook.pdf`);

      await saveToFirestore("Submitted", 3);

      const fileUrls = {};
      if (photoUrl) fileUrls['personalInfo.photoUrl'] = photoUrl;
      if (marksheetUrl) fileUrls['academicInfo.marksheetUrl'] = marksheetUrl;
      if (certificateUrl) fileUrls['academicInfo.certificateUrl'] = certificateUrl;
      if (passbookUrl) fileUrls['bankInfo.passbookUrl'] = passbookUrl;

      if (Object.keys(fileUrls).length > 0) {
        await setDoc(doc(db, "scholarshipApplications", user.uid), fileUrls, { merge: true });
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error submitting. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById('success-report');
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0F172A' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${appId}_Application.pdf`);
  };

  if (isSuccess) {
    return (
      <div className="max-w-[1000px] mx-auto py-12 px-4 space-y-10 animate-fade-in">
        <div id="success-report" className="p-12 rounded-[3rem] glass border border-white/5 bg-bg-surface text-center">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30 shadow-lg shadow-success/10 animate-scale-pop">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-text-1 mb-2">Application Submitted Successfully 🎉</h1>
          <p className="text-text-3 font-semibold uppercase tracking-widest text-sm mb-10">Your application is now being processed.</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
            <div className="p-4 rounded-2xl bg-bg-base/50 border border-white/5">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Applicant Name</p>
              <p className="text-sm font-bold text-text-1">{formData.name}</p>
            </div>
            <div className="p-4 rounded-2xl bg-bg-base/50 border border-white/5">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Application ID</p>
              <p className="text-sm font-bold text-accent font-mono">{appId}</p>
            </div>
            <div className="p-4 rounded-2xl bg-bg-base/50 border border-white/5">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Submitted Date</p>
              <p className="text-sm font-bold text-text-1">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-bg-base/50 border border-white/5">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />
                <p className="text-xs font-bold text-warning">Under Review</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={generatePDF} className="group flex items-center gap-3 px-6 py-3 bg-bg-elevated border border-border-default rounded-xl text-sm font-bold text-text-1 hover:border-accent/40 transition-all hover:shadow-xl">
                <FileText size={18} className="text-accent group-hover:scale-110 transition-transform" />
                Application PDF
              </button>
            </div>
            <div className="pt-10 flex gap-4">
              <button onClick={onBackToDashboard} className="px-8 py-3 bg-accent text-bg-base rounded-xl text-sm font-bold hover:bg-white hover:shadow-accent-glow transition-all">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto py-12 px-4 pb-32 overflow-hidden">
      <AutoSaveToast status={saveStatus} />

      <div className="flex items-center justify-between mb-12">
        <div>
          <button onClick={onBackToDashboard} className="flex items-center gap-2 text-text-3 hover:text-text-1 text-sm font-bold transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-heading font-extrabold text-text-1 tracking-tight">Scholarship <span className="text-accent">Application</span></h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-text-3 text-sm font-semibold uppercase tracking-widest">ID: {appId}</p>
            <div className="flex-1 w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-success transition-all duration-700" style={{ width: `${calculateProgress()}%` }} />
            </div>
            <span className="text-[10px] font-bold text-success uppercase">{calculateProgress()}% Complete</span>
          </div>
        </div>
        <div className="hidden sm:block">
           <div className="flex items-center gap-3 px-4 py-2 bg-accent/10 border border-accent/30 rounded-xl text-accent text-xs font-bold">
              <Sparkles size={14} /> AI VALIDATION ACTIVE
           </div>
        </div>
      </div>

      <Stepper 
        currentStep={step} 
        onStepClick={onStepClick}
        stepStatus={{
          1: isStepComplete(1),
          2: isStepComplete(2),
          3: isStepComplete(3)
        }}
      />

      {topWarning && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-2xl flex items-center gap-3 text-danger animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center shrink-0">!</div>
          <p className="text-sm font-bold">{topWarning}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 lg:p-12 glass border border-white/5 rounded-[3rem] bg-bg-surface/50 relative overflow-hidden">
        {isValidating && <div className="scan-overlay" />}
        
        {step === 1 && (
          <div className="animate-slide-in-right">
            <FormSection title="Basic Information">
              <InputField label="Applicant Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="As per Aadhaar" required errors={errors} />
              <InputField label="Category" name="category" type="select" options={['General', 'OBC', 'SC', 'ST', 'EWS']} value={formData.category} onChange={handleInputChange} required errors={errors} />
              <InputField label="Gender" name="gender" radio options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleInputChange} required errors={errors} />
              <InputField label="Religion" name="religion" value={formData.religion} onChange={handleInputChange} placeholder="Hinduism, Islam, etc." errors={errors} />
              <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required errors={errors} />
              <InputField label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} placeholder="XXXX-XXXX-XXXX" required errors={errors} />
              <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+91" required errors={errors} />
              <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="alex@domain.com" required errors={errors} />
              <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} errors={errors} />
              <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} errors={errors} />
              <UploadComponent label="Profile Photo" desc="Clear face photo (Max 1MB)" onUpload={(f) => setFiles(p => ({ ...p, profilePhoto: f }))} preview={files.profilePhoto} fileName={uploadedFileNames.profilePhoto} />
            </FormSection>

            <FormSection title="Address Information">
              <InputField label="District" name="district" value={formData.district} onChange={handleInputChange} placeholder="Enter district" required errors={errors} />
              <InputField label="Block / ULB" name="block" value={formData.block} onChange={handleInputChange} errors={errors} />
              <InputField label="GP / Ward" name="ward" value={formData.ward} onChange={handleInputChange} errors={errors} />
              <InputField label="Village" name="village" value={formData.village} onChange={handleInputChange} errors={errors} />
              <InputField label="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="XXXXXX" required errors={errors} />
              <div className="md:col-span-2">
                <InputField label="Full Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Door No, Street Name, etc." errors={errors} />
              </div>
            </FormSection>

            <FormSection title="Other Details">
              <InputField label="Academic Year" name="academicYear" type="select" options={['2023-24', '2024-25', '2025-26']} value={formData.academicYear} onChange={handleInputChange} errors={errors} />
              <InputField label="Department" name="department" value={formData.department} onChange={handleInputChange} placeholder="e.g. Higher Education" errors={errors} />
              <InputField label="Scheme" name="scheme" value={formData.scheme} onChange={handleInputChange} placeholder="Select Scholarship Scheme" errors={errors} />
            </FormSection>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-in-right">
             <FormSection title="Educational Qualification">
               <InputField label="Course / Degree" name="course" value={formData.course} onChange={handleInputChange} placeholder="e.g Bachelor of Tech" required errors={errors} />
               <InputField label="Board / University" name="board" value={formData.board} onChange={handleInputChange} errors={errors} />
               <InputField label="Passing Year" name="passingYear" value={formData.passingYear} onChange={handleInputChange} placeholder="YYYY" errors={errors} />
               <InputField label="Roll Number" name="rollNo" value={formData.rollNo} onChange={handleInputChange} errors={errors} />
               <InputField label="Total Marks" name="totalMarks" type="number" value={formData.totalMarks} onChange={handleInputChange} required errors={errors} />
               <InputField label="Secured Marks" name="securedMarks" type="number" value={formData.securedMarks} onChange={handleInputChange} required errors={errors} />
               <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent"><Calculator size={16} /></div>
                   <span className="text-[11px] font-extrabold uppercase text-text-2 tracking-wider">Calculated Percentage</span>
                 </div>
                 <span className="text-xl font-mono font-bold text-accent">{formData.percentage || '0.00'}%</span>
               </div>
             </FormSection>

             <FormSection title="Institute Information">
               <InputField label="Institute District" name="instDistrict" value={formData.instDistrict} onChange={handleInputChange} errors={errors} />
               <InputField label="Institute Name" name="instName" value={formData.instName} onChange={handleInputChange} placeholder="Select your college" required errors={errors} />
               <InputField label="Admission Number" name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} errors={errors} />
               <InputField label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleInputChange} errors={errors} />
             </FormSection>

             <FormSection title="Document Upload">
                <UploadComponent label="Upload Marksheet" desc="Recent marksheet (PDF or JPG)" onUpload={(f) => setFiles(p => ({ ...p, marksheet: f }))} preview={files.marksheet} fileName={uploadedFileNames.marksheet} />
                <UploadComponent label="Certificate" desc="Caste or Income Certificate" onUpload={(f) => setFiles(p => ({ ...p, certificate: f }))} preview={files.certificate} fileName={uploadedFileNames.certificate} icon={Archive} />
             </FormSection>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-in-right">
            <FormSection title="💳 Bank Information">
              <div className="flex flex-col gap-2 relative">
                <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider ml-1">IFSC Code <span className="text-danger">*</span></label>
                <div className="flex gap-2">
                  <input name="ifsc" value={formData.ifsc} onChange={handleInputChange}
                    className="flex-1 h-12 bg-bg-base border border-border-default rounded-xl px-4 text-sm text-text-1 focus:border-accent/40 focus:ring-1 focus:ring-accent/40 outline-none" placeholder="SBINXXXXXXX" />
                  <button type="button" onClick={handleFetchIFSC} className="px-6 bg-accent/10 border border-accent/20 rounded-xl text-accent text-xs font-extrabold hover:bg-accent hover:text-bg-base transition-all active:scale-95">
                    Fetch
                  </button>
                </div>
              </div>
              <InputField label="Bank Name (auto)" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="..." required readOnly errors={errors} />
              <InputField label="Branch Name (auto)" name="branchName" value={formData.branchName} onChange={handleInputChange} placeholder="..." required readOnly errors={errors} />
              <InputField label="Account Number" name="accNo" type="password" value={formData.accNo} onChange={handleInputChange} placeholder="Enter account number" required errors={errors} />
              <InputField label="Confirm Account Number" name="confirmAccNo" value={formData.confirmAccNo} onChange={handleInputChange} placeholder="Re-enter account number" required errors={errors} />
            </FormSection>

            <FormSection title="📄 Upload Passbook">
               <div className="md:col-span-2">
                <UploadComponent label="Bank Passbook / Cancelled Cheque" desc="Clear copy of first page (Max 2MB)" onUpload={(f) => setFiles(p => ({ ...p, passbook: f }))} preview={files.passbook} fileName={uploadedFileNames.passbook} icon={Landmark} />
               </div>
            </FormSection>

            <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 mb-10 flex gap-4 items-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">i</div>
              <p className="text-xs text-text-2 font-medium">Please ensure the bank account is <span className="text-accent font-bold">Aadhaar Linked</span> for Direct Benefit Transfer.</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="flex gap-4">
             {step > 1 && (
               <button type="button" onClick={handleBack} className="h-12 px-6 rounded-xl border border-border-default text-text-1 text-sm font-bold flex items-center gap-2 hover:bg-bg-elevated transition-colors">
                 <ArrowLeft size={18} /> Back
               </button>
             )}
             <button type="button" onClick={handleDraft} className="h-12 px-6 rounded-xl border border-border-default text-text-1 text-sm font-bold flex items-center gap-2 hover:text-accent hover:border-accent/30 transition-all">
                 <Save size={18} /> Save Draft
             </button>
          </div>
          
          {step < 3 ? (
            <button 
              type="button" onClick={handleNext} disabled={isValidating || !isStepComplete(step)}
              className={`w-full sm:w-auto h-12 px-10 rounded-xl bg-accent text-bg-base text-sm font-bold flex items-center gap-2 justify-center hover:bg-white hover:shadow-accent-glow transition-all
                ${(isValidating || !isStepComplete(step)) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              {isValidating ? (
                <><div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" /> AI Validating Step {step}...</>
              ) : (
                <>Next Step <ArrowRight size={18} /></>
              )}
            </button>
          ) : (
            <button 
              type="submit" disabled={isSubmitting || !isStepComplete(3) || !isStepComplete(2) || !isStepComplete(1)}
              className={`w-full sm:w-auto h-12 px-12 rounded-xl bg-gradient-to-r from-accent to-accent-ai text-white text-sm font-extrabold flex items-center gap-2 justify-center hover:shadow-xl hover:shadow-accent/20 transition-all
                ${(isSubmitting || !isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3)) ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading to Firebase...</>
              ) : (
                <>Submit <Sparkles size={18} /></>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
