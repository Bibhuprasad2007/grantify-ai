import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useUser } from '../context/UserContext';

const TopBar = () => {
  const { user, logout } = useUser();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const displayName = user?.displayName || 'User';
  const shortName = displayName.split(' ').map((n, i) => i === 0 ? n : n[0] + '.').join(' ');

  return (
    <header className="h-20 border-b border-border-default/50 bg-bg-surface/60 backdrop-blur-2xl px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left Section: Page Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-heading font-bold text-text-1">Dashboard</h2>
        <div className="hidden md:flex items-center text-text-3 text-xs gap-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-text-2 font-medium">Dashboard</span>
        </div>
      </div>

      {/* Right Section: Search & Actions */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search help, loans..." 
            className="w-64 h-10 bg-bg-base border border-border-default rounded-full pl-10 pr-4 text-sm text-text-1 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all placeholder:text-text-3"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-white/5 transition-all relative"
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-bg-surface scale-pop"></span>
            </button>
            {isNotificationsOpen && (
              <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />
            )}
          </div>

          <div className="h-6 w-[1px] bg-border-default mx-1"></div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-accent/30 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <User size={16} className="text-accent" />
                </div>
              )}
              <span className="text-sm font-medium text-text-1 hidden lg:block">{shortName}</span>
              <ChevronDown size={14} className={`text-text-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-xl glass border border-white/5 shadow-2xl p-2 z-50 animate-fade-up">
                <div className="p-3 border-b border-border-default mb-2">
                  <p className="text-sm font-bold text-text-1">{displayName}</p>
                  <p className="text-[10px] text-text-3">{user?.email || ''}</p>
                </div>
                <div className="h-[1px] bg-border-default my-2"></div>
                <button 
                  onClick={async () => { setIsUserMenuOpen(false); await logout(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
