import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, Info, AlertTriangle, AlertCircle, 
  Sparkles, GraduationCap, Landmark, ArrowLeft, 
  Search, Filter, Inbox, Trash2, CheckSquare
} from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

const NotificationRow = ({ icon: Icon, color, title, desc, time, isRead }) => (
  <div className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-start gap-6 group hover:-translate-y-1 ${!isRead ? 'bg-accent/5 border-accent/20' : 'bg-bg-elevated/20 border-white/5 hover:border-white/10 hover:bg-bg-elevated/40'}`}>
    <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center bg-bg-base border border-border-default shadow-inner`}>
      <Icon size={24} className={color} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className={`text-sm md:text-base font-bold ${!isRead ? 'text-text-1' : 'text-text-2'} group-hover:text-accent transition-colors uppercase tracking-tight`}>
          {title}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-text-3 font-bold uppercase tracking-widest">{time}</span>
          {!isRead && <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse-slow shadow-accent-glow"></span>}
        </div>
      </div>
      <p className="text-sm text-text-3 font-medium line-clamp-2 leading-relaxed">
        {desc || 'Your application status has been updated. Please check the applications section for details.'}
      </p>
    </div>
  </div>
);

const NotificationsPage = ({ onBack }) => {
  const { user } = useUser();
  const [realApps, setRealApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Same logic as dropdown but full screen
    const unsubSch = onSnapshot(doc(db, "scholarshipApplications", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'Submitted') {
          setRealApps(prev => {
            const others = prev.filter(a => a.id !== 'sch-apply');
            return [{ id: 'sch-apply', type: 'Scholarship', status: 'Submitted', time: 'Recently' }, ...others];
          });
        }
      }
      setLoading(false);
    });

    const unsubLoan = onSnapshot(doc(db, "loanApplications", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'Submitted') {
          setRealApps(prev => {
            const others = prev.filter(a => a.id !== 'loan-apply');
            return [{ id: 'loan-apply', type: 'Loan', status: 'Submitted', time: 'Recently' }, ...others];
          });
        }
      }
    });

    return () => {
      unsubSch();
      unsubLoan();
    };
  }, [user?.uid]);

  const allNotifications = [
    ...realApps.map(app => ({
      id: app.id,
      icon: app.type === 'Scholarship' ? GraduationCap : Landmark,
      color: app.type === 'Scholarship' ? "text-accent-ai" : "text-accent",
      title: `${app.type} Applied Successfully`,
      desc: `Your ${app.type.toLowerCase()} application has been successfully submitted and is now under review.`,
      time: "Today",
      isRead: false
    })),
    {
      id: 'demo-1',
      icon: Check,
      color: "text-success",
      title: "Loan Application Approved",
      desc: "Great news! Your Student Loan application is approved by State Bank of India.",
      time: "2h ago",
      isRead: false
    },
    {
      id: 'demo-2',
      icon: Sparkles,
      color: "text-accent-ai",
      title: "AI Analysis Complete",
      desc: "Our AI found 3 new scholarships matching your updated profile academic scores.",
      time: "5h ago",
      isRead: false
    },
    {
      id: 'demo-3',
      icon: Info,
      color: "text-accent",
      title: "KYC Documents Verified",
      desc: "Aadhaar and PAN verification successful. You are now eligible to apply for instant loans.",
      time: "2d ago",
      isRead: true
    }
  ];

  return (
    <div className="max-w-[1000px] mx-auto py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-bg-surface border border-white/5 flex items-center justify-center text-text-3 hover:text-text-1 hover:border-white/20 transition-all shadow-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-heading font-extrabold text-text-1">Activity <span className="text-accent">Center</span></h1>
            </div>
            <p className="text-text-3 text-sm font-semibold uppercase tracking-widest leading-none">Stay updated with your latest alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-11 px-6 rounded-xl bg-bg-surface border border-white/5 text-xs font-bold text-text-2 hover:text-text-1 flex items-center gap-2">
            <CheckSquare size={16} /> Mark all read
          </button>
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-bg-surface border border-white/5 text-danger/60 hover:text-danger">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
            <p className="text-text-3 text-[10px] font-bold uppercase tracking-[.2em]">Fetching Notifications...</p>
          </div>
        ) : allNotifications.length > 0 ? (
          allNotifications.map((notif) => (
            <NotificationRow key={notif.id} {...notif} />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center glass rounded-[3rem] border border-white/5">
            <Inbox size={48} className="text-text-3 opacity-20 mb-4" />
            <h3 className="text-lg font-bold text-text-1">No Notifications Yet</h3>
            <p className="text-sm text-text-3">When you have alerts, they will appear here.</p>
          </div>
        )}
      </div>

      {/* Quick Help */}
      <div className="mt-20 p-8 rounded-[2.5rem] bg-bg-elevated/20 border border-white/5 text-center">
        <p className="text-[11px] font-bold text-text-3 uppercase tracking-[.2em] mb-4">Notification Settings</p>
        <p className="text-sm text-text-2 font-medium mb-8">You are currently receiving email and push notifications for all status changes.</p>
        <button className="px-10 h-12 bg-accent/10 border border-accent/20 rounded-xl text-xs font-bold text-accent hover:bg-accent hover:text-bg-base transition-all">
          Manage Delivery Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
