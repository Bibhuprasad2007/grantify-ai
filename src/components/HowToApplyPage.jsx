import React from 'react';
import { 
  HelpCircle, 
  UserPlus, 
  UserSquare2, 
  FileLock2, 
  Search, 
  ClipboardCheck, 
  GraduationCap, 
  Landmark, 
  Sparkles, 
  Activity,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const StepCard = ({ number, title, points, icon: Icon }) => (
  <div className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-accent/30 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={120} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-accent/20">
          {number}
        </div>
        <h3 className="text-xl font-bold text-text-1">{title}</h3>
      </div>
      <ul className="space-y-4">
        {points.map((point, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-text-3 leading-relaxed">
            <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-accent/40" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const HowToApplyPage = () => {
  const phases = [
    {
      title: "Phase 1: Your Digital Identity",
      icon: <UserPlus className="text-accent" />,
      steps: [
        {
          number: 1,
          title: "Create Your Secure Account",
          icon: UserPlus,
          points: [
            "Start by clicking the 'Register' button on our login portal.",
            "Essential Details: Provide your Full Name, Father's Name, and a valid Phone Number.",
            "Verification: Enter your 12-digit Aadhar Number to ensure authenticity.",
            "Security: Create a strong password for daily access and tracking."
          ]
        },
        {
          number: 2,
          title: "Complete Your AI Profile",
          icon: UserSquare2,
          points: [
            "Head over to your Profile section once logged in.",
            "Add academic details: Current course, CGPA, and year of study.",
            "Add financial details: Include your family's annual income.",
            "Why? Our AI uses this data to filter schemes you're eligible for."
          ]
        }
      ]
    },
    {
      title: "Phase 2: Document Verification",
      icon: <FileLock2 className="text-accent-ai" />,
      steps: [
        {
          number: 3,
          title: "The Virtual Document Vault",
          icon: FileLock2,
          points: [
            "Navigate to the 'Verified Documents' section.",
            "Upload digital copies of Aadhar, Marksheets, and Income Certificates.",
            "AI Scanner: Advanced OCR reads your documents instantly.",
            "Status: Look for the green 'Verified' badge for one-time verification."
          ]
        }
      ]
    },
    {
      title: "Phase 3: Finding Your Perfect Match",
      icon: <Search className="text-warning" />,
      steps: [
        {
          number: 4,
          title: "Explore the Schemes Hub",
          icon: Search,
          points: [
            "Click 'Schemes Hub' to browse hundreds of opportunities.",
            "Use Filter Tabs to sort by Scholarships, Internships, or Loans.",
            "Research: Read 'Benefits' and 'Deadlines' carefully before applying."
          ]
        },
        {
          number: 5,
          title: "Smart Eligibility Checker",
          icon: ClipboardCheck,
          points: [
            "Go to 'Eligibility Check' before starting an application.",
            "Answer simple profile questions about category and state.",
            "Match Score: Get an AI-calculated match percentage for every scheme."
          ]
        }
      ]
    },
    {
      title: "Phase 4: The Application Process",
      icon: <GraduationCap className="text-success" />,
      steps: [
        {
          number: 6,
          title: "Applying for a Scholarship",
          icon: GraduationCap,
          points: [
            "Go to 'Apply Scholarship' for schemes you like.",
            "Time Saver: Forms are partially pre-filled with your profile data.",
            "Final Step: Review, link your verified documents, and hit 'Submit'."
          ]
        },
        {
          number: 7,
          title: "Applying for an Education Loan",
          icon: Landmark,
          points: [
            "Go to 'Apply Loan' for financial support for tuition.",
            "Guided Portal: Select banks, amounts, and tenure options.",
            "Follow on-screen steps for specific bank requirements."
          ]
        }
      ]
    },
    {
      title: "Phase 5: Support and Tracking",
      icon: <Sparkles className="text-accent" />,
      steps: [
        {
          number: 8,
          title: "Talk to the AI Assistant",
          icon: Sparkles,
          points: [
            "Click on 'AI Assistant' for any questions (e.g., NSP CGPA requirements).",
            "Availability: Intelligent guidance available 24/7 in real-time."
          ]
        },
        {
          number: 9,
          title: "Tracking Your Progress",
          icon: Activity,
          points: [
            "Check 'Applications' to see live status: Pending, Approved, or Rejected.",
            "Feedback: View reasons for rejection to rectify and re-apply."
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Page Header */}
      <div className="text-center space-y-4 py-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
           <HelpCircle size={14} /> Step-by-Step Guide
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-heading tracking-tight">
          How to Apply with <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-ai">EduFinance AI</span>
        </h1>
        <p className="text-text-3 max-w-2xl mx-auto font-medium">Follow this guide to navigate your journey from registration to successful funding.</p>
      </div>

      {/* Phases */}
      <div className="space-y-16">
        {phases.map((phase, pIdx) => (
          <div key={pIdx} className="space-y-8 animate-fade-in" style={{animationDelay: `${pIdx * 0.1}s`}}>
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
               <div className="w-10 h-10 rounded-xl bg-bg-surface flex items-center justify-center border border-white/5 shadow-inner">
                 {phase.icon}
               </div>
               <h2 className="text-2xl font-bold text-text-1">{phase.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {phase.steps.map((step, sIdx) => (
                 <StepCard key={sIdx} {...step} />
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pro Tips Section */}
      <div className="p-10 rounded-[3rem] bg-gradient-to-br from-bg-surface to-bg-base border border-accent/20 relative overflow-hidden animate-fade-up">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-4">
               <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                 <Lightbulb size={28} />
               </div>
               <h3 className="text-3xl font-extrabold text-heading">Pro-Tips for Success</h3>
               <p className="text-text-3 text-sm leading-relaxed">Maximize your chances of getting approved by following these insider recommendations.</p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
               {[
                 { title: "Check Daily", text: "New internship and scholarship schemes are added to the Hub every morning." },
                 { title: "Verify Early", text: "Keep your Document Vault ready in advance. Don't wait for a deadline." },
                 { title: "Accurate Income", text: "Ensure annual income matches your certificate to prevent rejections." },
                 { title: "Use the AI", text: "The more you interact, the better we can suggest relevant funds." }
               ].map((tip, idx) => (
                 <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                    <CheckCircle2 className="text-success shrink-0" size={20} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-text-1 text-sm">{tip.title}</h4>
                      <p className="text-xs text-text-3 leading-relaxed">{tip.text}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Ready to Start CTA */}
      <div className="text-center space-y-6 pt-10">
         <h2 className="text-2xl font-bold text-heading">Ready to start your journey?</h2>
         <button className="px-8 py-4 bg-gradient-to-r from-accent to-accent-hover text-white rounded-2xl font-bold flex items-center justify-center gap-3 mx-auto hover:shadow-2xl hover:shadow-accent/25 transition-all group">
           Explore Schemes Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default HowToApplyPage;
