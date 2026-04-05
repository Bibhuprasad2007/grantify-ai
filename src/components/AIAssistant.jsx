import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Plus, Zap, User, AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';

const PromptChip = ({ text, onClick }) => (
  <button 
    onClick={onClick}
    className="px-3 py-2 rounded-xl bg-bg-base/60 border border-white/5 text-[11px] font-bold text-text-2 hover:text-accent hover:border-accent/40 transition-all text-left group"
  >
    <div className="flex items-center gap-2">
      <Zap size={10} className="text-accent-ai group-hover:scale-125 transition-transform" />
      {text}
    </div>
  </button>
);

// --- Markdown-lite renderer for AI responses ---
const FormattedText = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold text
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-1 font-bold">$1</strong>');
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          const content = line.replace(/^[\s]*[-•]\s*/, '');
          formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-1 font-bold">$1</strong>');
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-accent mt-0.5 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatted }} />
            </div>
          );
        }
        // Numbered items
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          const content = numberedMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-1 font-bold">$1</strong>');
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-accent-ai font-mono font-bold shrink-0">{numberedMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          );
        }
        // Empty lines
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Regular text
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
};

const AIAssistant = ({ isOpen, toggleOpen }) => {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check backend health on open
  useEffect(() => {
    if (!isOpen) return;
    
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data.ai === 'configured' ? 'online' : 'no-key');
        } else {
          setServerStatus('offline');
        }
      } catch {
        setServerStatus('offline');
      }
    };
    
    checkHealth();
  }, [isOpen]);

  // Load chat history from Firestore
  useEffect(() => {
    if (!user?.uid || !isOpen) return;

    const q = query(
      collection(db, "aiChats"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({ role: 'user', text: data.userMessage, id: doc.id + '-u' });
        chats.push({ role: 'assistant', text: data.aiResponse, id: doc.id + '-a' });
      });

      if (chats.length === 0) {
        setMessages([{ 
          role: 'assistant', 
          text: `Hello ${user.displayName?.split(' ')[0] || 'there'}! 👋\n\nI'm your **Physics & Space AI** assistant. I can help you with:\n\n- Understanding **gravity, relativity**, and space\n- Exploring futuristic concepts like **antigravity**\n- Learning complex physics in simple ways\n\nWhat would you like to explore today?`,
          id: 'welcome'
        }]);
      } else {
        setMessages(chats);
      }
    }, (error) => {
      console.error("Chat history error:", error);
      setMessages([{ 
        role: 'assistant', 
        text: `Hello ${user.displayName?.split(' ')[0] || 'there'}! I'm ready to help you explore physics and space.`,
        id: 'welcome-fallback'
      }]);
    });

    return () => unsubscribe();
  }, [user?.uid, isOpen]);

  // Auto-scroll & focus
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || !user?.uid || isTyping) return;
    
    const userMsg = message.trim();
    setMessage('');
    
    // Show user message immediately
    setMessages(prev => [...prev, { role: 'user', text: userMsg, id: `temp-user-${Date.now()}` }]);
    setIsTyping(true);

    try {
      // Call the real backend API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
        }),
      });

      const data = await res.json();
      const aiResponse = data.response || "I couldn't process that request. Please try again.";

      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse, id: `temp-ai-${Date.now()}` }]);

      // Save to Firestore
      try {
        await addDoc(collection(db, "aiChats"), {
          userId: user.uid,
          userMessage: userMsg,
          aiResponse: aiResponse,
          personalized: data.personalized || false,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Error saving chat:", err);
      }

    } catch (error) {
      console.error("Chat API error:", error);
      setIsTyping(false);
      
      // Fallback response when server is down
      const fallbackResponse = "⚠️ I couldn't reach the AI server. Please make sure the backend is running with `npm run server`.";
      setMessages(prev => [...prev, { role: 'assistant', text: fallbackResponse, id: `error-${Date.now()}` }]);
    }
  };

  const prompts = [
    "Explain antigravity simply",
    "How does space travel work?",
    "What is the theory of relativity?",
    "Can we break the speed of light?",
    "Explain a black hole to a beginner",
    "Real science vs Sci-Fi gravity"
  ];

  const StatusBadge = () => {
    if (serverStatus === 'online') {
      return (
        <p className="text-[10px] text-accent-ai font-extrabold uppercase tracking-widest flex items-center gap-1">
          <span className="w-1 h-1 bg-success rounded-full animate-ping"></span> 
          <span className="w-1 h-1 bg-success rounded-full absolute"></span>
          AI Powered • Live
        </p>
      );
    }
    if (serverStatus === 'no-key') {
      return (
        <p className="text-[10px] text-warning font-extrabold uppercase tracking-widest flex items-center gap-1">
          <AlertTriangle size={8} /> API Key Needed
        </p>
      );
    }
    if (serverStatus === 'offline') {
      return (
        <p className="text-[10px] text-danger font-extrabold uppercase tracking-widest flex items-center gap-1">
          <WifiOff size={8} /> Server Offline
        </p>
      );
    }
    return (
      <p className="text-[10px] text-text-3 font-extrabold uppercase tracking-widest flex items-center gap-1">
        <span className="w-1 h-1 bg-text-3 rounded-full animate-pulse"></span> Connecting...
      </p>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={toggleOpen}
        className={`
          fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 h-14 rounded-full shadow-2xl transition-all duration-500
          ${isOpen ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
          bg-gradient-to-r from-accent to-accent-ai text-bg-base hover:scale-105 active:scale-95 group
        `}
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="font-bold text-sm">Ask AI Assistant</span>
        {serverStatus === 'online' && (
          <span className="w-2.5 h-2.5 bg-success rounded-full absolute top-0 right-0 animate-ping" />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bg-base/40 backdrop-blur-sm z-[60] animate-fade-in md:hidden"
          onClick={toggleOpen}
        />
      )}

      {/* Slide-up Chat Panel */}
      <div className={`
        fixed bottom-0 right-8 z-[70] w-full max-w-[340px] h-[640px] max-h-[calc(100vh-40px)] 
        transition-all duration-500 transform
        ${isOpen ? 'translate-y-0 opacity-100 mb-8' : 'translate-y-[110%] opacity-0 pointer-events-none'}
      `}>
        <div className="w-full h-full glass rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="p-5 border-b border-border-default flex items-center justify-between bg-gradient-to-r from-accent/10 to-accent-ai/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-ai flex items-center justify-center border border-accent-ai/40 shadow-ai-glow relative">
                <Sparkles size={20} className="text-white animate-pulse" />
                {serverStatus === 'online' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-bg-surface" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-1">EduFinance AI</h3>
                <StatusBadge />
              </div>
            </div>
            <button 
              onClick={toggleOpen}
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-white/5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Server offline warning */}
          {serverStatus === 'offline' && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2 animate-fade-up">
              <WifiOff size={14} className="text-danger shrink-0" />
              <p className="text-[10px] text-danger font-bold">
                Backend server not running. Start with: <code className="bg-bg-base px-1 py-0.5 rounded text-[9px]">npm run server</code>
              </p>
            </div>
          )}

          {serverStatus === 'no-key' && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-2 animate-fade-up">
              <AlertTriangle size={14} className="text-warning shrink-0" />
              <p className="text-[10px] text-warning font-bold">
                Add your Gemini API key in <code className="bg-bg-base px-1 py-0.5 rounded text-[9px]">server/.env</code>
              </p>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                <div className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border border-white/5 mt-1 ${msg.role === 'user' ? 'bg-accent/20' : 'bg-bg-elevated'}`}>
                    {msg.role === 'user' ? <User size={12} className="text-accent" /> : <Sparkles size={12} className="text-accent-ai" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-[12.5px] font-medium leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-accent text-bg-base rounded-br-md' 
                      : 'bg-bg-elevated/50 text-text-2 rounded-bl-md border border-white/5'
                  }`}>
                    {msg.role === 'assistant' ? <FormattedText text={msg.text} /> : msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-up">
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border border-white/5 bg-bg-elevated mt-1">
                    <Sparkles size={12} className="text-accent-ai animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-bl-md bg-bg-elevated/50 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-accent-ai/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-accent-ai/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-accent-ai/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      <span className="text-[10px] text-text-3 font-bold">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="px-4 py-3 flex flex-wrap gap-1.5 border-t border-border-default bg-bg-surface/30 max-h-[80px] overflow-y-auto custom-scrollbar">
            {prompts.map((p, i) => (
              <PromptChip key={i} text={p} onClick={() => { setMessage(p); inputRef.current?.focus(); }} />
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-bg-surface">
            <div className="relative">
              <input 
                ref={inputRef}
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isTyping ? "AI is thinking..." : "Ask about space, physics, antigravity..."}
                disabled={isTyping}
                className="w-full h-12 bg-bg-base border border-border-default rounded-2xl pl-4 pr-12 text-sm text-text-1 focus:outline-none focus:border-accent-ai/40 focus:ring-1 focus:ring-accent-ai/40 transition-all placeholder:text-text-3 disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !message.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-accent-ai text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-ai-glow disabled:opacity-30 disabled:scale-100"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[8px] text-text-3 text-center mt-2 font-medium">Powered by Google Gemini AI • Responses may not always be accurate</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
