import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Landmark, CheckCircle2, ChevronRight, Info, Search, Filter } from 'lucide-react';

const LoanCard = ({ title, interestRate, maxAmount, tenure, approvalConfidence, aiTag, delay, onClick }) => {
  const initials = title ? title.substring(0, 2).toUpperCase() : 'L';
  const popular = approvalConfidence > 90;
  
  return (
    <div className={`p-8 rounded-[2.5rem] glass relative group overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-500 stagger-up-${delay}`}>
      {popular && (
        <div className="absolute top-0 right-10 py-1.5 px-6 bg-gradient-to-r from-accent to-accent-ai text-[10px] font-extrabold text-bg-base rounded-b-xl uppercase tracking-widest shadow-xl shadow-accent/20 z-10">
          Top Choice
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-extrabold bg-bg-base border border-border-default text-accent shadow-inner">
            {initials}
          </div>
          <div>
            <h4 className="text-base font-bold text-text-1 group-hover:text-accent transition-colors">{title}</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-bold text-success uppercase tracking-widest">{aiTag}</span>
              <span className="text-[10px] font-bold text-text-3 ml-2 tracking-tighter">({approvalConfidence}% Approval Match)</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-text-3 uppercase tracking-[.2em] mb-1">Fixed Rate</p>
          <span className="text-3xl font-mono font-extrabold text-white">{interestRate}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 border-y border-border-default/50 py-6">
        <div>
          <p className="text-[10px] font-extrabold text-text-3 uppercase tracking-widest mb-1.5">Max Amount</p>
          <p className="text-xl font-bold text-text-1">{maxAmount}</p>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-text-3 uppercase tracking-widest mb-1.5">Tenure</p>
          <p className="text-xl font-bold text-text-1">{tenure}</p>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {['No hidden processing fees', 'Instant disbursement in 24hrs', 'Flexible grace period'].map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-xs font-semibold text-text-2 group-hover:text-text-1 transition-colors">
            <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={12} className="text-success" />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex gap-4 h-12">
        <button className="flex-1 rounded-xl bg-bg-base border border-border-default text-sm font-bold text-text-1 hover:bg-bg-elevated transition-colors">
          View Details
        </button>
        <button onClick={onClick} className="flex-1 rounded-xl bg-accent text-bg-base text-sm font-bold hover:bg-white shadow-xl hover:shadow-accent-glow transition-all">
          Apply Now
        </button>
      </div>
    </div>
  );
};

const LoanOffersPage = ({ onApplyLoan }) => {
  const [loanOffers, setLoanOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Real-time Firestore listener for loans database!
  useEffect(() => {
    const unsubOffers = onSnapshot(collection(db, "loans"), (querySnapshot) => {
      const offersList = [];
      querySnapshot.forEach((doc) => {
        offersList.push({ id: doc.id, ...doc.data() });
      });
      setLoanOffers(offersList);
      setLoading(false);
    });

    return () => {
      unsubOffers();
    };
  }, []);

  const filteredOffers = loanOffers.filter(offer => 
    offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    offer.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-up pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/40 shadow-accent-glow">
              <Landmark size={20} className="text-accent" />
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-text-1">Loan Direct Offers</h1>
          </div>
          <p className="text-text-3 text-sm font-semibold ml-14">
            Curated active database synced in real-time with our mobile application.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by bank or loan name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-64 bg-bg-elevated/50 border border-border-default rounded-xl pl-11 pr-4 text-sm font-medium text-text-1 focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all placeholder:text-text-3"
            />
          </div>
          <button className="h-12 px-4 bg-bg-elevated/50 border border-border-default rounded-xl text-text-2 hover:text-text-1 hover:border-white/20 transition-all flex items-center gap-2 font-bold text-sm">
            <Filter size={18} /> Sort
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="p-12 glass rounded-3xl text-center border border-white/5">
          <h3 className="text-xl font-bold text-text-1 mb-2">No Loan Offers Found</h3>
          <p className="text-text-3">There are currently no active loan offers matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredOffers.map((offer, idx) => (
            <LoanCard 
              key={offer.id} 
              {...offer} 
              delay={(idx % 4) + 1} 
              onClick={onApplyLoan}
            />
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="p-6 rounded-2xl bg-accent-ai/10 border border-accent-ai/20 flex gap-4 items-start relative overflow-hidden group mt-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-ai/20 blur-[50px] -mr-10 -mt-10"></div>
        <Info size={24} className="text-accent-ai flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-text-1 mb-1">Real-time Datastore Sync Active</h4>
          <p className="text-xs text-text-3 font-medium leading-relaxed">
            All offers updated on this panel are securely broadcasted to the Android ecosystem. 
            Modifications including rate changes, eligibility criterias, and status flags take effect globally.
          </p>
        </div>
      </div>

    </div>
  );
};

export default LoanOffersPage;
