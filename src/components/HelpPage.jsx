import React, { useState } from 'react';
import { 
  HelpCircle, 
  UserCircle, 
  FileText, 
  GraduationCap, 
  Activity, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Clock,
  Sparkles,
  Search
} from 'lucide-react';

const HelpSection = ({ icon: Icon, title, questions }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 px-2 border-l-4 border-accent">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-text-1">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div 
            key={idx} 
            className={`glass-card rounded-2xl overflow-hidden border transition-all duration-300 ${openIndex === idx ? 'border-accent/40 bg-accent/5 shadow-lg shadow-accent/5' : 'border-white/5 hover:border-white/10'}`}
          >
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-5 flex items-center justify-between text-left group"
            >
              <span className={`text-sm font-bold transition-colors ${openIndex === idx ? 'text-accent' : 'text-text-2 group-hover:text-text-1'}`}>
                {q.question}
              </span>
              {openIndex === idx ? (
                <ChevronUp size={18} className="text-accent" />
              ) : (
                <ChevronDown size={18} className="text-text-3 group-hover:text-text-2" />
              )}
            </button>
            
            {openIndex === idx && (
              <div className="px-5 pb-5 animate-fade-down">
                <div className="h-px w-full bg-white/5 mb-4" />
                <p className="text-sm text-text-3 leading-relaxed font-medium">
                  {q.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      title: "Section 1: Account & Profile FAQs",
      icon: UserCircle,
      questions: [
        {
          question: "How do I reset my password?",
          answer: "Go to the login page and click 'Forgot Password.' Enter your registered Gmail, and we’ll send you a reset link."
        },
        {
          question: "Why is my email verification link not working?",
          answer: "Verification links expire after 24 hours. If it has expired, log in again to trigger a new email."
        },
        {
          question: "Can I change my Aadhar number after registration?",
          answer: "For security reasons, Aadhar numbers can only be changed by contacting support with a valid ID proof."
        }
      ]
    },
    {
      title: "Section 2: Document Verification",
      icon: FileText,
      questions: [
        {
          question: "Why was my document rejected by the AI?",
          answer: "Rejections usually happen due to blurry photos, low lighting, or edges being cut off. Try re-uploading a clear, flat scan."
        },
        {
          question: "How long does verification take?",
          answer: "Our AI-OCR system verifies documents within seconds. However, manual audits may take up to 24 hours."
        },
        {
          question: "Is my personal data safe?",
          answer: "Yes, we use industry-standard encryption. Your Aadhar and financial data are stored in a secure Firebase vault."
        }
      ]
    },
    {
      title: "Section 3: Scholarships & Loans",
      icon: GraduationCap,
      questions: [
        {
          question: "How do I know which scholarships I qualify for?",
          answer: "Use our Eligibility Checker tool. It analyzes your CGPA and income to match you with valid schemes."
        },
        {
          question: "What is the 'Match Score'?",
          answer: "It indicates how well your profile aligns with a scheme’s criteria. A 90%+ score means you have a high chance of approval."
        },
        {
          question: "Can I apply for multiple scholarships at once?",
          answer: "Yes, you can apply for as many as you qualify for, but ensure you meet the terms of each provider."
        }
      ]
    },
    {
      title: "Section 4: Tracking & Status",
      icon: Activity,
      questions: [
        {
          question: "What does 'Under Review' status mean?",
          answer: "It means your application has been received and is being cross-checked with the scholarship provider’s database."
        },
        {
          question: "When will I receive the funds?",
          answer: "Disbursements are handled directly by the providers (Government/Banks). Timeline varies from 30 to 90 days."
        }
      ]
    },
    {
      title: "Section 5: AI Assistant & Support",
      icon: MessageSquare,
      questions: [
        {
          question: "The AI Assistant is not responding. What do I do?",
          answer: "Check your internet connection and refresh the page. If the issue persists, use the 'Contact Support' button."
        },
        {
          question: "How do I contact a human agent?",
          answer: "You can email us at support@edufinanceai.com or call our helpdesk at +91-XXXX-XXXXXX (Mon-Fri, 9 AM - 6 PM)."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 pt-6">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
           <HelpCircle size={14} /> Help Center
        </div>
        <h1 className="text-4xl font-extrabold text-heading tracking-tight">
          How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-ai">help you</span> today?
        </h1>
        <p className="text-text-3 font-medium">Find answers to common questions or reach out to our support team.</p>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl mx-auto animate-fade-up">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search size={20} className="text-text-3 group-focus-within:text-accent transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search for questions (e.g. 'verification', 'password')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-5 pl-14 bg-bg-surface/50 border border-white/5 rounded-[2rem] focus:border-accent outline-none text-sm transition-all shadow-inner backdrop-blur-md"
        />
      </div>

      {/* FAQs Sections */}
      <div className="space-y-12">
        {sections.map((section, idx) => (
          <HelpSection key={idx} {...section} />
        ))}
      </div>

      {/* Support CTA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
        <div className="p-8 rounded-[2.5rem] bg-bg-surface/50 border border-white/5 space-y-4 relative overflow-hidden group animate-fade-right">
           <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-12 -mt-12" />
           <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
             <Mail size={24} />
           </div>
           <div>
             <h4 className="text-lg font-bold text-text-1">Email Support</h4>
             <p className="text-xs text-text-3 font-medium mb-3">Our team typically responds within 24 hours.</p>
             <a href="mailto:support@edufinanceai.com" className="text-sm font-bold text-accent hover:underline">
               support@edufinanceai.com
             </a>
           </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-bg-surface/50 border border-white/5 space-y-4 relative overflow-hidden group animate-fade-left">
           <div className="absolute top-0 right-0 w-24 h-24 bg-accent-ai/5 rounded-full blur-2xl -mr-12 -mt-12" />
           <div className="w-12 h-12 rounded-2xl bg-accent-ai/10 text-accent-ai flex items-center justify-center">
             <Phone size={24} />
           </div>
           <div>
             <h4 className="text-lg font-bold text-text-1">Phone Helpline</h4>
             <p className="text-xs text-text-3 font-medium mb-3">Monday - Friday (9 AM - 6 PM IST)</p>
             <span className="text-sm font-bold text-accent-ai">
               +91-XXXX-XXXXXX
             </span>
           </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-accent/5 to-transparent border border-white/5 flex items-center gap-4 text-center justify-center animate-fade-up">
        <Clock className="text-accent" size={20} />
        <p className="text-xs text-text-3 font-bold uppercase tracking-widest leading-none">
          Average Response Time: <span className="text-text-1 underline decoration-accent/30 decoration-2 underline-offset-4">2 Hours</span>
        </p>
      </div>

      <div className="flex justify-center gap-2 items-center text-[10px] text-text-3 font-bold uppercase tracking-widest pt-10">
        <Sparkles size={12} className="text-accent" /> Powered by EduFinance AI Support System <Sparkles size={12} className="text-accent-ai" />
      </div>
    </div>
  );
};

export default HelpPage;
