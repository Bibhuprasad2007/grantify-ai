import React, { useRef, useState, useEffect, memo } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Mail, UserCircle, Phone, ShieldCheck, Camera, ChevronLeft, 
  Calendar, Loader2, Save, User, MapPin, Fingerprint, 
  Users, GraduationCap, Landmark, Building, CreditCard,
  Hash, Globe, Award, Sparkles, Edit3
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

// ─── MOVE SUB-COMPONENTS OUTSIDE TO FIX FOCUS LOSING ISSUE ───────────────────

const SectionTitle = ({ icon: Icon, title }) => (
  <h3 className="text-lg font-bold text-text-1 mb-6 flex items-center gap-2 border-b border-white/5 pb-2">
    <Icon className="text-accent" size={20} /> {title}
  </h3>
);

const InfoField = memo(({ label, name, value, icon: Icon, placeholder, type = "text", isEditing, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-extrabold text-text-3 uppercase tracking-widest ml-1">{label}</label>
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
      isEditing 
        ? 'bg-bg-base border border-accent/30 focus-within:border-accent ring-accent/10 focus-within:ring-4' 
        : 'bg-bg-elevated/50 border border-white/5'
    }`}>
      <Icon size={16} className={isEditing ? 'text-accent' : 'text-text-3'} />
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="bg-transparent border-none outline-none text-sm font-medium text-text-1 w-full placeholder:opacity-50 placeholder:text-text-3"
        />
      ) : (
        <span className={`text-sm font-medium ${value ? 'text-text-1' : 'text-text-3 italic'}`}>
          {value || `No ${label.toLowerCase()} provided`}
        </span>
      )}
    </div>
  </div>
));

const Profile = ({ onBack }) => {
  const { user, updateUserProfile } = useUser();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form State - initialized with user data if available
  const [formData, setFormData] = useState({
    displayName: user?.displayName || user?.name || '',
    category: user?.category || '',
    religion: user?.religion || '',
    state: user?.state || '',
    district: user?.district || '',
    dob: user?.dob || '',
    aadhar: user?.aadhar || '',
    phoneNo: user?.phoneNo || '',
    email: user?.email || '',
    fathersName: user?.fathersName || '',
    mothersName: user?.mothersName || '',
    courseName: user?.courseName || '',
    collegeName: user?.collegeName || '',
    regNum: user?.regNum || '',
    bankName: user?.bankName || '',
    branch: user?.branch || '',
    accNum: user?.accNum || '',
    ifsc: user?.ifsc || '',
    annualIncome: user?.annualIncome || '',
    marks: user?.marks || '',
    marks10th: user?.marks10th || '',
    marks12th: user?.marks12th || '',
    fatherOccupation: user?.fatherOccupation || '',
    motherOccupation: user?.motherOccupation || '',
    gender: user?.gender || ''
  });

  // Only sync when user data initially loads or major updates happen
  useEffect(() => {
    if (user && !isEditing) {
      setFormData(prev => ({
        ...prev,
        ...user,
        displayName: user.displayName || user.name || prev.displayName
      }));
    }
  }, [user, isEditing]);

  const initials = formData.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const handleEditPicture = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'File size must be less than 2MB', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      setMessage({ text: '', type: '' });
      
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await updateUserProfile({ photoURL: downloadURL });
      setMessage({ text: 'Profile picture updated!', type: 'success' });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setMessage({ text: 'Upload failed. Try again.', type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setMessage({ text: 'Syncing with cloud...', type: 'info' });
      
      // Fast local update is handled by context.setUser in updateUserProfile
      await updateUserProfile(formData);
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ text: 'Save failed. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-up">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header Sticky Bar */}
      <div className="flex items-center justify-between gap-4 mb-8 sticky top-0 bg-bg-base/80 backdrop-blur-xl z-50 py-4 -mx-4 px-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-elevated border border-white/5 text-text-3 hover:text-text-1 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-heading font-extrabold text-text-1 tracking-tight">Student Profile</h1>
            <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em]">{user?.uid?.substring(0, 10)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {message.text && (
            <div className={`px-4 py-2 rounded-xl text-xs font-bold animate-fade-in ${
              message.type === 'success' ? 'bg-success/20 text-success border border-success/30' : 
              message.type === 'info' ? 'bg-accent/20 text-accent border border-accent/30' :
              'bg-danger/20 text-danger border border-danger/30'
            }`}>
              {message.text}
            </div>
          )}
          <button 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xl ${
              isEditing 
                ? 'bg-success text-white hover:scale-105 active:scale-95 shadow-success/20' 
                : 'bg-accent text-white hover:scale-105 active:scale-95 shadow-accent/20'
            }`}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Save size={18} /> : <Edit3 size={18} />)}
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Photo & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
            {/* Top Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent via-accent-ai to-purple-500" />
            
            <div className="relative mb-6">
              <div className="relative group/photo">
                <div className={`w-36 h-36 rounded-full border-4 border-bg-base overflow-hidden shadow-2xl relative transition-transform duration-500 ${uploading ? 'scale-95' : 'group-hover/photo:scale-105'}`}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-ai/20 flex items-center justify-center text-5xl font-extrabold text-accent">
                      {initials}
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                      <Loader2 className="text-accent animate-spin mb-2" size={24} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Uploading</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleEditPicture}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center border-4 border-bg-base hover:bg-white hover:text-bg-base transition-all duration-300 shadow-xl z-30 group-hover/photo:translate-y-[-5px]"
                >
                  <Camera size={20} />
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-text-1 tracking-tight">{formData.displayName}</h2>
            <p className="text-sm text-text-3 font-semibold mb-6">{formData.email}</p>
            
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-bg-base/30 border border-white/5">
                <p className="text-[9px] font-extrabold text-text-3 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-center gap-1.5 text-success text-[10px] font-bold">
                  <ShieldCheck size={12} /> Verified
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-bg-base/30 border border-white/5">
                <p className="text-[9px] font-extrabold text-text-3 uppercase tracking-widest mb-1">Category</p>
                <div className="flex items-center justify-center gap-1.5 text-accent text-[10px] font-bold">
                  <Award size={12} /> {formData.category || 'N/A'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-accent-ai/10 border border-accent-ai/20 w-full">
              <Sparkles size={16} className="text-accent-ai animate-pulse" />
              <div className="text-left">
                <p className="text-[9px] font-extrabold text-accent-ai uppercase tracking-widest leading-none mb-1">AI Trust Score</p>
                <p className="text-sm font-mono font-bold text-text-1 leading-none">92.4% <span className="text-[10px] text-success">Excellent</span></p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 border border-white/5">
            <h4 className="text-xs font-extrabold text-text-1 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe size={14} className="text-accent" /> Platform Activity
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Applications', val: '04', color: 'text-accent' },
                { label: 'Interviews', val: '01', color: 'text-success' },
                { label: 'Messages', val: '12', color: 'text-warning' }
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-text-3">{act.label}</span>
                  <span className={`text-sm font-mono font-extrabold ${act.color}`}>{act.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Personal */}
          <div className="glass rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
            <SectionTitle icon={UserCircle} title="Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Full Name" name="displayName" value={formData.displayName} icon={User} placeholder="John Doe" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Category" name="category" value={formData.category} icon={Award} placeholder="General / OBC / SC / ST" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Religion" name="religion" value={formData.religion} icon={Globe} placeholder="e.g., Hindu, Muslim" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="State" name="state" value={formData.state} icon={MapPin} placeholder="e.g., Odisha" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="District" name="district" value={formData.district} icon={Building} placeholder="e.g., Bhadrak" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Date of Birth" name="dob" value={formData.dob} icon={Calendar} placeholder="DD/MM/YYYY" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Aadhaar Number" name="aadhar" value={formData.aadhar} icon={Fingerprint} placeholder="12-digit UID" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Mobile Number" name="phoneNo" value={formData.phoneNo} icon={Phone} placeholder="+91 XXXXX XXXXX" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Email Address" name="email" value={formData.email} icon={Mail} placeholder="john@example.com" type="email" isEditing={isEditing} onChange={handleInputChange} />
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-text-3 uppercase tracking-widest ml-1">Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-bg-base border border-accent/30 focus:border-accent ring-accent/10 focus:ring-4 p-3 rounded-xl text-sm font-medium text-text-1 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/50 border border-white/5">
                    <Users size={16} className="text-text-3" />
                    <span className={`text-sm font-medium ${formData.gender ? 'text-text-1' : 'text-text-3 italic'}`}>
                      {formData.gender || "No gender provided"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Family */}
          <div className="glass rounded-[2rem] p-8 border border-white/5 shadow-2xl">
            <SectionTitle icon={Users} title="Family Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Father's Name" name="fathersName" value={formData.fathersName} icon={User} placeholder="Father's Name" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Mother's Name" name="mothersName" value={formData.mothersName} icon={User} placeholder="Mother's Name" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} icon={Landmark} placeholder="e.g., Farmer" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Mother's Occupation" name="motherOccupation" value={formData.motherOccupation} icon={Landmark} placeholder="e.g., Housewife" isEditing={isEditing} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section 3: Education */}
          <div className="glass rounded-[2rem] p-8 border border-white/5 shadow-2xl">
            <SectionTitle icon={GraduationCap} title="Education Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Course Name" name="courseName" value={formData.courseName} icon={Award} placeholder="e.g., B.Tech Computer Science" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="University / College" name="collegeName" value={formData.collegeName} icon={Building} placeholder="Complete Institute Name" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Registration Number" name="regNum" value={formData.regNum} icon={Hash} placeholder="University Roll/Reg No." isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Graduation Marks (%)" name="marks" value={formData.marks} icon={Award} placeholder="e.g. 85" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="10th Marks (%)" name="marks10th" value={formData.marks10th} icon={Award} placeholder="e.g. 90" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="12th Marks (%)" name="marks12th" value={formData.marks12th} icon={Award} placeholder="e.g. 88" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Annual Family Income" name="annualIncome" value={formData.annualIncome} icon={Landmark} placeholder="e.g. 150000" isEditing={isEditing} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section 4: Bank */}
          <div className="glass rounded-[2rem] p-8 border border-white/5 shadow-2xl">
            <SectionTitle icon={Landmark} title="Bank Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Bank Name" name="bankName" value={formData.bankName} icon={Building} placeholder="Bank Name" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Branch" name="branch" value={formData.branch} icon={MapPin} placeholder="Branch Name" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="Account Number" name="accNum" value={formData.accNum} icon={CreditCard} placeholder="Account Number" isEditing={isEditing} onChange={handleInputChange} />
              <InfoField label="IFSC Code" name="ifsc" value={formData.ifsc} icon={Hash} placeholder="Bank IFSC Code" isEditing={isEditing} onChange={handleInputChange} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
