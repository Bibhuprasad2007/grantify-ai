import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, onSnapshot, doc, setDoc, getDocs, query, where
} from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import {
  Building2, CheckCircle2, Search, Filter, Sparkles, ArrowRight,
  ExternalLink, Info, Loader2, GraduationCap, Users, BadgeDollarSign,
  Clock, ShieldCheck, ChevronDown, ChevronUp, Star, Bookmark,
  CircleAlert, RefreshCw, Landmark
} from 'lucide-react';

// ─── Default Government Schemes Seed Data ────────────────────────────────────
const DEFAULT_SCHEMES = [
  {
    schemeId: 'GOV-PM-SCHOLARSHIP',
    name: 'PM Scholarship Scheme (PMSS)',
    ministry: 'Ministry of Education',
    category: 'Central Government',
    amount: '₹25,000 - ₹36,200',
    amountValue: 36200,
    deadline: '31 Oct 2025',
    eligibility: ['Ex-servicemen / Para-military children', 'Min 60% in 12th', 'Under 25 years'],
    benefits: ['Annual scholarship', 'Technical / Professional courses', 'Direct bank transfer'],
    tags: ['Central', 'Merit', 'Ex-Servicemen'],
    match: 92,
    status: 'Active',
    applyLink: 'https://scholarships.gov.in',
    color: 'from-orange-500 to-red-600',
    initials: 'PM',
    featured: true,
    totalSeats: 5500,
    documentsRequired: ['Aadhaar Card', 'Income Certificate', '12th Marksheet', 'ESM PPO Copy'],
  },
  {
    schemeId: 'GOV-NSP-OBC',
    name: 'Post Matric Scholarship for OBC',
    ministry: 'Ministry of Social Justice',
    category: 'OBC Welfare',
    amount: '₹1,200 - ₹2,400/month',
    amountValue: 28800,
    deadline: '15 Nov 2025',
    eligibility: ['OBC Category students', 'Post-matriculation study', 'Family income < ₹1 Lakh/year'],
    benefits: ['Monthly stipend', 'Book allowance', 'Study tour charges'],
    tags: ['OBC', 'Post-Matric', 'Stipend'],
    match: 87,
    status: 'Active',
    applyLink: 'https://scholarships.gov.in',
    color: 'from-blue-500 to-indigo-600',
    initials: 'OBC',
    featured: false,
    totalSeats: 0,
    documentsRequired: ['Caste Certificate', 'Income Certificate', 'Last Marksheet', 'Aadhaar'],
  },
  {
    schemeId: 'GOV-NSP-SC',
    name: 'Post Matric Scholarship for SC/ST',
    ministry: 'Ministry of Tribal Affairs',
    category: 'SC/ST Welfare',
    amount: '₹2,000 - ₹5,800/month',
    amountValue: 69600,
    deadline: '30 Nov 2025',
    eligibility: ['SC/ST Category', 'Post-Matriculation courses', 'No income ceiling'],
    benefits: ['Full tuition fee reimbursement', 'Monthly maintenance', 'Study material allowance'],
    tags: ['SC/ST', 'Post-Matric', 'Full Coverage'],
    match: 94,
    status: 'Active',
    applyLink: 'https://scholarships.gov.in',
    color: 'from-purple-500 to-pink-600',
    initials: 'ST',
    featured: true,
    totalSeats: 0,
    documentsRequired: ['SC/ST Certificate', 'Income Certificate', 'Marksheets', 'Aadhaar'],
  },
  {
    schemeId: 'GOV-INSPIRE',
    name: 'INSPIRE Scholarship',
    ministry: 'Dept. of Science & Technology',
    category: 'Merit-Based Science',
    amount: '₹80,000/year',
    amountValue: 80000,
    deadline: '28 Feb 2026',
    eligibility: ['Top 1% in Class 12 Board', 'BSc/BS program in Natural Sciences', 'Final year students'],
    benefits: ['Annual scholarship ₹80,000', 'Summer Research Fellowship', 'Mentorship program'],
    tags: ['Science', 'Merit', 'Research'],
    match: 78,
    status: 'Active',
    applyLink: 'https://online-inspire.gov.in',
    color: 'from-teal-500 to-emerald-600',
    initials: 'IN',
    featured: false,
    totalSeats: 10000,
    documentsRequired: ['Board Certificate', 'Merit Certificate', 'Admission Letter', 'Aadhaar'],
  },
  {
    schemeId: 'GOV-AICTE-PRAGATI',
    name: 'AICTE Pragati Scholarship',
    ministry: 'AICTE / Ministry of Education',
    category: 'Girl Students',
    amount: '₹50,000/year',
    amountValue: 50000,
    deadline: '15 Dec 2025',
    eligibility: ['Girl students only', 'AICTE approved Technical Institute', 'Family income < ₹8 Lakh/year'],
    benefits: ['₹50,000 tuition support', 'Book grant', 'Incidentals grant'],
    tags: ['Girl Students', 'Technical', 'AICTE'],
    match: 88,
    status: 'Active',
    applyLink: 'https://www.aicte-india.org/bureaus/jk/AICTE_Pragati_Scholarship',
    color: 'from-pink-500 to-rose-600',
    initials: 'PG',
    featured: false,
    totalSeats: 5000,
    documentsRequired: ['Income Certificate', 'Admission Letter', '10th/12th Certificate', 'Aadhaar'],
  },
  {
    schemeId: 'GOV-NMMSS',
    name: 'National Means-cum-Merit Scholarship',
    ministry: 'Ministry of Education',
    category: 'Economically Weaker',
    amount: '₹12,000/year',
    amountValue: 12000,
    deadline: '31 Jan 2026',
    eligibility: ['Class 9 to 12 students', 'Family income < ₹3.5 Lakh/year', 'Min 55% in Class 8'],
    benefits: ['Annual scholarship', 'Secondary & Higher Secondary stage', 'Direct bank transfer'],
    tags: ['EWS', 'Merit', 'Secondary'],
    match: 73,
    status: 'Active',
    applyLink: 'https://scholarships.gov.in',
    color: 'from-amber-500 to-yellow-600',
    initials: 'NM',
    featured: false,
    totalSeats: 100000,
    documentsRequired: ['Income Certificate', 'Caste Certificate (if applicable)', '8th Marksheet', 'Aadhaar'],
  },
];

