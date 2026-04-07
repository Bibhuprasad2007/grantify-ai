import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const TopBar = ({ onNavigate }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Navigation Links Data
  const navLinks = [
    { name: 'About', view: 'about' },
    { name: 'Schemes', view: 'schemes' },
    { name: 'How to apply', view: 'how-to-apply' },
    { name: 'Help', view: 'help' },
    { name: 'Contact us', view: 'contact' },
  ];

  return (
    <header className="h-20 border-b border-border-default/50 bg-bg-surface/60 backdrop-blur-2xl px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* Navigation Links (Left/Center) */}
      <nav className="hidden md:flex items-center gap-8 translate-y-0.5">
        {navLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => onNavigate(link.view)}
            className="text-sm font-medium text-text-2 hover:text-accent transition-colors duration-200 relative group"
          >
            {link.name}
            {/* Animated Underline */}
            <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-accent rounded-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
          </button>
        ))}
      </nav>

      {/* Notifications (Right) */}
      <div className="relative flex items-center">
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
    </header>
  );
};

export default TopBar;
