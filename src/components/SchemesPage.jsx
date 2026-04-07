import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  GraduationCap, 
  Briefcase, 
  Landmark, 
  Calendar, 
  DollarSign, 
  ChevronRight,
  Info,
  Clock,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const SchemeCard = ({ icon: Icon, title, provider, amount, deadline, category, desc }) => (
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
          <DollarSign size={14} /> {amount}
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
      className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text-1 font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all group/btn"
    >
      Read Details <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
    </button>
  </div>
);

const SchemesPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const categories = ['All', 'Scholarships', 'Internships', 'Loans', 'Skill Grants'];

  const allSchemes = [
    {
      icon: GraduationCap,
      title: "Fulbright-Nehru Master's Fellowships",
      provider: "United States-India Educational Foundation",
      amount: "Fully Funded",
      deadline: "May 15, 2026",
      category: "Scholarships",
      desc: "For outstanding Indians to pursue master's degree programs at select U.S. colleges and universities."
    },
    {
      icon: Briefcase,
      title: "Google Software Engineering Intern",
      provider: "Google India",
      amount: "₹1,00,000 / mo",
      deadline: "April 30, 2026",
      category: "Internships",
      desc: "Apply your engineering knowledge to solve real-world problems with high-impact teams at Google."
    },
    {
      icon: Landmark,
      title: "Vidya Lakshmi Student Loan",
      provider: "NSDL / Government of India",
      amount: "Up to ₹15 Lakhs",
      deadline: "Open All Year",
      category: "Loans",
      desc: "A single platform for students to seek educational loans from multiple public and private banks."
    },
    {
      icon: GraduationCap,
      title: "Post-Matric Scholarship for SC Students",
      provider: "Ministry of Social Justice & Empowerment",
      amount: "Varies",
      deadline: "Oct 31, 2026",
      category: "Scholarships",
      desc: "Financial assistance to students belonging to Scheduled Castes for pursuing post-matriculation courses."
    },
    {
      icon: Briefcase,
      title: "TATA Trust Summer Internship",
      provider: "Tata Trusts India",
      amount: "₹45,000 Stipend",
      deadline: "May 20, 2026",
      category: "Internships",
      desc: "Intensive 8-week program for students interested in social dev and community impact projects. "
    },
    {
       icon: Landmark,
       title: "SBI Scholar Loan Scheme",
       provider: "State Bank of India",
       amount: "0% Processing Fee",
       deadline: "Instant App",
       category: "Loans",
       desc: "Special education loans for students securing admission to top-tier technical and management institutes."
    }
  ];

  const filteredSchemes = activeTab === 'All' 
    ? allSchemes 
    : allSchemes.filter(s => s.category === activeTab);

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
        
        <div className="flex bg-bg-surface/50 border border-white/5 p-1 rounded-2xl">
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
             <SchemeCard key={index} {...scheme} />
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
