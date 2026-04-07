import React from 'react';
import { 
  Info, 
  Target, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Mail, 
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Search,
  FileCheck,
  Lock,
  Globe
} from 'lucide-react';

const AboutPage = () => {
  const pillars = [
    {
      icon: <Sparkles className="text-accent-ai" size={24} />,
      title: "AI-Powered Assistance",
      desc: "A 24/7 intelligent scholarship and loan assistant that understands student needs instantly."
    },
    {
      icon: <Search className="text-accent" size={24} />,
      title: "Smart Eligibility Engine",
      desc: "An automated system that matches student profiles with thousands of government and private funding schemes."
    },
    {
      icon: <FileCheck className="text-success" size={24} />,
      title: "Secure Verification",
      desc: "Advanced OCR technology for secure and instant verification of Aadhar, marksheets, and income certificates."
    },
    {
      icon: <Zap className="text-warning" size={24} />,
      title: "Seamless Application",
      desc: "A unified portal to apply for multiple financial aids with zero paperwork and maximum efficiency."
    }
  ];

  const journeySteps = [
    { title: "Register", desc: "Complete your student profile with basic demographic data." },
    { title: "Verify", desc: "Securely upload and verify your documents via our AI scanner." },
    { title: "Unlock Funds", desc: "Get matched with eligible scholarships and apply directly." }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-bg-surface to-bg-base border border-white/5 p-10 md:p-16 text-center animate-fade-up">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--accent), transparent)' }} />
        <div className="relative z-10 space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4 animate-pulse-slow">
             <Info size={14} /> About EduFinance AI
           </div>
           <h1 className="text-4xl md:text-6xl font-extrabold text-heading tracking-tight leading-tight">
             Democratizing Access to <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-ai">Global Education</span>
           </h1>
           <p className="text-text-3 text-lg max-w-2xl mx-auto leading-relaxed">
             "Our mission is to democratize access to education by bridging the financial gap for students. We believe that financial constraints should never stand in the way of a student's dreams and potential."
           </p>
        </div>
      </div>

      {/* Core Technology */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <div className="w-12 h-1 bg-accent rounded-full" />
           <h2 className="text-2xl font-bold text-text-1">Key Technological Pillars</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {pillars.map((pillar, idx) => (
             <div key={idx} className="glass-card p-8 rounded-3xl border border-white/5 hover:border-accent/30 transition-all group animate-fade-in" style={{animationDelay: `${idx * 0.1}s`}}>
               <div className="w-14 h-14 rounded-2xl bg-bg-base flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                 {pillar.icon}
               </div>
               <h3 className="text-lg font-bold text-text-1 mb-3">{pillar.title}</h3>
               <p className="text-sm text-text-3 leading-relaxed">{pillar.desc}</p>
             </div>
           ))}
        </div>
      </div>

      {/* The Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
         <div className="space-y-8 animate-fade-left">
            <h2 className="text-3xl font-extrabold text-heading">The User Journey</h2>
            <div className="space-y-6 relative">
               <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-accent/50 to-transparent" />
               {journeySteps.map((step, idx) => (
                 <div key={idx} className="flex gap-8 relative z-10 group">
                    <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-1 mb-1">{step.title}</h4>
                      <p className="text-text-3 text-sm">{step.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         <div className="glass-card p-1 rounded-[2.5rem] bg-gradient-to-tr from-accent/20 via-transparent to-accent-ai/20 animate-fade-right">
            <div className="bg-bg-base/80 backdrop-blur-md rounded-[2.4rem] p-10 space-y-6">
                <div className="flex items-center gap-3 text-heading font-extrabold text-xl">
                  <ShieldCheck className="text-success" size={28} /> Data Security & Ethics
                </div>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="mt-1"><Lock className="text-accent" size={20} /></div>
                      <div>
                        <h5 className="font-bold text-text-1">Privacy First</h5>
                        <p className="text-xs text-text-3 font-medium">We prioritize student privacy. Your data is encrypted and managed under strict security protocols.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="mt-1"><Globe className="text-accent-ai" size={20} /></div>
                      <div>
                        <h5 className="font-bold text-text-1">Aadhar Compliance</h5>
                        <p className="text-xs text-text-3 font-medium">All demographic authentications are performed according to the latest government guidelines and Aadhaar Act 2016.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="mt-1"><Target className="text-success" size={20} /></div>
                      <div>
                        <h5 className="font-bold text-text-1">Firebase Secured</h5>
                        <p className="text-xs text-text-3 font-medium">Industry-leading database security to keep your personal information safe and private.</p>
                      </div>
                   </div>
                </div>
            </div>
         </div>
      </div>

      {/* Support CTA */}
      <div className="p-10 rounded-[2.5rem] border border-dashed border-white/20 bg-bg-elevated/30 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-up">
         <div>
            <h3 className="text-2xl font-extrabold text-heading mb-2">Need Assistance?</h3>
            <p className="text-text-3 text-sm font-medium">Our community support team is always here for students and parents.</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a href="mailto:support@edufinanceai.com" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:shadow-lg hover:shadow-accent/20 transition-all">
              <Mail size={18} /> support@edufinanceai.com
            </a>
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text-1 font-bold text-sm hover:bg-white/10 transition-all">
              <ExternalLink size={18} /> Help Center
            </button>
         </div>
      </div>
    </div>
  );
};

export default AboutPage;
