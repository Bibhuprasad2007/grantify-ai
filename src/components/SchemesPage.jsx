import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  GraduationCap, 
  Briefcase, 
  Landmark, 
  Calendar, 
  IndianRupee, 
  ChevronRight,
  Info,
  Clock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Zap
} from 'lucide-react';

const SchemeCard = ({ icon: Icon, title, provider, amount, deadline, category, desc, onSelect }) => (
  <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-accent/30 transition-all group animate-fade-in">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-bg-base/80 border border-white/5 shadow-inner`}>
        <Icon size={24} className="text-accent" />
      </div>
      <span className="px-3 py-1 bg-white/5 text-[10px] font-bold text-text-3 uppercase tracking-widest rounded-full border border-white/5">
        {category}
      </span>
    </div>
    
    <h3 className="text-lg font-bold text-text-1 mb-1 group-hover:text-accent transition-colors">{title}</h3>
    <p className="text-xs text-text-3 font-medium mb-4">{provider}</p>
    
    <p className="text-sm text-text-2 mb-6 line-clamp-2 leading-relaxed">
      {desc}
    </p>

    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
      <div className="space-y-1">
        <span className="block text-[10px] font-bold text-text-3 uppercase tracking-tighter">Amount</span>
        <span className="text-sm font-bold text-success flex items-center gap-1">
          <IndianRupee size={14} /> {amount}
        </span>
      </div>
      <div className="space-y-1">
        <span className="block text-[10px] font-bold text-text-3 uppercase tracking-tighter">Deadline</span>
        <span className="text-sm font-bold text-text-2 flex items-center gap-1">
          <Clock size={14} /> {deadline}
        </span>
      </div>
    </div>

    <button 
      onClick={onSelect}
      className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text-1 font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all group/btn"
    >
      Read Details <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
    </button>
  </div>
);

const SchemesPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const categories = ['All', 'Scholarships', 'Internships', 'Loans', 'Skill Grants'];

  const allSchemes = [
    {
      icon: GraduationCap,
      title: "Fulbright-Nehru Master's Fellowships",
      provider: "United States-India Educational Foundation",
      amount: "Fully Funded",
      deadline: "May 15, 2026",
      category: "Scholarships",
      desc: "For outstanding Indians to pursue master's degree programs at select U.S. colleges and universities.",
      eligibility: [
         "Must be an Indian citizen residing in India.",
         "Must possess the equivalent of a U.S. bachelor's degree.",
         "Minimum 3 years of full-time work experience.",
         "High English proficiency score (TOEFL/IELTS)."
      ],
      documents: ["Transcripts/Marksheets", "Standardized Test Scores", "Letters of Recommendation", "Statement of Purpose (SOP)", "Passport"]
    },
    {
      icon: Briefcase,
      title: "Google Software Engineering Intern",
      provider: "Google India",
      amount: "₹1,00,000 / mo",
      deadline: "April 30, 2026",
      category: "Internships",
      desc: "Apply your engineering knowledge to solve real-world problems with high-impact teams at Google.",
      eligibility: [
         "Currently enrolled in a Bachelor’s, Master’s or PhD degree in Computer Science.",
         "Expected to graduate in 2027.",
         "Experience in one or more general purpose programming languages.",
         "Ability to speak and write in English fluently."
      ],
      documents: ["Updated Resume", "Academic Transcripts", "Cover Letter (Optional)"]
    },
    {
      icon: Landmark,
      title: "Vidya Lakshmi Student Loan",
      provider: "NSDL / Government of India",
      amount: "Up to ₹15 Lakhs",
      deadline: "Open All Year",
      category: "Loans",
      desc: "A single platform for students to seek educational loans from multiple public and private banks.",
      eligibility: [
         "Must be an Indian National.",
         "Secured admission to a recognized institute in India or abroad.",
         "Entrance exam or merit-based selection proof.",
         "Age between 18-35 years."
      ],
      documents: ["Aadhar Card", "PAN Card", "Admission Letter", "Fee Structure", "Co-applicant Income Proof (ITR)"],
      facilities: [
        "100% Tax Benefit under Section 80E.",
        "No processing fee for government institutes.",
        "Repayment starts 1 year after course completion.",
        "Coverage for travel and laptop expenses."
      ]
    },
    {
      icon: GraduationCap,
      title: "Post-Matric Scholarship for SC Students",
      provider: "Ministry of Social Justice & Empowerment",
      amount: "Varies",
      deadline: "Oct 31, 2026",
      category: "Scholarships",
      desc: "Financial assistance to students belonging to Scheduled Castes for pursuing post-matriculation courses.",
      eligibility: [
         "Belong to Scheduled Caste (SC) category.",
         "Family income from all sources must not exceed ₹2.5 Lakh per annum.",
         "Must be pursuing recognized post-matriculation courses.",
         "Cannot hold more than one scholarship at a time."
      ],
      documents: ["Caste Certificate", "Income Certificate", "Aadhar Card", "Bank Passbook", "Fee Receipt", "Previous Year Marksheet"]
    },
    {
      icon: Briefcase,
      title: "TATA Trust Summer Internship",
      provider: "Tata Trusts India",
      amount: "₹45,000 Stipend",
      deadline: "May 20, 2026",
      category: "Internships",
      desc: "Intensive 8-week program for students interested in social dev and community impact projects.",
      eligibility: [
         "Final year undergraduate or first-year postgraduate students.",
         "Demonstrated interest in the development sector.",
         "Strong communication and analytical skills."
      ],
      documents: ["Resume", "College ID Card", "Letter of Motivation", "NOC from College"]
    },
    {
       icon: Landmark,
       title: "SBI Scholar Loan Scheme",
       provider: "State Bank of India",
       amount: "0% Processing Fee",
       deadline: "Instant App",
       category: "Loans",
       desc: "Special education loans for students securing admission to top-tier technical and management institutes.",
       eligibility: [
          "Secured admission to a specified premier institution (IITs, IIMs, NITs, etc.).",
          "Indian Citizenship.",
          "Good academic record."
       ],
       documents: ["Admission Letter", "Cost of Study Schedule", "PAN of Student/Parent", "Aadhar Card", "Bank Statement (Last 6 months)"],
       facilities: [
         "Collateral-free loans up to ₹40 Lakhs for top institutes.",
         "Lower interest rates for female students (0.5% concession).",
         "Digital sanction in 24 hours.",
         "No collateral required for listed AAA category institutes."
       ]
    },
    {
       icon: Landmark,
       title: "HDFC Credila Global Scholar",
       provider: "HDFC Credila",
       amount: "Up to ₹1 Crore",
       deadline: "Instant App",
       category: "Loans",
       desc: "Specialized education loan provider focusing on students going abroad for STEM and management courses.",
       eligibility: [
          "Admission to GRE/GMAT recognized global universities.",
          "Strong academic background (GPA 3.5+ preferred).",
          "Co-applicant with stable income."
       ],
       documents: ["I-20 Form (for US)", "Passport Copy", "Co-borrower Salary Slips", "Past 3 years ITR"],
       facilities: [
         "Multi-currency support (USD, GBP, EUR).",
         "Doorstep document collection service.",
         "Up to 10 years flexible repayment tenor.",
         "Loan includes living expenses and health insurance."
       ]
    },
    {
       icon: Landmark,
       title: "Skill India Education Loan",
       provider: "National Skill Dev Corp",
       amount: "₹5,000 - ₹1.5 Lakh",
       deadline: "Rolling Basis",
       category: "Loans",
       desc: "Micro-loans for students pursuing vocational training and skill development courses under PMKVY.",
       eligibility: [
          "Pursuing NSQF aligned courses.",
          "Verified institute registration.",
          "Minimum age 16 years."
       ],
       documents: ["Skill Card", "Aadhar", "Institute ID", "Income Declaration"],
       facilities: [
         "Nominal interest rate (around 4-6%).",
         "No collateral or third-party guarantee needed.",
         "Direct disbursement to the training partner.",
         "Job placement assistance post-course."
       ]
    }
  ];

  const filteredSchemes = activeTab === 'All' 
    ? allSchemes 
    : allSchemes.filter(s => s.category === activeTab);

  if (selectedScheme) {
    const Icon = selectedScheme.icon;
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in relative z-10">
        <button onClick={() => setSelectedScheme(null)} className="flex items-center gap-2 text-text-3 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span className="font-bold">Back to Schemes</span>
        </button>

        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-bg-base/80 border border-white/5 shadow-inner flex items-center justify-center shrink-0">
              <Icon size={40} className="text-accent" />
            </div>
            <div>
              <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest rounded-full">
                {selectedScheme.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-heading mt-4 mb-2">{selectedScheme.title}</h1>
              <p className="text-lg text-text-3 font-medium">{selectedScheme.provider}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 p-6 bg-bg-base/50 rounded-3xl border border-white/5">
            <div>
               <p className="text-xs font-bold text-text-3 uppercase tracking-wider mb-1">Max Benefit</p>
               <p className="text-lg font-bold text-success">{selectedScheme.amount}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-text-3 uppercase tracking-wider mb-1">Deadline</p>
               <p className="text-lg font-bold text-text-1">{selectedScheme.deadline}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-text-3 uppercase tracking-wider mb-1">Status</p>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                 <span className="text-lg font-bold text-text-1">Accepting</span>
               </div>
            </div>
            <div>
               <p className="text-xs font-bold text-text-3 uppercase tracking-wider mb-1">Apply By</p>
               <p className="text-lg font-bold text-text-1">Online Portal</p>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-3 mb-4 text-text-1">
                <Info className="text-accent" /> Description
              </h3>
              <p className="text-text-2 leading-relaxed">{selectedScheme.desc}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold flex items-center gap-3 mb-4 text-text-1">
                <CheckCircle2 className="text-accent" /> Eligibility Criteria
              </h3>
              <ul className="space-y-3">
                {selectedScheme.eligibility.map((criterion, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent"></span>
                    <span className="text-text-2 leading-relaxed">{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold flex items-center gap-3 mb-4 text-text-1">
                <FileText className="text-accent" /> Documents Required
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedScheme.documents.map((doc, idx) => (
                  <div key={idx} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-text-2 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-success" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>

            {selectedScheme.facilities && (
              <div>
                <h3 className="text-xl font-bold flex items-center gap-3 mb-4 text-text-1">
                  <Zap className="text-warning" /> Exclusive Facilities & Offers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedScheme.facilities.map((fac, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-warning/5 border border-warning/10 flex items-start gap-3">
                      <Sparkles size={16} className="text-warning mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-text-2">{fac}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 mt-12 border-t border-white/5">
              <button onClick={() => alert("Please proceed to the Dashboard Application Portals to begin filling the universal form.")} className="w-full md:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-accent to-accent-ai text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-accent/20">
                 Start Application Process
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-heading tracking-tight flex items-center gap-3">
             <BookOpen className="text-accent" />
             Schemes Information Hub
          </h1>
          <p className="text-text-3 text-sm font-medium">Explore active scholarships, internships, and educational funds from global sources.</p>
        </div>
        
        <div className="flex flex-wrap bg-bg-surface/50 border border-white/5 p-1 rounded-2xl">
          {categories.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-3 hover:text-text-1 hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-r from-accent/5 via-accent-ai/5 to-transparent border border-white/5 flex flex-col md:flex-row items-center gap-6 animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-accent shrink-0">
          <Sparkles size={32} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-text-1">Read Only Policy</h4>
          <p className="text-sm text-text-3 font-medium">This page is for information and learning purposes only. To apply for verified schemes with AI assistance, please use the <u>Apply Scholarship</u> or <u>Government Aid</u> portals on your dashboard.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-text-3 group-focus-within:text-accent transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search for schemes or providers..."
          className="w-full p-4 pl-12 bg-bg-surface/50 border border-white/5 rounded-2xl focus:border-accent outline-none text-sm transition-all shadow-inner"
        />
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme, index) => (
             <SchemeCard key={index} {...scheme} onSelect={() => setSelectedScheme(scheme)} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-text-3 mb-2">
              <Filter size={32} />
           </div>
           <h3 className="text-xl font-bold text-text-1">No Schemes Found</h3>
           <p className="text-text-3 text-sm">We couldn't find any results for this category at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default SchemesPage;
