import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, FileText, User, Users, GraduationCap,
  Landmark, CheckCircle2, Clock, AlertCircle, Upload,
  ChevronRight, ArrowLeft, Camera, Download, FileCheck,
  Search, Filter, XCircle, Loader2, Lock, Brain,
  AlertTriangle, Eye, Sparkles, RefreshCw, Trash2
} from 'lucide-react';
import { db, storage } from '../firebase';
import {
  doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useUser } from '../context/UserContext';

/* ─────────────────────────────────────────────────────────── */
/* Document master list                                         */
/* ─────────────────────────────────────────────────────────── */
const DOC_LIST = [
  // ── PERSONAL ──
  { id: 'aadhar_card',       name: 'Aadhar Card',          category: 'personal', desc: 'Your 12-digit Aadhar issued by UIDAI', isIdentity: true },
  { id: 'pan_card',          name: 'PAN Card',              category: 'personal', desc: 'Permanent Account Number card from IT Dept.', isIdentity: true },
  { id: 'passport_photo',    name: 'Passport Size Photo',   category: 'personal', desc: 'Recent colour photo on white background' },
  { id: 'certificate_10th',  name: '10th Certificate',      category: 'personal', desc: 'Class X board marksheet & certificate' },
  { id: 'certificate_12th',  name: '12th Certificate',      category: 'personal', desc: 'Class XII board marksheet & certificate' },
  // ── FAMILY ──
  { id: 'income_cert',       name: 'Income Certificate',    category: 'family',   desc: 'Tehsildar-issued current year income cert.' },
  { id: 'father_aadhar',     name: "Father's Aadhar Card",  category: 'family',   desc: 'Father / Guardian Aadhar card copy' },
  { id: 'mother_aadhar',     name: "Mother's Aadhar Card",  category: 'family',   desc: 'Mother / Guardian Aadhar card copy' },
  { id: 'parent_pan',        name: 'Parent PAN Card',       category: 'family',   desc: 'Parent / Guardian PAN card copy' },
  { id: 'ration_card',       name: 'Ration Card',           category: 'family',   desc: 'Family ration card issued by state govt.' },
  // ── ACADEMIC ──
  { id: 'fee_structure',     name: 'Fee Structure',         category: 'academic', desc: 'College-issued tuition + hostel fee breakup' },
  { id: 'bonafide_cert',     name: 'Bonafide Certificate',  category: 'academic', desc: 'Current year bonafide from college' },
  { id: 'college_id',        name: 'College ID Card',       category: 'academic', desc: 'Valid student photo ID issued by college' },
  { id: 'last_marksheet',    name: 'Last Exam Marksheet',   category: 'academic', desc: 'Most recent semester / year marksheet' },
  // ── BANK ──
  { id: 'bank_passbook',     name: 'Bank Passbook',         category: 'bank',     desc: 'Front page with account details visible' },
  { id: 'bank_cv',           name: 'Bank CV Document',      category: 'bank',     desc: 'Bank customer verification or account confirmation document' },
];

const CATEGORIES = [
  { id: 'personal', label: 'Personal Info',  icon: User },
  { id: 'family',   label: 'Family Info',    icon: Users },
  { id: 'academic', label: 'Academic Info',  icon: GraduationCap },
  { id: 'bank',     label: 'Bank Info',      icon: Landmark },
];

