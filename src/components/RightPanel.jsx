import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';

const ActivityItem = ({ title, time, dotColor, isLast }) => {
  const dotVariants = {
    green: 'bg-success shadow-success/20',
    blue: 'bg-accent shadow-accent/20',
    yellow: 'bg-warning shadow-warning/20',
    purple: 'bg-accent-ai shadow-accent-ai/20',
    red: 'bg-danger shadow-danger/20',
  };

  return (
    <div className="flex gap-4 relative group">
      {!isLast && (
        <div className="absolute left-1.5 top-3 w-[1px] h-full bg-border-default h-[calc(100%+8px)] group-last:hidden"></div>
      )}
      <div className={`w-3 h-3 rounded-full mt-1.5 z-10 flex-shrink-0 border-2 border-bg-surface ${dotVariants[dotColor] || 'bg-text-3'}`}></div>
      <div className="flex-1 pb-6 group-last:pb-0">
        <p className="text-sm font-medium text-text-2 group-hover:text-text-1 transition-colors leading-snug">
          {title}
        </p>
        <span className="text-[11px] text-text-3 font-semibold mt-1 inline-block uppercase tracking-wider">{time}</span>
      </div>
    </div>
  );
};

const RightPanel = () => {
  const activities = [
    { title: 'Loan application submitted for Harvard MBA', time: '12 mins ago', dotColor: 'blue' },
    { title: 'Scholarship match "Global Leaders 2026" identified by AI', time: '2 hours ago', dotColor: 'purple' },
    { title: 'Identity verification phase marked as completed', time: 'Yesterday', dotColor: 'green' },
    { title: 'Missing document: Transcript from previous degree', time: 'Yesterday', dotColor: 'red' },
    { title: 'Update: New repayment plan options available', time: '2 days ago', dotColor: 'yellow' },
    { title: 'Profile details updated by user', time: '3 days ago', dotColor: 'blue' },
    { title: 'Terms and conditions accepted', time: '4 days ago', dotColor: 'green' },
    { title: 'Account security setup complete', time: '1 week ago', dotColor: 'green' },
  ];

  return (
    <aside className="w-[300px] h-full bg-bg-surface border-l border-border-default flex flex-col hidden xl:flex">
      {/* Search/Calendar Section */}
      <div className="p-6 border-b border-border-default bg-bg-surface/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-1">Your Activity</h3>
          <button className="text-[10px] font-extrabold text-accent hover:text-accent-ai uppercase tracking-widest transition-colors">
            View All
          </button>
        </div>
        <div className="p-4 rounded-xl bg-bg-elevated/40 border border-border-default">
          <p className="text-[10px] uppercase font-extrabold text-text-3 mb-1 tracking-widest">Next Deadline</p>
          <p className="text-sm font-bold text-text-1">Apr 15, 2026</p>
          <div className="mt-2 w-full bg-bg-base h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-accent w-[65%]" />
          </div>
          <p className="text-[10px] font-bold text-text-3 mt-2">12 days remaining</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        <div className="space-y-2">
          {activities.map((activity, idx) => (
            <ActivityItem 
              key={idx} 
              {...activity} 
              isLast={idx === activities.length - 1} 
            />
          ))}
        </div>
      </div>

      {/* Recommended for You */}
      <div className="p-6 border-t border-border-default bg-gradient-to-t from-bg-base/20">
        <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-text-3 mb-4 flex items-center gap-2">
          Weekly Insight <ExternalLink size={12} className="text-accent-ai" />
        </h4>
        <div className="p-4 rounded-2xl glass-card relative overflow-hidden group hover:scale-[1.02] cursor-pointer transition-transform duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-accent-ai/10 rounded-full blur-2xl group-hover:bg-accent-ai/20 transition-colors"></div>
          <p className="text-xs font-bold text-text-1 leading-relaxed relative z-10">
            Based on your profile, you are eligible for 12 new grants.
          </p>
          <button className="flex items-center gap-2 text-[10px] font-extrabold text-accent mt-3 relative z-10 transition-all group-hover:gap-3 group-hover:translate-x-1">
            VIEW OPPORTUNITIES <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
