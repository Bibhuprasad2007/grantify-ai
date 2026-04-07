import React from 'react';
import { MessageSquare, Send, User, Landmark, Users } from 'lucide-react';

const CommPanel = () => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-heading font-extrabold text-white">Communication <span className="text-success">Portal</span></h2>
    <div className="flex flex-col items-center justify-center min-h-[400px] glass border border-white/5 rounded-3xl text-text-3 px-6 text-center">
       <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-success mb-4 opacity-50">
          <MessageSquare size={32} />
       </div>
       <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Secure Message Hub</h3>
       <p className="text-xs max-w-sm leading-relaxed">The internal communication system is ready. Messages from students or district officers will appear here once new conversations are initiated.</p>
    </div>
  </div>
);

export default CommPanel;
