import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  GraduationCap, ArrowRight, ArrowLeft, Mail, Lock, User, 
  Sparkles, AlertCircle, CheckCircle2, Phone, FileText, 
  CheckSquare, Square, Building2, Landmark
} from 'lucide-react';

const LoginPage = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, loginAsDistrict, loginAsBank } = useUser();
  
  // role-selection | login | terms | register | forgot
  const [view, setView] = useState('role-selection'); 
  const [role, setRole] = useState(null); // 'applicant' | 'district' | 'bank'

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Universal Auth Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Applicant Registration Extra Fields
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);

  // Bank specific fields (if they want to add branch code later, they can)
  const [branchCode, setBranchCode] = useState('');

  // District specific fields
  const [districtId, setDistrictId] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setView('login');
    clearMessages();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    clearMessages();
    try {
      // In a real app, you might want to enforce role boundaries with Google Auth.
      await loginWithGoogle();
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    try {
      if (view === 'login') {
        let authIdentifier = email;

        // Custom validation based on role
        if (role === 'district') {
          if (!districtId || !password) throw new Error('Please enter District ID and Password.');
          // Hardcoded district login — no Firebase needed
          loginAsDistrict(districtId, password);
          setIsLoading(false);
          return;
        } else if (role === 'bank') {
          if (!email || !branchCode || !password) throw new Error('Please enter Email, Branch Code, and Password.');
          // Hardcoded bank login
          loginAsBank(email, branchCode, password);
          setIsLoading(false);
          return;
        } else {
          // Applicant
          if (!email || !password) throw new Error('Please enter both Email and Password.');
        }

        // We use the same context function but log in with formatted identifiers
        await loginWithEmail(authIdentifier, password, role);

      } else if (view === 'register') {
        if (!email || !password || !confirmPassword || !name || !fathersName || !phoneNo || !aadhar) {
          throw new Error('Please fill in all fields.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (aadhar.length !== 12 || isNaN(aadhar)) throw new Error('Aadhar must be 12 digits.');
        
        await registerWithEmail(email, password, {
          name, fathersName, phoneNo, aadhar, role: 'applicant'
        });
        
        setIsLoading(false);
        return;
      } else if (view === 'forgot') {
        if (!email) throw new Error('Please enter your email address.');
        await resetPassword(email);
        setSuccessMsg('Password reset email sent! Check your inbox.');
        setIsLoading(false);
        return; 
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const getRoleHeaderDetails = () => {
    if (role === 'district') return { title: 'District Portal Login', desc: 'Secure access for authorized district officers.', icon: Building2, color: 'text-[#006A8E]' };
    if (role === 'bank') return { title: 'Bank Partner Login', desc: 'Secure portal for bank representatives and managers.', icon: Landmark, color: 'text-success' };
    return { title: 'Welcome Back', desc: 'Enter your details to access your dashboard.', icon: GraduationCap, color: 'text-accent' };
  };

  const roleDetails = role ? getRoleHeaderDetails() : null;

  return (
    <div className="min-h-[100dvh] bg-bg-base flex flex-col items-center justify-center relative overflow-x-hidden p-4 sm:p-6 pb-20">
      
      {/* Animated background orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-ai/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] w-[300px] h-[300px] bg-success/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className={`relative z-10 w-full ${view === 'terms' || view === 'register' ? 'max-w-3xl' : 'max-w-[420px]'} mx-auto transition-all duration-500`}>
        
        {/* App Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-up shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center shadow-lg shadow-accent/20">
            <GraduationCap size={24} className="text-white" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-text-1">
            EduFinance <span className="text-accent">AI</span>
          </span>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-[2rem] p-6 sm:p-8 relative overflow-hidden animate-fade-up shadow-2xl" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent via-accent-ai to-accent" />

          {/* Navigation Back Buttons */}
          {view !== 'role-selection' && (
            <button 
              onClick={() => {
                clearMessages();
                if (view === 'register') setView('terms');
                else if (view === 'login') setView('role-selection');
                else setView('login');
              }}
              className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/5 text-text-3 hover:text-text-1 transition-all z-20 bg-bg-base/50 backdrop-blur-sm"
              title={view === 'login' ? "Change Role" : "Go Back"}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {/* ---- ROLE SELECTION VIEW ---- */}
          {view === 'role-selection' && (
            <div className="animate-fade-in py-2">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-text-1 mb-2">Select Your Portal</h1>
                <p className="text-sm text-text-3 font-medium">Please choose your account type to proceed securely.</p>
              </div>

              <div className="flex flex-col gap-4">
                 <button onClick={() => handleRoleSelect('applicant')} className="w-full text-left p-5 rounded-2xl border border-white/10 bg-bg-base/50 hover:bg-white/5 hover:border-accent/40 transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-text-1 mb-1">Student / Applicant</h3>
                       <p className="text-xs text-text-3 font-medium">Apply for loans and scholarships.</p>
                    </div>
                 </button>

                 <button onClick={() => handleRoleSelect('district')} className="w-full text-left p-5 rounded-2xl border border-white/10 bg-bg-base/50 hover:bg-[#006A8E]/10 hover:border-[#006A8E]/40 transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#006A8E]/10 border border-[#006A8E]/20 flex items-center justify-center text-[#006A8E] group-hover:scale-110 transition-transform shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-text-1 mb-1">District Login</h3>
                       <p className="text-xs text-text-3 font-medium">Official login for district verification officers.</p>
                    </div>
                 </button>

                 <button onClick={() => handleRoleSelect('bank')} className="w-full text-left p-5 rounded-2xl border border-white/10 bg-bg-base/50 hover:bg-success/10 hover:border-success/40 transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success group-hover:scale-110 transition-transform shrink-0">
                      <Landmark size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-text-1 mb-1">Bank Login</h3>
                       <p className="text-xs text-text-3 font-medium">Partner portal for loan disbursements.</p>
                    </div>
                 </button>
              </div>
            </div>
          )}

          {/* Header for Forms */}
          {view !== 'role-selection' && (
            <div className="text-center mb-6 mt-8 sm:mt-2">
              <h1 className="text-2xl font-bold text-text-1 mb-2">
                {view === 'login' ? roleDetails.title : 
                 view === 'terms' ? 'Registration Terms' :
                 view === 'register' ? 'Create an Account' : 
                 'Reset Password'}
              </h1>
              <p className="text-sm text-text-3 font-medium">
                {view === 'login' ? roleDetails.desc : 
                 view === 'terms' ? 'Please read and agree to the portal guidelines.' :
                 view === 'register' ? 'Fill in your personal details to get started.' : 
                 'Enter your email to receive a password reset link.'}
              </p>
            </div>
          )}

          {/* ---- TERMS VIEW ---- */}
          {view === 'terms' && (
            <div className="space-y-5 animate-fade-in text-left">
              <h3 className="text-base font-bold text-text-1 mb-2 border-b border-white/10 pb-2">
                One-time, online registration of students for applying for Scholarship via portal:
              </h3>
              <ul className="space-y-3 text-sm text-text-2 list-disc pl-5 leading-relaxed">
                <li>Kindly map your Aadhaar number with your Bank account to receive scholarship amount under various schemes directly via DBT.</li>
                <li>I have read and understood the eligibility and other conditions of award of Scholarship as per the scheme guidelines.</li>
                <li>I understand that my application is liable to be rejected if I provide wrong Aadhaar number or Aadhaar number of someone else's.</li>
                <li>I understand that if more than one application is found to be made on-line, all my applications are liable to be rejected.</li>
                <li>Aadhaar is made mandatory for availing scholarship. Registration on the portal is based on Aadhaar. In one Aadhaar only single registration is allowed.</li>
                <li className="text-danger/90 font-medium">As per the Item 35 of Chapter VII of Aadhaar ACT 2016, if a person enters Aadhaar number of any other person and attempts to impersonate another person, dead or alive, he/she shall be punishable with imprisonment.</li>
              </ul>

              <div 
                className="flex gap-4 p-4 mt-6 rounded-xl bg-bg-base/80 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors shadow-inner"
                onClick={() => setTermsChecked(!termsChecked)}
              >
                <div className="mt-0.5 shrink-0">
                  {termsChecked ? <CheckSquare size={22} className="text-accent drop-shadow-md" /> : <Square size={22} className="text-text-3" />}
                </div>
                <p className="text-xs font-semibold text-text-2 leading-relaxed">
                  I have read the above statements & agree with the conditions. Further, I hereby state that I have no objection in authenticating myself with Demographic Aadhaar authentication system for the purpose of availing benefit of Scholarship.
                </p>
              </div>

              <div className="flex justify-end pt-4 pb-2">
                <button
                  onClick={() => { if(termsChecked) setView('register'); }}
                  disabled={!termsChecked}
                  className="px-8 h-12 min-w-[140px] rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  Proceed <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ---- FORM VIEWS ---- */}
          {(view === 'login' || view === 'register' || view === 'forgot') && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              
              {/* Registration Extra Fields (Only for applicants) */}
              {view === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" size={18} />
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                      className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-3/50" />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" size={18} />
                    <input type="text" placeholder="Father's Name" value={fathersName} onChange={(e) => setFathersName(e.target.value)} required
                      className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-3/50" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" size={18} />
                    <input type="tel" placeholder="Phone Number" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} required
                      className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-3/50" />
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" size={18} />
                    <input type="text" placeholder="12-Digit Aadhar Card" value={aadhar} onChange={(e) => setAadhar(e.target.value)} required maxLength={12}
                      className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-3/50" />
                  </div>
                </div>
              )}

              {/* Dynamic Identifiers Based on Role */}
              {view === 'login' && role === 'district' && (
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006A8E] pointer-events-none" size={18} />
                  <input type="text" placeholder="District ID / Access Code" value={districtId} onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-[#006A8E]/50 focus:ring-1 focus:ring-[#006A8E]/50 transition-all placeholder:text-text-3/50 lowercase" />
                </div>
              )}

              {view === 'login' && role === 'bank' && (
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-success pointer-events-none" size={18} />
                    <input type="email" placeholder="Bank Official Email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/50 transition-all placeholder:text-text-3/50" />
                  </div>
                  <div className="relative shrink-0 w-32">
                    <input type="text" placeholder="Branch Code" value={branchCode} onChange={(e) => setBranchCode(e.target.value)}
                      className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 px-4 text-sm text-center text-text-1 focus:outline-none focus:border-success/50 focus:ring-1 focus:ring-success/50 transition-all placeholder:text-text-3/50 uppercase" />
                  </div>
                </div>
              )}

              {/* Standard Email for Applicant */}
              {((view === 'login' && role === 'applicant') || view === 'register' || view === 'forgot') && (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" size={18} />
                  <input type="email" placeholder="Gmail ID / Address" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-3/50" />
                </div>
              )}

              {view !== 'forgot' && (
                <div className={`grid ${view === 'register' ? 'grid-cols-1 sm:grid-cols-2 gap-4' : 'grid-cols-1 gap-4'}`}>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${role === 'district' ? 'text-[#006A8E]' : role === 'bank' ? 'text-success' : 'text-text-3'}`} size={18} />
                    <input type="password" placeholder={view === 'register' ? 'Create Password' : 'Password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:ring-1 transition-all placeholder:text-text-3/50
                      ${role === 'district' ? 'focus:border-[#006A8E]/50 focus:ring-[#006A8E]/50' : role === 'bank' ? 'focus:border-success/50 focus:ring-success/50' : 'focus:border-accent/50 focus:ring-accent/50'}`} />
                  </div>
                  {view === 'register' && (
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" size={18} />
                      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-bg-base/70 border border-white/10 rounded-xl h-12 pl-11 pr-4 text-sm text-text-1 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-3/50" />
                    </div>
                  )}
                </div>
              )}

              {view === 'login' && (
                <div className="flex justify-end pt-1">
                  <button type="button" onClick={() => { setView('forgot'); clearMessages(); }} className={`text-xs font-semibold hover:underline transition-colors
                    ${role === 'district' ? 'text-[#006A8E]' : role === 'bank' ? 'text-success' : 'text-accent hover:text-accent-hover'}`}>
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Alerts */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-bold animate-fade-in">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-bold animate-fade-in">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                {view === 'register' && (
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setView('terms'); }}
                    className="flex-1 h-12 rounded-xl bg-bg-base/80 border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Back to Terms
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    ${view === 'register' ? 'flex-[2]' : 'w-full'} h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70
                    ${role === 'district' ? 'bg-[#006A8E] hover:bg-[#006A8E]/90 shadow-lg shadow-[#006A8E]/20' : 
                      role === 'bank' ? 'bg-success hover:bg-success/90 shadow-lg shadow-success/20' : 
                      'bg-gradient-to-r from-accent to-accent-hover hover:shadow-lg hover:shadow-accent/25'}
                  `}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {view === 'login' ? 'Secure Sign In' : view === 'register' ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Social Auth Separator (Only for Applicants) */}
          {(view === 'login' && role === 'applicant') && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs font-medium text-text-3">OR</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-white text-gray-800 font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          {/* Toggle View Links (Only for Applicants since officials are pre-registered) */}
          {(view !== 'role-selection') && (
            <div className="mt-8 text-center border-t border-white/5 pt-6 animate-fade-in">
              {view === 'login' && role === 'applicant' && (
                <p className="text-sm text-text-3 font-medium cursor-default">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setView('terms'); clearMessages(); }} className="text-accent hover:text-accent-hover font-bold transition-colors">
                    Register here
                  </button>
                </p>
              )}
              {view === 'login' && role !== 'applicant' && (
                <p className="text-sm text-text-3 font-medium cursor-default">
                  Need official access? Please contact your system administrator.
                </p>
              )}
              {(view === 'forgot') && (
                <p className="text-sm text-text-3 font-medium cursor-default">
                  Ready to sign in?{' '}
                  <button type="button" onClick={() => { setView('login'); clearMessages(); }} className="text-accent hover:text-accent-hover font-bold transition-colors">
                    Login here
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom tag */}
        <div className="text-center mt-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-[10px] text-text-3 font-bold uppercase tracking-[.2em] flex items-center justify-center gap-1">
            <Sparkles size={12} className="text-accent-ai" /> Secure multi-role authentication by Firebase
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