// ─── SchemeCard Component ─────────────────────────────────────────────────────
const SchemeCard = ({ scheme, onApply }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-[2rem] glass-card border border-white/5 hover:border-white/20 transition-all duration-500 group overflow-hidden relative`}>
      {scheme.featured && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent via-accent-ai to-purple-500 opacity-80" />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-extrabold text-white bg-gradient-to-br ${scheme.color} flex-shrink-0 shadow-lg`}>
              {scheme.initials}
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-1 group-hover:text-accent transition-colors leading-snug">
                {scheme.name}
              </h3>
              <p className="text-[11px] text-text-3 font-semibold mt-1 flex items-center gap-1">
                <Building2 size={11} className="flex-shrink-0" />
                {scheme.ministry}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-full tracking-widest
              ${scheme.status === 'Active' ? 'bg-success/15 text-success border border-success/30' : 'bg-warning/15 text-warning border border-warning/30'}`}>
              {scheme.status}
            </span>
            {scheme.featured && (
              <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-1 rounded-full bg-accent-ai/15 text-accent-ai border border-accent-ai/30 tracking-widest">
                <Sparkles size={9} />FEATURED
              </span>
            )}
          </div>
        </div>

        {/* Amount & Tag Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 mb-0.5">Grant Amount</p>
            <p className="text-lg font-mono font-extrabold text-accent">{scheme.amount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 mb-0.5">Deadline</p>
            <p className="text-sm font-bold text-warning flex items-center gap-1 justify-end">
              <Clock size={13} />{scheme.deadline}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {scheme.tags.map((tag, i) => (
            <span key={i} className="text-[9px] font-extrabold uppercase tracking-[.1em] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-text-2">
              {tag}
            </span>
          ))}
          <span className="text-[9px] font-extrabold uppercase tracking-[.1em] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
            {scheme.category}
          </span>
        </div>

        {/* AI Match Score */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-base/30 border border-white/5 mb-4">
          <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/5" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent"
                strokeDasharray={94} strokeDashoffset={94 - (94 * scheme.match) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute text-[9px] font-mono font-extrabold text-text-1">{scheme.match}%</span>
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 leading-none mb-1">AI Eligibility Match</p>
            <p className="text-[11px] font-bold text-success">Strong Candidate</p>
          </div>
        </div>

        {/* Expandable Section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-text-3 hover:text-text-1 transition-colors py-2 border-t border-white/5"
        >
          <span>{expanded ? 'Hide Details' : 'View Eligibility & Docs'}</span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 mb-2">Eligibility Criteria</p>
              <ul className="space-y-1.5">
                {scheme.eligibility.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-2">
                    <CheckCircle2 size={13} className="text-success mt-0.5 flex-shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 mb-2">Benefits</p>
              <ul className="space-y-1.5">
                {scheme.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-2">
                    <Star size={13} className="text-accent mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3 mb-2">Documents Required</p>
              <div className="flex flex-wrap gap-1.5">
                {scheme.documentsRequired.map((d, i) => (
                  <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-bg-elevated/50 border border-white/5 text-text-2">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onApply(scheme)}
            className="flex-1 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-bold hover:bg-accent hover:text-bg-base transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            Apply Now <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
          <a
            href={scheme.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl glass border border-white/5 text-text-3 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center"
          >
            <ExternalLink size={16} />
          </a>
          <button className="w-10 h-10 rounded-xl glass border border-white/5 text-text-3 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center">
            <Bookmark size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stats Banner Component ────────────────────────────────────────────────────
const StatBanner = ({ count, totalAmount, categories }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    {[
      { label: 'Active Schemes', value: count, icon: Landmark, color: 'text-accent' },
      { label: 'Max Combined Aid', value: totalAmount, icon: BadgeDollarSign, color: 'text-success' },
      { label: 'Categories', value: categories, icon: Users, color: 'text-accent-ai' },
    ].map((stat, i) => (
      <div key={i} className="p-5 glass-card rounded-2xl border border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-bg-base/50 border border-border-default flex items-center justify-center flex-shrink-0">
          <stat.icon size={20} className={stat.color} />
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-3">{stat.label}</p>
          <p className={`text-xl font-mono font-extrabold ${stat.color}`}>{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);

// ─── Main GovernmentAidPage Component ────────────────────────────────────────
const GovernmentAidPage = ({ onApply }) => {
  const { user } = useUser();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [applyModal, setApplyModal] = useState(null);

  const categories = ['All', 'Central Government', 'OBC Welfare', 'SC/ST Welfare', 'Merit-Based Science', 'Girl Students', 'Economically Weaker'];

  // ── Firebase real-time listener ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'governmentSchemes'),
      (snapshot) => {
        if (snapshot.empty) {
          // If no data in Firestore, use local defaults
          setSchemes(DEFAULT_SCHEMES);
        } else {
          const list = [];
          snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
          setSchemes(list);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        // Fallback to default data
        setSchemes(DEFAULT_SCHEMES);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── Seed default schemes to Firestore ────────────────────────────────────
  const seedSchemes = async () => {
    setSeeding(true);
    try {
      for (const scheme of DEFAULT_SCHEMES) {
        await setDoc(doc(db, 'governmentSchemes', scheme.schemeId), {
          ...scheme,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setSeeding(false);
    }
  };

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filteredSchemes = schemes.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ministry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = filterCategory === 'All' || s.category === filterCategory;
    return matchSearch && matchCategory;
  });

  // Total max aid calculation
  const totalMaxAid = schemes.reduce((acc, s) => acc + (s.amountValue || 0), 0);
  const uniqueCategories = [...new Set(schemes.map((s) => s.category))].length;

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-up">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-ai/20 border border-accent-ai/40 flex items-center justify-center shadow-lg">
              <Building2 size={20} className="text-accent-ai" />
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-text-1">Government Aid Portal</h1>
          </div>
          <p className="text-text-3 text-sm font-semibold ml-14">
            Official Indian government scholarship & aid schemes — synced with National Scholarship Portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync/Seed Button */}
          <button
            onClick={seedSchemes}
            disabled={seeding}
            className="h-10 px-4 bg-bg-elevated/50 border border-border-default rounded-xl text-text-2 hover:text-accent hover:border-accent/30 transition-all flex items-center gap-2 font-bold text-sm disabled:opacity-50"
          >
            {seeding ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {seeding ? 'Syncing...' : 'Sync to DB'}
          </button>

          {/* NSP Link */}
          <a
            href="https://scholarships.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 bg-accent/10 border border-accent/30 rounded-xl text-accent font-bold text-sm flex items-center gap-2 hover:bg-accent hover:text-bg-base transition-all"
          >
            <Landmark size={16} /> NSP Portal
          </a>
        </div>
      </div>

      {/* ── Stats Banner ──────────────────────────────────────────────────── */}
      <StatBanner
        count={schemes.filter((s) => s.status === 'Active').length}
        totalAmount={`₹${(totalMaxAid / 100000).toFixed(1)}L+`}
        categories={uniqueCategories}
      />

      {/* ── Search & Filter Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-accent transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search schemes, ministries, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-bg-elevated/50 border border-border-default rounded-xl pl-11 pr-4 text-sm font-medium text-text-1 focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all placeholder:text-text-3"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`h-12 px-4 rounded-xl font-bold text-xs transition-all border ${
                filterCategory === cat
                  ? 'bg-accent text-bg-base border-accent shadow-lg shadow-accent/20'
                  : 'bg-bg-elevated/50 border-border-default text-text-2 hover:text-text-1 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-12 px-4 rounded-xl font-bold text-xs border border-border-default text-text-2 hover:border-white/20 transition-all focus:outline-none focus:border-accent cursor-pointer"
            style={{ backgroundColor: '#1a1e2e', color: '#c0c5d0' }}
          >
            <option value="All" style={{ backgroundColor: '#1a1e2e', color: '#c0c5d0' }}>All Categories</option>
            {categories.slice(1).map((c) => <option key={c} value={c} style={{ backgroundColor: '#1a1e2e', color: '#c0c5d0' }}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ── Content Area ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-[3px] border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-text-3 text-sm font-semibold">Loading government schemes...</p>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="p-12 glass rounded-3xl text-center border border-white/5">
          <CircleAlert size={48} className="text-text-3 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-1 mb-2">No Schemes Found</h3>
          <p className="text-text-3 text-sm mb-6">
            {searchTerm ? `No results for "${searchTerm}"` : 'No schemes match the selected criteria.'}
          </p>
          <button
            onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
            className="px-6 h-10 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm font-bold hover:bg-accent hover:text-bg-base transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-accent-ai rounded-full" />
            <h2 className="text-lg font-heading font-bold text-text-1">
              {filteredSchemes.length} Active Scheme{filteredSchemes.length !== 1 ? 's' : ''}
              {filterCategory !== 'All' ? ` · ${filterCategory}` : ''}
            </h2>
            <span className="ml-auto text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={13} className="text-success" /> NSP Verified
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme, idx) => (
              <SchemeCard
                key={scheme.schemeId || scheme.id || idx}
                scheme={scheme}
                onApply={(s) => setApplyModal(s)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Info Footer Banner ─────────────────────────────────────────────── */}
      <div className="mt-10 p-6 rounded-2xl bg-accent-ai/10 border border-accent-ai/20 flex gap-4 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-ai/10 blur-[60px] -mr-10 -mt-10 pointer-events-none" />
        <Info size={24} className="text-accent-ai flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-text-1 mb-1">National Scholarship Portal (NSP) Integration</h4>
          <p className="text-xs text-text-3 font-medium leading-relaxed">
            These schemes are sourced from the official Government of India NSP platform. Clicking "Apply Now" will
            redirect to the official portal or initiate an in-app scholarship application. Always verify deadlines
            and eligibility on <strong className="text-accent-ai">scholarships.gov.in</strong> before applying.
          </p>
        </div>
      </div>

      {/* ── Apply Confirmation Modal ───────────────────────────────────────── */}
      {applyModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setApplyModal(null)}
        >
          <div
            className="w-full max-w-md p-8 rounded-[2rem] bg-bg-surface border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${applyModal.color} flex items-center justify-center text-white text-xl font-extrabold mb-6`}>
              {applyModal.initials}
            </div>
            <h3 className="text-xl font-bold text-text-1 mb-1">{applyModal.name}</h3>
            <p className="text-sm text-text-3 font-semibold mb-6">{applyModal.ministry}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setApplyModal(null); if (onApply) onApply(applyModal); }}
                className="flex-1 h-12 rounded-xl bg-accent text-bg-base font-bold text-sm hover:bg-white transition-all shadow-xl"
              >
                Apply via EduFinance
              </button>
              <a
                href={applyModal.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setApplyModal(null)}
                className="flex-1 h-12 rounded-xl bg-bg-elevated border border-border-default text-text-1 font-bold text-sm hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} /> NSP Portal
              </a>
            </div>
            <button
              onClick={() => setApplyModal(null)}
              className="w-full mt-3 h-10 rounded-xl text-text-3 hover:text-text-1 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentAidPage;
