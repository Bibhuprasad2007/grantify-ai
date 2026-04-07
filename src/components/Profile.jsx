import React, { useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Mail, UserCircle, Phone, ShieldCheck, Camera, ChevronLeft, Calendar, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const Profile = ({ onBack }) => {
  const { user, updateUserProfile } = useUser();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleEditPicture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (e.g., 2MB limit)
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
      setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setMessage({ text: 'Failed to upload image. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/5 text-text-3 hover:text-text-1 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-heading font-bold text-text-1">My Profile</h1>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`p-4 rounded-2xl text-center text-sm font-bold animate-fade-in ${
          message.type === 'success' ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="w-full lg:w-1/3">
          <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden group shadow-lg">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent/20 to-transparent"></div>
            
            <div className="relative mb-6">
              <div className="relative">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-32 h-32 rounded-full border-4 border-bg-surface object-cover shadow-xl z-10 relative" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-accent-ai/20 flex items-center justify-center border-4 border-bg-surface shadow-xl z-10 relative text-4xl font-bold text-accent-ai">
                    {initials}
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 z-20 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 className="text-white animate-spin" size={32} />
                  </div>
                )}
              </div>

              {/* Edit Picture Button */}
              <button 
                onClick={handleEditPicture}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full text-white flex items-center justify-center border-4 border-bg-surface hover:scale-110 transition-transform shadow-lg z-30 disabled:opacity-50 disabled:scale-100"
              >
                <Camera size={16} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-text-1 mb-1">{displayName}</h2>
            <p className="text-sm text-text-3 font-medium mb-4">{email}</p>
            
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold w-fit">
              <ShieldCheck size={14} /> Account Verified
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="glass rounded-3xl p-8 border border-white/5 shadow-lg">
            <h3 className="text-lg font-bold text-text-1 mb-6 flex items-center gap-2">
              <UserCircle className="text-accent" size={20} /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-3 uppercase tracking-wider">Full Name</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-base border border-border-default">
                  <UserCircle size={18} className="text-text-3" />
                  <span className="text-sm font-medium text-text-1">{displayName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-text-3 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-base border border-border-default">
                  <Mail size={18} className="text-text-3" />
                  <span className="text-sm font-medium text-text-1">{email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-text-3 uppercase tracking-wider">Phone Number</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-base border border-border-default">
                  <Phone size={18} className="text-text-3" />
                  <span className="text-sm font-medium text-text-3">+91 (Not Provided)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-text-3 uppercase tracking-wider">Member Since</label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-base border border-border-default">
                  <Calendar size={18} className="text-text-3" />
                  <span className="text-sm font-medium text-text-1">August 2023</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-bold shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-0.5 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
