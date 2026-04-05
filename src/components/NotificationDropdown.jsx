import React from 'react';
import { Check, Info, AlertTriangle, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';

const NotificationItem = ({ icon: Icon, color, title, time, isRead }) => {
  return (
    <div className={`p-4 rounded-xl cursor-not-allowed group hover:bg-white/5 transition-all flex items-start gap-4 border border-transparent hover:border-white/5 ${!isRead ? 'bg-accent/5 focus:bg-accent/10' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-bg-base border border-border-default`}>
        <Icon size={18} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${!isRead ? 'text-text-1' : 'text-text-2'} truncate group-hover:text-text-1 transition-colors uppercase tracking-tight`}>
          {title}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-text-3 font-medium">{time}</span>
          {!isRead && <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow shadow-accent-glow"></span>}
        </div>
      </div>
    </div>
  );
};

const NotificationDropdown = ({ onClose }) => {
  return (
    <div className="absolute right-0 top-14 w-[360px] max-h-[500px] flex flex-col rounded-2xl glass border border-white/10 shadow-2xl z-50 animate-fade-up overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-surface/50">
        <h3 className="text-sm font-bold text-text-1">Notifications</h3>
        <button className="text-[11px] font-bold text-accent hover:text-accent-ai transition-colors uppercase tracking-widest">
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
        <p className="px-3 pt-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-text-3">Today</p>
        <NotificationItem 
          icon={Check} 
          color="text-success" 
          title="Loan Application Approved" 
          time="2 mins ago" 
          isRead={false} 
        />
        <NotificationItem 
          icon={Sparkles} 
          color="text-accent-ai" 
          title="AI Found 3 New Scholarships" 
          time="1 hour ago" 
          isRead={false} 
        />
        
        <p className="px-3 pt-4 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-text-3">This Week</p>
        <NotificationItem 
          icon={Info} 
          color="text-accent" 
          title="Documents Verified Successfully" 
          time="2 days ago" 
          isRead={true} 
        />
        <NotificationItem 
          icon={AlertCircle} 
          color="text-danger" 
          title="Payment Plan Renewal Reminder" 
          time="5 days ago" 
          isRead={true} 
        />
        <NotificationItem 
          icon={AlertTriangle} 
          color="text-warning" 
          title="Update Profile Information" 
          time="1 week ago" 
          isRead={true} 
        />
      </div>

      {/* Footer */}
      <button className="w-full py-4 text-center text-xs font-bold text-text-2 hover:text-accent border-t border-border-default hover:bg-white/5 transition-all flex items-center justify-center gap-2">
        View all notifications <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default NotificationDropdown;