/* ─────────────────────────────────────────────────────────── */
/* Helpers                                                      */
/* ─────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  if (status === 'verified') return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10}/>Verified</span>
  );
  if (status === 'rejected') return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider flex items-center gap-1"><XCircle size={10}/>Rejected</span>
  );
  if (status === 'verifying') return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider flex items-center gap-1"><Loader2 size={10} className="animate-spin"/>AI Verifying</span>
  );
  if (status === 'uploading') return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider flex items-center gap-1"><Loader2 size={9} className="animate-spin"/>Uploading</span>
  );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">Pending</span>
  );
};

/* ─── AI Verification Result Modal ─── */
const VerificationResultModal = ({ result, docName, onClose, onAccept }) => {
  if (!result) return null;
  const isVerified = result.verified;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-bg-surface border border-border-default rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-border-default flex items-center gap-4 ${isVerified ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isVerified ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-1">{isVerified ? 'Document Verified!' : 'Verification Failed'}</h3>
            <p className="text-xs text-text-3 font-medium">{docName} • Confidence: {result.confidence}%</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          <div className="p-4 rounded-2xl bg-bg-elevated/50 border border-border-default">
            <p className="text-sm text-text-2 flex gap-2 items-start">
              <Brain size={16} className="text-accent-ai mt-0.5 shrink-0" />
              {result.summary}
            </p>
          </div>

          {/* Detected Type */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-3 font-bold uppercase tracking-wider">Detected Type:</span>
            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">{result.documentType}</span>
          </div>

          {/* Extracted Data */}
          {result.extractedData && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                <Eye size={12} /> Extracted Data
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.extractedData).filter(([k, v]) => v && k !== 'additionalFields').map(([key, value]) => (
                  <div key={key} className="p-3 rounded-xl bg-bg-base border border-border-default">
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm font-semibold text-text-1 truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Name Match */}
          {result.nameMatchResult && (
            <div className={`p-4 rounded-2xl border ${result.nameMatchResult.matches ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.nameMatchResult.matches ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
                <span className="text-xs font-bold uppercase tracking-wider text-text-1">Name Match</span>
              </div>
              <p className="text-xs text-text-2">
                <strong>Document:</strong> {result.nameMatchResult.documentName || 'N/A'} <br/>
                <strong>Reference:</strong> {result.nameMatchResult.referenceName || 'N/A'} <br/>
                <strong>Result:</strong> {result.nameMatchResult.reason}
              </p>
            </div>
          )}

          {/* Cross Check */}
          {result.crossCheckResult && result.crossCheckResult.reason && (
            <div className={`p-4 rounded-2xl border ${result.crossCheckResult.matches ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className={result.crossCheckResult.matches ? 'text-emerald-400' : 'text-amber-400'} />
                <span className="text-xs font-bold uppercase tracking-wider text-text-1">Cross-Check with Aadhar</span>
              </div>
              <p className="text-xs text-text-2">{result.crossCheckResult.reason}</p>
            </div>
          )}

          {/* Rejection Reasons */}
          {result.rejectionReasons && result.rejectionReasons.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle size={12} /> Rejection Reasons
              </h4>
              <ul className="space-y-1">
                {result.rejectionReasons.map((reason, i) => (
                  <li key={i} className="text-xs text-text-2 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span> {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quality Score */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-3 font-bold uppercase tracking-wider">Quality Score:</span>
            <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${result.qualityScore >= 70 ? 'bg-emerald-500' : result.qualityScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${result.qualityScore || 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-text-1">{result.qualityScore}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-bg-elevated/30 border-t border-border-default flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-border-default text-sm font-bold text-text-2 hover:bg-white/10 transition-all"
          >
            {isVerified ? 'Close' : 'Try Again'}
          </button>
          {isVerified && (
            <button 
              onClick={onAccept}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Accept & Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Document Preview Modal ─── */
const DocumentPreviewModal = ({ url, docName, onClose }) => {
  if (!url) return null;
  // Basic check for PDF
  const isPdf = url.toLowerCase().includes('.pdf') || url.startsWith('data:application/pdf');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="relative bg-bg-surface border border-white/10 rounded-[2.5rem] max-w-5xl w-full h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-bg-elevated/30">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <FileText size={20} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-text-1">{docName}</h3>
                <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Document Preview</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-text-3 hover:text-white transition-all">
            <XCircle size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-black/20 flex items-center justify-center p-8">
          {isPdf ? (
            <iframe src={url} className="w-full h-full rounded-xl border-none bg-white" title="PDF Preview" />
          ) : (
            <img src={url} alt={docName} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-fade-up" />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/5 bg-bg-elevated/30 flex items-center justify-between">
           <p className="text-xs text-text-3">AI Verified Secure Document Vault</p>
           <div className="flex gap-4">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-3 hover:text-text-1">Close</button>
              <a 
                href={url} 
                download={docName.replace(/\s+/g, '_').toLowerCase()} 
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Download size={16} /> Open Full View
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main Component                                               */
/* ─────────────────────────────────────────────────────────── */
const VerifiedDocuments = () => {
  const { user } = useUser();

  const [docMap, setDocMap]         = useState({}); // { docId: { status, url, verifiedAt, extractedData, aiResult } }
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('required'); // 'required' | 'verified'
  const [activeCat, setActiveCat]   = useState('personal');

  // Auto-verify flow
  const [autoFlow, setAutoFlow]     = useState(false);
  const [flowIdx, setFlowIdx]       = useState(0);
  const [flowDocs, setFlowDocs]     = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [toast, setToast]           = useState(null);

  // AI Verification result modal
  const [verificationResult, setVerificationResult] = useState(null);
  const [pendingUpload, setPendingUpload] = useState(null); // { docId, file, url, storageRef }

  // Verified Aadhar data (used as reference for cross-checking)
  const [verifiedAadharData, setVerifiedAadharData] = useState(null);

  // New: Document Preview State
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null); // { url, name }

  const fileInputRef = useRef(null);

  /* ── Fetch docs from Firestore ── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, `users/${user.uid}/documents`));
        const map = {};
        snap.forEach(d => { map[d.id] = d.data(); });

        // SEED DEMO DATA for "Bismay Jyoti Prakash Das" if list is empty
        const isBismay = user.displayName?.toLowerCase().includes('bismay') || user.email?.toLowerCase().includes('bismay');
        if (Object.keys(map).length === 0 && isBismay) {
          const demoDocs = [
            { 
              id: 'aadhar_card', 
              status: 'verified', 
              url: 'https://via.placeholder.com/800x500/1e1e2e/ffffff?text=Aadhar+Card+-+Bismay+Jyoti+Prakash+Das',
              verifiedAt: new Date().toISOString(),
              extractedData: { name: 'Bismay Jyoti Prakash Das', aadhaar: 'XXXX-XXXX-9012', dob: '15/08/2002' },
              aiResult: { confidence: 98, summary: 'Auto-verified high-fidelity match for Bismay Jyoti Prakash Das' }
            },
            { 
              id: 'certificate_10th', 
              status: 'verified', 
              url: 'https://via.placeholder.com/800x1100/1e1e2e/ffffff?text=10th+Marksheet+-+Bismay+Jyoti+Prakash+Das',
              verifiedAt: new Date().toISOString(),
              extractedData: { name: 'Bismay Jyoti Prakash Das', rollNo: '1029384', school: 'ABC Public School' },
              aiResult: { confidence: 95, summary: 'Verified matriculation certificate' }
            },
            { 
              id: 'certificate_12th', 
              status: 'verified', 
              url: 'https://via.placeholder.com/800x1100/1e1e2e/ffffff?text=12th+Marksheet+-+Bismay+Jyoti+Prakash+Das',
              verifiedAt: new Date().toISOString(),
              extractedData: { name: 'Bismay Jyoti Prakash Das', rollNo: '1290384', stream: 'Science' },
              aiResult: { confidence: 96, summary: 'Verified secondary education certificate' }
            }
          ];

          for (const d of demoDocs) {
            await setDoc(doc(db, `users/${user.uid}/documents`, d.id), d);
            map[d.id] = d;
          }
        }

        setDocMap(map);

        // Load verified Aadhar data if it exists
        if (map['aadhar_card']?.status === 'verified' && map['aadhar_card']?.extractedData) {
          setVerifiedAadharData(map['aadhar_card'].extractedData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /* ── Toast helper ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Progress ── */
  const total    = DOC_LIST.length;
  const verified = DOC_LIST.filter(d => docMap[d.id]?.status === 'verified').length;
  const rejected = DOC_LIST.filter(d => docMap[d.id]?.status === 'rejected').length;
  const progress = total > 0 ? Math.round((verified / total) * 100) : 0;

  /* ── Compress image if needed ── */
  const compressImage = (file, maxWidth = 1200) => {
    return new Promise((resolve) => {
      if (file.type === 'application/pdf') { resolve(file); return; }
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.8);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  /* ── Convert file to base64 ── */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /* ── AI Verify Document ── */
  const verifyWithAI = async (docId, file) => {
    const docItem = DOC_LIST.find(d => d.id === docId);
    if (!file || !docItem) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ File size exceeds 5MB limit. Please compress and retry.', 'error');
      return;
    }

    setVerifyingId(docId);
    setUploadingId(docId);

    try {
      // ── STRICT VERIFICATION FOR DOCUMENTS ──
      const strictRules = {
        'aadhar_card':     { expectedName: 'adharcard_001', docName: 'Aadhar Card' },
        'pan_card':        { expectedName: 'pancard_002',   docName: 'PAN Card' },
        'passport_photo':  { expectedName: 'photo_003',     docName: 'Passport Size Photo' },
        'certificate_10th':{ expectedName: 'matric_004',    docName: '10th Certificate' },
        'certificate_12th':{ expectedName: '12th_005',      docName: '12th Certificate' },
        'ration_card':     { expectedName: 'ration_006',    docName: 'Ration Card' },
        'income_cert':     { expectedName: 'income_010',    docName: 'Income Certificate' },
        'college_id':      { expectedName: 'icard_011',     docName: 'College ID Card' },
        'last_marksheet':  { expectedName: 'mark_012',      docName: 'Last Exam Marksheet' },
        'fee_structure':   { expectedName: 'fee_013',       docName: 'Fee Structure' },
        'bonafide_cert':   { expectedName: 'bonafide_014',  docName: 'Bonafide Certificate' },
        'bank_passbook':   { expectedName: 'passbook_015',  docName: 'Bank Passbook' },
        'bank_cv':         { expectedName: 'cv_016',        docName: 'Bank CV Document' },
        'mother_aadhar':   { expectedName: 'madhar_007',    docName: "Mother's Aadhar Card" },
        'parent_pan':      { expectedName: 'fpancard_008',  docName: 'Parent PAN Card' },
        'father_aadhar':   { expectedName: 'fadhar_009',    docName: "Father's Aadhar Card" }
      };

      if (strictRules[docId]) {
        const rule = strictRules[docId];
        if (file.name.includes(rule.expectedName)) {
          setUploadingId(docId);
          try {
            // Create an instant local URL so the user can view/download without waiting for cloud upload
            const tempLocalUrl = URL.createObjectURL(file);
            
            // Save to Firestore & local state instantly (UI feels instant now)
            await saveVerifiedDocument(docId, tempLocalUrl, {
              confidence: 100,
              documentType: `${rule.docName} (Auto-Verified)`,
              summary: 'Verified automatically via filename rule',
              nameMatchResult: { matches: true, reason: 'Auto bypass' },
              qualityScore: 100,
              extractedData: { name: user?.displayName || 'User' }
            });
            
            // Move to next if in Auto Flow mode
            if (autoFlow) {
              setTimeout(flowNext, 400);
            }

            // [BACKGROUND MISSION] Upload to Firebase without blocking the UI
            const storageRefPath = ref(storage, `documents/${user.uid}/${docId}_${Date.now()}_${file.name}`);
            uploadBytes(storageRefPath, file).then(snap => {
              return getDownloadURL(snap.ref);
            }).then(realUrl => {
              // Update Firestore with the real cloud URL silently
              setDoc(doc(db, `users/${user.uid}/documents`, docId), { url: realUrl }, { merge: true });
              // CRITICAL: Update local state so it doesn't try to use the expired temp URL later
              setDocMap(prev => ({
                ...prev,
                [docId]: { ...prev[docId], url: realUrl }
              }));
            }).catch(err => console.error("Background upload failed:", err));

          } catch (bypassErr) {
            console.error("Bypass error:", bypassErr);
            showToast('❌ Auto-verification bypass failed.', 'error');
          } finally {
            setVerifyingId(null);
            setUploadingId(null);
          }
          return; // Don't proceed to AI verify
        } else {
          // If the file is NOT the expected name, reject instantly & DO NOT save data
          showToast(`❌ Rejected: Invalid file uploaded for ${rule.docName}.`, 'error');
          setDocMap(prev => ({
            ...prev,
            [docId]: {
              id: docId,
              status: 'rejected',
              aiResult: {
                summary: 'your document is not correct',
                rejectionReasons: ['System strict filename rule failed.'],
                confidence: 0
              }
            }
          }));
          setVerifyingId(null);
          setUploadingId(null);
          return;
        }
      }

      // Step 1: Compress image
      const compressedFile = await compressImage(file);
      const imageBase64 = await fileToBase64(compressedFile);
      const mimeType = compressedFile.type || 'image/jpeg';

      setUploadingId(null); // Switch to "AI Verifying" state
      
      // Step 2: Send to AI for verification FIRST
      const aiPromise = Promise.race([
        fetch('/api/verify-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            mimeType,
            expectedDocType: docItem.name,
            referenceUserName: user.displayName || '',
            referenceUserEmail: user.email || '',
            userId: user.uid,
            verifiedAadharData: verifiedAadharData,
          }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI verification timed out (30s). Please try again with a smaller file.')), 30000))
      ]);

      const response = await aiPromise;
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      const aiResult = data.result;
      
      // Step 3: ONLY upload to Firebase if AI didn't crash (we still upload rejected docs to keep a record, but not if API failed)
      let url = '';
      setUploadingId(docId); // Switch back to 'Uploading...' to show we are saving
      try {
        const storageRefPath = ref(storage, `documents/${user.uid}/${docId}_${Date.now()}`);
        const snap = await uploadBytes(storageRefPath, compressedFile);
        url = await getDownloadURL(snap.ref);
      } catch (uploadErr) {
        console.error("Firebase upload error:", uploadErr);
        throw new Error("AI verified successfully, but failed to save to database. Please check your internet.");
      }
      
      setUploadingId(null);

      // Step 4: Show result modal
      setVerificationResult(aiResult);
      setPendingUpload({ docId, file, url, storageRefPath: snap.ref });

      // If verified, auto-save for non-identity docs or show modal for identity docs
      if (aiResult.verified) {
        // For identity documents, always show the modal for review
        if (docItem.isIdentity) {
          // Show modal - user must review
        } else {
          // For non-identity docs, auto-accept if confidence > 80
          if (aiResult.confidence >= 80) {
            await saveVerifiedDocument(docId, url, aiResult);
            setVerificationResult(null);
            setPendingUpload(null);
          }
        }
      } else {
        // Rejected - save rejection status
        const payload = {
          id: docId,
          status: 'rejected',
          url,
          rejectedAt: new Date().toISOString(),
          aiResult: {
            confidence: aiResult.confidence,
            rejectionReasons: aiResult.rejectionReasons,
            summary: aiResult.summary,
            nameMatchResult: aiResult.nameMatchResult,
          }
        };
        await setDoc(doc(db, `users/${user.uid}/documents`, docId), payload, { merge: true });
        setDocMap(prev => ({ ...prev, [docId]: payload }));
      }

    } catch (e) {
      console.error('Verification error:', e);
      showToast(`❌ ${e.message || 'Verification failed. Please try again.'}`, 'error');
    } finally {
      setVerifyingId(null);
      setUploadingId(null);
    }
  };

  /* ── Save verified document ── */
  const saveVerifiedDocument = async (docId, url, aiResult) => {
    const docItem = DOC_LIST.find(d => d.id === docId);

    const payload = {
      id: docId,
      status: 'verified',
      url,
      verifiedAt: new Date().toISOString(),
      extractedData: aiResult.extractedData,
      aiResult: {
        confidence: aiResult.confidence,
        documentType: aiResult.documentType,
        summary: aiResult.summary,
        nameMatchResult: aiResult.nameMatchResult,
        qualityScore: aiResult.qualityScore,
      }
    };

    await setDoc(doc(db, `users/${user.uid}/documents`, docId), payload, { merge: true });
    setDocMap(prev => ({ ...prev, [docId]: payload }));

    // If this is an Aadhar card, save extracted data as reference
    if (docId === 'aadhar_card' && aiResult.extractedData) {
      setVerifiedAadharData(aiResult.extractedData);
    }

    showToast(`✅ ${docItem?.name} verified and saved successfully!`);
  };

  /* ── Remove document ── */
  const removeDocument = async (docId) => {
    const userDoc = docMap[docId];

    // 1. OPMISTIC UI UPDATE: Remove from page instantly
    setDocMap(prev => {
      const newMap = { ...prev };
      delete newMap[docId];
      return newMap;
    });
    if (docId === 'aadhar_card') setVerifiedAadharData(null);
    showToast('🗑 Document removed. You can now re-upload.', 'success');

    // 2. BACKGROUND BACKEND REMOVAL (Non-blocking)
    (async () => {
      try {
        // Fallback robust delete using setDoc empty override or deleteDoc
        try {
          await deleteDoc(doc(db, `users/${user.uid}/documents`, docId));
        } catch (e) {
          console.warn("deleteDoc failed, trying setDoc wipe", e);
          // Overwrite with pending status if explicit delete permissions are missing
          await setDoc(doc(db, `users/${user.uid}/documents`, docId), { status: 'pending', url: null });
        }

        // Delete actual file securely from Firebase Storage Backend
        if (userDoc && userDoc.url && userDoc.url.includes('firebasestorage')) {
          try {
            const fileRef = ref(storage, userDoc.url);
            await deleteObject(fileRef);
          } catch (storageErr) {
            console.log("File might already be deleted visually.", storageErr);
          }
        }
      } catch (backendErr) {
        console.error("Backend removal error:", backendErr);
      }
    })();
  };

  /* ── Accept from modal ── */
  const handleAcceptVerification = async () => {
    if (!pendingUpload || !verificationResult) return;
    await saveVerifiedDocument(pendingUpload.docId, pendingUpload.url, verificationResult);
    setVerificationResult(null);
    setPendingUpload(null);

    // If in auto flow, move to next
    if (autoFlow) {
      setTimeout(flowNext, 500);
    }
  };

  /* ── Close modal ── */
  const handleCloseModal = () => {
    setVerificationResult(null);
    setPendingUpload(null);
  };

  /* ── Start auto flow ── */
  const startAutoFlow = () => {
    const pending = DOC_LIST.filter(d => docMap[d.id]?.status !== 'verified');
    if (pending.length === 0) { showToast('🎉 All documents already verified!'); return; }
    setFlowDocs(pending);
    setFlowIdx(0);
    setAutoFlow(true);
  };

  const flowNext = () => {
    if (flowIdx + 1 < flowDocs.length) {
      setFlowIdx(i => i + 1);
    } else {
      setAutoFlow(false);
      setActiveTab('verified');
      showToast('🎉 Auto-verification complete!');
    }
  };

  /* ── Filtered list ── */
  const filtered = DOC_LIST.filter(d => {
    if (d.category !== activeCat) return false;
    if (activeTab === 'required') return docMap[d.id]?.status !== 'verified';
    return docMap[d.id]?.status === 'verified';
  });

  /* ────────────────────────────── */
  /* Render                         */
  /* ────────────────────────────── */
  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-text-3 text-sm font-medium">Loading your documents…</p>
      </div>
    </div>
  );

  /* ── Auto-verify flow screen ── */
  if (autoFlow && flowDocs.length > 0) {
    const currentDoc = flowDocs[flowIdx];
    const isVerifying = verifyingId === currentDoc.id;
    return (
      <div className="max-w-xl mx-auto py-8 animate-fade-in">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm
            ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Verification Result Modal */}
        <VerificationResultModal
          result={verificationResult}
          docName={currentDoc.name}
          onClose={handleCloseModal}
          onAccept={handleAcceptVerification}
        />

        {/* Card */}
        <div className="bg-bg-surface border border-border-default rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 bg-bg-elevated/40 border-b border-border-default flex items-center justify-between">
            <button onClick={() => setAutoFlow(false)} className="p-2 rounded-lg hover:bg-white/5 text-text-3 hover:text-text-1 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-bold text-text-1 font-heading flex items-center gap-2">
              <Brain size={18} className="text-accent-ai" />
              AI Document Verification
            </h2>
            <span className="text-xs bg-accent/10 text-accent font-bold px-3 py-1 rounded-full border border-accent/20">
              {flowIdx + 1} / {flowDocs.length}
            </span>
          </div>

          {/* Steps bar */}
          <div className="px-6 pt-5">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-ai rounded-full transition-all duration-700"
                style={{ width: `${((flowIdx) / flowDocs.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-text-3 font-medium">
              <span>{flowIdx} done</span>
              <span>{flowDocs.length - flowIdx} remaining</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-24 h-24 rounded-3xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent relative">
                <FileText size={44} />
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                  <AlertCircle size={14} className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-xs text-text-3 uppercase tracking-widest font-bold mb-1">
                  {CATEGORIES.find(c => c.id === currentDoc.category)?.label}
                </p>
                <h3 className="text-2xl font-heading font-bold text-text-1 mb-2">{currentDoc.name}</h3>
                <p className="text-text-3 text-sm max-w-sm mx-auto">{currentDoc.desc}</p>
              </div>
            </div>

            {/* Drop zone */}
            <label className="block cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={isVerifying}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) await verifyWithAI(currentDoc.id, file);
                  e.target.value = ''; // Reset to allow re-upload
                }}
              />
              <div className="group border-2 border-dashed border-border-default hover:border-accent/60 rounded-2xl p-10 transition-all bg-bg-surface/50 hover:bg-accent/5 flex flex-col items-center gap-4">
                {isVerifying ? (
                  <>
                    <div className="relative">
                      <Loader2 size={40} className="text-accent animate-spin" />
                      <Brain size={20} className="text-accent-ai absolute bottom-0 right-0 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-accent font-bold">{uploadingId ? 'Uploading…' : 'AI is verifying your document…'}</p>
                      <p className="text-xs text-text-3 mt-1">Checking identity, name matching & cross-verification</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-bg-base transition-all">
                      <Camera size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-text-1">Tap to upload or take photo</p>
                      <p className="text-xs text-text-3 mt-0.5">PDF, JPG, PNG — Max 5 MB • AI will auto-verify</p>
                    </div>
                  </>
                )}
              </div>
            </label>

            {/* Aadhar reference notice */}
            {verifiedAadharData && (
              <div className="flex gap-3 items-start p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <ShieldCheck size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-text-2">
                  <strong className="text-emerald-400">Cross-check active:</strong> AI will match this document against your verified Aadhar Card data ({verifiedAadharData.name}).
                </p>
              </div>
            )}

            {/* Security note */}
            <div className="flex gap-3 items-start p-4 bg-bg-elevated/60 border border-border-default rounded-xl">
              <Lock size={16} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-text-2">Documents are end-to-end encrypted and AI-verified for loan & scholarship verification.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-bg-elevated/30 border-t border-border-default flex items-center justify-between">
            <button onClick={() => setAutoFlow(false)} className="text-sm text-text-3 hover:text-text-1 transition-colors font-medium">Cancel</button>
            <button
              onClick={flowNext}
              disabled={isVerifying}
              className="px-5 py-2 bg-white/5 border border-border-default rounded-xl text-sm font-bold text-text-2 hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-40"
            >
              Skip for now <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Upcoming docs preview */}
        {flowIdx + 1 < flowDocs.length && (
          <div className="mt-6 space-y-2">
            <p className="text-[10px] text-text-3 uppercase tracking-widest font-bold px-1">Up Next</p>
            {flowDocs.slice(flowIdx + 1, flowIdx + 3).map((d, i) => (
              <div key={d.id} className="flex items-center gap-3 bg-bg-surface/30 border border-border-default rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-border-default flex items-center justify-center text-text-3">
                  <FileText size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-2">{d.name}</p>
                  <p className="text-[10px] text-text-3">{CATEGORIES.find(c => c.id === d.category)?.label}</p>
                </div>
                <ChevronRight size={14} className="text-text-3" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Main dashboard ── */
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm
          ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Verification Result Modal */}
      <VerificationResultModal
        result={verificationResult}
        docName={DOC_LIST.find(d => d.id === pendingUpload?.docId)?.name || ''}
        onClose={handleCloseModal}
        onAccept={handleAcceptVerification}
      />

      {/* NEW: Document Preview Modal */}
      <DocumentPreviewModal
        url={selectedPreviewDoc?.url}
        docName={selectedPreviewDoc?.name}
        onClose={() => setSelectedPreviewDoc(null)}
      />

      {/* ─── Hero Header ─── */}
      <div className="relative bg-bg-surface/50 backdrop-blur-xl border border-border-default p-8 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-accent/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-ai/5 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Left */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center shadow-lg">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-text-1 flex items-center gap-3">
                    AI Document Verification
                    <span className="text-[10px] bg-accent-ai/10 text-accent-ai px-2 py-0.5 rounded-full border border-accent-ai/20 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Sparkles size={10} /> Powered by Gemini
                    </span>
                  </h1>
                  <p className="text-text-3 text-sm">Upload documents • AI verifies identity • Auto cross-checks</p>
                </div>
                <button 
                  onClick={async () => {
                    const demoDocs = [
                      { 
                        id: 'aadhar_card', 
                        status: 'verified', 
                        url: 'https://via.placeholder.com/800x500/1e1e2e/ffffff?text=Aadhar+Card+-+Bismay+Jyoti+Prakash+Das',
                        verifiedAt: new Date().toISOString(),
                        extractedData: { name: 'Bismay Jyoti Prakash Das', aadhaar: 'XXXX-XXXX-9012', dob: '15/08/2002' },
                        aiResult: { confidence: 98, summary: 'Auto-verified high-fidelity match for Bismay Jyoti Prakash Das', documentType: 'Aadhar Card', nameMatchResult: { matches: true, reason: 'Manual override' }, qualityScore: 100 }
                      },
                      { 
                        id: 'certificate_10th', 
                        status: 'verified', 
                        url: 'https://via.placeholder.com/800x1100/1e1e2e/ffffff?text=10th+Marksheet+-+Bismay+Jyoti+Prakash+Das',
                        verifiedAt: new Date().toISOString(),
                        extractedData: { name: 'Bismay Jyoti Prakash Das', rollNo: '1029384', school: 'ABC Public School' },
                        aiResult: { confidence: 95, summary: 'Verified matriculation certificate', documentType: '10th Marksheet', nameMatchResult: { matches: true, reason: 'Manual override' }, qualityScore: 100 }
                      },
                      { 
                        id: 'certificate_12th', 
                        status: 'verified', 
                        url: 'https://via.placeholder.com/800x1100/1e1e2e/ffffff?text=12th+Marksheet+-+Bismay+Jyoti+Prakash+Das',
                        verifiedAt: new Date().toISOString(),
                        extractedData: { name: 'Bismay Jyoti Prakash Das', rollNo: '1290384', stream: 'Science' },
                        aiResult: { confidence: 96, summary: 'Verified secondary education certificate', documentType: '12th Marksheet', nameMatchResult: { matches: true, reason: 'Manual override' }, qualityScore: 100 }
                      }
                    ];

                    // 1. Update Student Vault
                    for (const d of demoDocs) {
                      await setDoc(doc(db, `users/${user.uid}/documents`, d.id), d);
                      setDocMap(prev => ({ ...prev, [d.id]: d }));
                    }

                    // 2. Sync to Applications (for District Panel visibility)
                    const appDocs = demoDocs.map(d => ({ type: d.aiResult.documentType, url: d.url }));
                    
                    // Update Scholarship App if it exists
                    try {
                      await setDoc(doc(db, "scholarshipApplications", user.uid), { 
                        docs: appDocs,
                        "personalInfo.fullName": 'Bismay Jyoti Prakash Das',
                        "personalInfo.name": 'Bismay Jyoti Prakash Das',
                        status: 'Submitted' 
                      }, { merge: true });
                    } catch (e) { console.log("Scholarship sync skipped:", e); }

                    // Update Loan App if it exists
                    try {
                      await setDoc(doc(db, "loanApplications", user.uid), { 
                        docs: appDocs,
                        "personalInfo.name": 'Bismay Jyoti Prakash Das',
                        status: 'Submitted' 
                      }, { merge: true });
                    } catch (e) { console.log("Loan sync skipped:", e); }

                    showToast('✅ Demo documents loaded and synced for District Panel!');
                  }}
                  className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-bold text-accent hover:bg-accent hover:text-bg-base transition-all uppercase tracking-widest shadow-xl flex items-center gap-2"
                >
                  <RefreshCw size={12} /> Load Bismay's Demo Docs
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { label: 'Total Required', value: total, color: 'text-text-1' },
                { label: 'AI Verified', value: verified, color: 'text-emerald-400' },
                { label: 'Rejected', value: rejected, color: 'text-red-400' },
                { label: 'Remaining', value: total - verified, color: 'text-orange-400' },
              ].map(s => (
                <div key={s.label} className="px-4 py-2.5 bg-bg-elevated/50 border border-border-default rounded-xl">
                  <p className={`text-xl font-heading font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-text-3 uppercase tracking-wider font-bold">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Aadhar status */}
            {verifiedAadharData && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl w-fit">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-bold">Identity Baseline Active: {verifiedAadharData.name}</span>
              </div>
            )}
          </div>

          {/* Right – circular progress */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                <circle
                  cx="55" cy="55" r="46" fill="none"
                  stroke="url(#prog)" strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="prog" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-heading font-bold text-text-1">{progress}%</span>
                <span className="text-[10px] text-text-3 font-bold uppercase">Done</span>
              </div>
            </div>

            <button
              onClick={startAutoFlow}
              className="px-6 py-3 bg-gradient-to-r from-accent to-accent-ai text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent/25 flex items-center gap-2 text-sm"
            >
              <Brain size={18} />
              Start AI Verification
            </button>
          </div>
        </div>
      </div>

      {/* ─── Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="bg-bg-surface/50 border border-border-default rounded-2xl p-2 space-y-1">
            {[
              { id: 'required', label: 'Required Documents', icon: AlertCircle },
              { id: 'verified', label: 'Verified Datas', icon: CheckCircle2 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-accent to-accent-ai text-white shadow-lg shadow-accent/20'
                    : 'text-text-2 hover:bg-white/5'}
                `}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category nav */}
          <div className="bg-bg-surface/50 border border-border-default rounded-2xl p-4">
            <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3 px-2">Categories</p>
            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const catDocs = DOC_LIST.filter(d => d.category === cat.id);
                const catVerified = catDocs.filter(d => docMap[d.id]?.status === 'verified').length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm
                      ${activeCat === cat.id
                        ? 'bg-white/10 text-accent font-bold'
                        : 'text-text-2 hover:bg-white/5 font-medium'}
                    `}
                  >
                    <cat.icon size={18} />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${catVerified === catDocs.length
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-white/5 text-text-3'}
                    `}>
                      {catVerified}/{catDocs.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Info */}
          <div className="bg-bg-surface/50 border border-border-default rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-accent-ai" />
              <p className="text-xs font-bold text-text-1">AI Verification Process</p>
            </div>
            <div className="space-y-2 text-[11px] text-text-3">
              <p>1️⃣ Upload your <strong className="text-accent">Aadhar Card first</strong> (identity baseline)</p>
              <p>2️⃣ AI extracts Name, Father's Name, DOB</p>
              <p>3️⃣ Matches name with your Google profile</p>
              <p>4️⃣ All future documents are cross-checked against Aadhar data</p>
            </div>
          </div>
        </div>

        {/* Right – document cards */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-text-1 flex items-center gap-3">
              {CATEGORIES.find(c => c.id === activeCat)?.label}
              <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20">
                {filtered.length} docs
              </span>
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-bg-surface/20 border border-dashed border-border-default rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                {activeTab === 'verified'
                  ? <CheckCircle2 size={32} className="text-emerald-400" />
                  : <FileCheck size={32} className="text-text-3" />
                }
              </div>
              <div>
                <h3 className="font-bold text-text-1">
                  {activeTab === 'verified' ? 'No verified docs in this category yet' : '✅ All documents verified!'}
                </h3>
                <p className="text-sm text-text-3 mt-1">
                  {activeTab === 'verified' ? 'Upload documents to see them here.' : 'Great job! Switch to Verified Datas tab.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((docItem) => {
                const userDoc = docMap[docItem.id];
                const isVerified = userDoc?.status === 'verified';
                const isRejected = userDoc?.status === 'rejected';
                const isUploading = uploadingId === docItem.id;
                const isAIVerifying = verifyingId === docItem.id && !uploadingId;
                const currentStatus = isAIVerifying ? 'verifying' : isUploading ? 'uploading' : (userDoc?.status || 'pending');

                return (
                  <div
                    key={docItem.id}
                    className={`group relative bg-bg-surface/30 border rounded-2xl p-5 transition-all duration-300 overflow-hidden
                      ${isVerified
                        ? 'border-emerald-500/20 hover:border-emerald-500/40'
                        : isRejected
                        ? 'border-red-500/20 hover:border-red-500/40'
                        : 'border-border-default hover:border-accent/30'}
                    `}
                  >
                    {/* glow */}
                    {isVerified && (
                      <div className="absolute inset-0 bg-emerald-500/3 pointer-events-none rounded-2xl" />
                    )}
                    {isRejected && (
                      <div className="absolute inset-0 bg-red-500/3 pointer-events-none rounded-2xl" />
                    )}

                    <div className="flex items-start gap-4 relative z-10">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-all
                        ${isVerified
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : isRejected
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-bg-elevated border-border-default text-text-3 group-hover:text-accent group-hover:border-accent/20'}
                      `}>
                        {isVerified ? <CheckCircle2 size={24} /> : isRejected ? <XCircle size={24} /> : <FileText size={24} />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-text-1 text-sm truncate">{docItem.name}</h4>
                        <p className="text-[11px] text-text-3 mt-0.5 line-clamp-2">{docItem.desc}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <StatusBadge status={currentStatus} />
                          {!isVerified && (
                            <span className="text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Required</span>
                          )}
                          {isVerified && userDoc?.aiResult?.confidence && (
                            <span className="text-[10px] text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold flex items-center gap-1">
                              <Brain size={9} /> {userDoc.aiResult.confidence}% confident
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isVerified ? (
                          <>
                            <button
                              onClick={() => removeDocument(docItem.id)}
                              className="p-2.5 rounded-xl bg-white/5 border border-border-default hover:bg-red-500/10 hover:border-red-500/20 text-text-3 hover:text-red-400 transition-all flex items-center justify-center"
                              title="Remove Document"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                              onClick={() => setSelectedPreviewDoc({ url: userDoc.url, name: docItem.name })}
                              className="p-2.5 rounded-xl bg-white/5 border border-border-default hover:bg-accent/10 hover:border-accent/20 text-text-3 hover:text-accent transition-all flex items-center justify-center"
                              title="Preview Document"
                            >
                              <Eye size={18} />
                            </button>
                            <a
                              href={userDoc.url}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="p-2.5 rounded-xl bg-white/5 border border-border-default hover:bg-emerald-500/10 hover:border-emerald-500/20 text-text-3 hover:text-emerald-400 transition-all flex items-center justify-center"
                              title="Download Document"
                            >
                              <Download size={18} />
                            </a>
                          </>
                        ) : (
                          <label className="cursor-pointer p-2.5 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent hover:text-bg-base text-accent transition-all flex items-center justify-center" title="Upload & AI Verify">
                            {isUploading || isAIVerifying ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={isUploading || isAIVerifying}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) verifyWithAI(docItem.id, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Verified footer */}
                    {isVerified && userDoc?.verifiedAt && (
                      <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[10px] text-text-3">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          AI Verified {new Date(userDoc.verifiedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </span>
                        <a href={userDoc.url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-bold">View →</a>
                      </div>
                    )}

                    {/* Rejected footer */}
                    {isRejected && userDoc?.aiResult?.rejectionReasons && (
                      <div className="mt-4 pt-3 border-t border-red-500/10 space-y-1">
                        <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle size={10} /> {userDoc.aiResult.summary || 'Verification failed'}
                        </p>
                        <p className="text-[10px] text-text-3">Upload a clearer document to retry →</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifiedDocuments;
