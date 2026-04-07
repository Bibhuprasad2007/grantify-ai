import React from 'react';
import { 
  LayoutDashboard, Sparkles, BadgeDollarSign, Landmark, 
  RefreshCw, GraduationCap, Building2, FolderOpen, 
  ClipboardList, Bell, UserCircle, ShieldCheck, 
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const SidebarItem = ({ icon: Icon, label, active, badge, isCollapsed, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
      flex items-center gap-3 px-4 py-2.5 my-0.5 cursor-pointer rounded-lg transition-all duration-200 group
      ${active 
        ? 'bg-accent/10 border-l-2 border-accent text-accent' 
        : 'text-text-2 hover:bg-white/5 hover:text-text-1 border-l-2 border-transparent'}
    `}>
      <Icon size={20} className={`${active ? 'text-accent' : 'text-text-2 group-hover:text-text-1'}`} />
      {!isCollapsed && (
        <div className="flex-1 flex justify-between items-center overflow-hidden whitespace-nowrap">
          <span className="text-sm font-medium">{label}</span>
          {badge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${badge === 'LIVE' ? 'bg-accent-ai text-white' : 'bg-accent text-bg-base'}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const NavigationGroup = ({ title, children, isCollapsed }) => {
  if (isCollapsed) return <div className="py-2 border-b border-border-default space-y-1">{children}</div>;
  return (
    <div className="mb-6">
      <h3 className="px-4 mb-2 text-[10px] font-bold tracking-widest text-text-3 uppercase">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

const Sidebar = ({ isCollapsed, toggleCollapse, onNavigate, activeView, onOpenAi }) => {
  const { user, logout } = useUser();
  
  const displayName = user?.displayName || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside 
      className={`
        h-full bg-bg-surface/80 backdrop-blur-xl border-r border-border-default/50 flex flex-col transition-all duration-300 relative z-40 shadow-2xl
        ${isCollapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Logo & Brand */}
      <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center">
          <GraduationCap size={18} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className="font-heading font-bold text-lg tracking-tight text-text-1">
            EduFinance <span className="text-accent">AI</span>
          </span>
        )}
      </div>

      {/* User Mini Profile */}
      {!isCollapsed && (
        <div className="px-4 mb-8">
          <button 
            onClick={() => onNavigate('profile')}
            className={`w-full p-3 rounded-xl bg-bg-elevated/50 border flex items-center gap-3 transition-all text-left hover:bg-white/5 group
              ${activeView === 'profile' ? 'border-accent shadow-lg shadow-accent/20' : 'border-border-default hover:border-accent/50'}
            `}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-accent/30 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent-ai/20 flex items-center justify-center border border-accent-ai/30 group-hover:bg-accent-ai/30 transition-colors">
                <span className="text-accent-ai font-bold text-xs">{initials}</span>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-text-1 truncate group-hover:text-accent transition-colors">{displayName}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-3 font-medium uppercase px-1.5 py-0.5 bg-bg-base border border-border-default rounded truncate">{user?.email?.split('@')[0] || 'Student'}</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        <NavigationGroup title="Overview" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            isCollapsed={isCollapsed} 
            onClick={() => onNavigate('dashboard')}
          />
          <SidebarItem 
            icon={Sparkles} 
            label="AI Assistant" 
            badge="LIVE" 
            active={activeView === 'ai-assistant'} 
            isCollapsed={isCollapsed} 
            onClick={() => onNavigate('ai-assistant')} 
          />
          <SidebarItem 
            icon={ShieldCheck} 
            label="Eligibility Check" 
            active={activeView === 'eligibility'} 
            isCollapsed={isCollapsed} 
            onClick={() => onNavigate('eligibility')} 
          />
        </NavigationGroup>

        <NavigationGroup title="Finances" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={BadgeDollarSign} 
            label="Apply Loan" 
            isCollapsed={isCollapsed} 
            active={activeView === 'apply-loan'}
            onClick={() => onNavigate('apply-loan')}
          />
          <SidebarItem 
            icon={Landmark} 
            label="Loan Offers" 
            isCollapsed={isCollapsed} 
            active={activeView === 'loan-offers'}
            onClick={() => onNavigate('loan-offers')}
          />
        </NavigationGroup>

        <NavigationGroup title="Opportunities" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={GraduationCap} 
            label="Apply Scholarship" 
            isCollapsed={isCollapsed} 
            active={activeView === 'apply-scholarship'}
            onClick={() => onNavigate('apply-scholarship')}
          />
          <SidebarItem 
            icon={Building2} 
            label="Government Aid" 
            isCollapsed={isCollapsed} 
            active={activeView === 'government-aid'}
            onClick={() => onNavigate('government-aid')}
          />
        </NavigationGroup>

        <NavigationGroup title="Manage" isCollapsed={isCollapsed}>
          <SidebarItem icon={FolderOpen} label="Verified Documents" isCollapsed={isCollapsed} active={activeView === 'verified-documents'} onClick={() => onNavigate('verified-documents')} />
          <SidebarItem 
            icon={ClipboardList} 
            label="Applications" 
            isCollapsed={isCollapsed} 
            active={activeView === 'applications'}
            onClick={() => onNavigate('applications')}
          />
          <SidebarItem 
            icon={Bell} 
            label="Notifications" 
            badge="3" 
            isCollapsed={isCollapsed} 
            active={activeView === 'notifications'}
            onClick={() => onNavigate('notifications')}
          />
        </NavigationGroup>

        <NavigationGroup title="Account" isCollapsed={isCollapsed}>
          <SidebarItem 
            icon={UserCircle} 
            label="Profile" 
            isCollapsed={isCollapsed} 
            active={activeView === 'profile'}
            onClick={() => onNavigate('profile')}
          />
          <SidebarItem icon={LogOut} label="Logout" isCollapsed={isCollapsed} onClick={handleLogout} />
        </NavigationGroup>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border-default space-y-2">
        <button 
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-3 hover:text-text-1 hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-3 w-full px-2"><ChevronLeft size={20} /> <span className="text-sm font-medium">Collapse</span></div>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
