import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Paperclip, Mic, MicOff, Send, FileText, 
  Image as ImageIcon, MoreVertical, CheckCircle2 
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const AIAssistantPage = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Fetch Chat History
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "aiPageChats"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'file') {
           chats.push({ role: 'user', type: 'file', fileName: data.fileName, fileSize: data.fileSize, content: data.userMessage, id: doc.id + '-u' });
        } else if (data.type === 'voice') {
           chats.push({ role: 'user', type: 'voice', duration: data.duration, content: data.userMessage, id: doc.id + '-u' });
        } else {
           chats.push({ role: 'user', type: 'text', content: data.userMessage, id: doc.id + '-u' });
        }
        if (data.aiResponse) {
          chats.push({ role: 'ai', type: 'text', content: data.aiResponse, id: doc.id + '-a', timestamp: data.timestamp });
        }
      });

      if (chats.length === 0) {
        setMessages([]); // Initially empty to show welcome block
      } else {
        setMessages(chats);
      }
    }, (error) => {
      console.error("Chat history error:", error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const addMessageToDB = async (msgObj, aiReply = null) => {
    try {
      await addDoc(collection(db, "aiPageChats"), {
        userId: user.uid,
        userMessage: msgObj.content,
        aiResponse: aiReply,
        type: msgObj.type || 'text',
        fileName: msgObj.fileName || null,
        fileSize: msgObj.fileSize || null,
        duration: msgObj.duration || null,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Error saving chat:", e);
    }
  };

  const sendMessage = async (text, msgType = 'text', fileData = null) => {
    if (!text.trim() && !fileData) return;
    
    // Add locally immediately
    const userMsg = {
      role: 'user',
      type: msgType,
      content: text,
      fileName: fileData?.fileName,
      fileSize: fileData?.fileSize,
      duration: fileData?.duration,
    };
    
    setMessages(prev => [...prev, { ...userMsg, id: Date.now().toString() }]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
        })
      });
      
      const data = await response.json();
      const reply = data.response || "Sorry, I couldn't respond right now.";
      
      setMessages(prev => [...prev, { role: 'ai', type: 'text', content: reply, id: (Date.now()+1).toString() }]);
      await addMessageToDB(userMsg, reply);
      
    } catch (err) {
      const errorReply = "⚠️ Unable to connect to the AI server. Please make sure the backend is running.";
      setMessages(prev => [...prev, { role: 'ai', type: 'text', content: errorReply, id: (Date.now()+1).toString() }]);
      await addMessageToDB(userMsg, errorReply);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = 2, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Max 10MB allowed');
      return;
    }
    
    const isImage = file.type.startsWith('image/');
    
    // Simulate upload and send message
    setTimeout(() => {
      sendMessage(`I've uploaded: ${file.name}`, 'file', {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        isImage
      });
    }, 500);
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        setIsRecording(true);
        recognitionRef.current.start();
      } else {
        alert("Voice input is not supported in this browser.");
      }
    }
  };

  const prompts = [
    "Check my eligibility",
    "Best scholarships for me",
    "Explain my loan terms",
    "Upload my marksheet"
  ];

  // Helper for rendering Markdown-like bold and newlines
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\n)/g);
    return parts.map((part, i) => {
      if (part === '\n') return <br key={i} />;
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.replace(/\*\*/g, '')}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-bg-base relative glass border-none rounded-3xl overflow-hidden shadow-2xl">
      
      {/* SECTION 1: TOPBAR */}
      <div className="h-16 border-b border-white/5 bg-bg-surface/60 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-10 relative">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-text-1">AI Assistant</h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-success/30 bg-success/10 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            <span className="text-[10px] font-bold text-success uppercase tracking-wider">Online</span>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-full bg-bg-elevated/40 border border-white/5 flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-white/10 transition-colors">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <button className="w-9 h-9 rounded-full bg-bg-elevated/40 border border-white/5 flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-white/10 transition-colors relative">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-accent-ai rounded-full"></span>
          </button>
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 overflow-hidden flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user?.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span className="text-accent text-xs font-bold">{user?.displayName?.charAt(0) || 'U'}</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar relative">
        {messages.length === 0 ? (
          /* Welcome Block */
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(129,140,248,0.3)]">
              <Sparkles size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-1 mb-3">EduFinance AI Assistant</h1>
            <p className="text-text-2 text-lg mb-10 max-w-md">
              Ask me anything about loans, scholarships, documents or eligibility
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
              {prompts.map((prompt, idx) => (
                <button 
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="px-4 py-3 rounded-xl glass-card text-sm text-text-1 hover:text-accent hover:border-accent/40 transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex items-end gap-3 animate-fade-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center shrink-0 shadow-lg">
                    <Sparkles size={14} className="text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-accent/10 border border-accent/20 text-text-1 rounded-br-sm' 
                    : 'glass-card border-none text-text-2 rounded-bl-sm leading-relaxed'
                }`}>
                  {msg.type === 'file' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center">
                        <FileText size={20} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-1">{msg.fileName}</p>
                        <p className="text-xs text-text-3">{msg.fileSize} • PDF</p>
                      </div>
                    </div>
                  ) : msg.type === 'voice' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-ai/20 flex items-center justify-center">
                        <Mic size={18} className="text-accent-ai" />
                      </div>
                      <div className="flex items-center gap-1">
                         <div className="w-1 h-3 bg-accent-ai rounded-full animate-pulse"></div>
                         <div className="w-1 h-4 bg-accent-ai rounded-full animate-pulse delay-75"></div>
                         <div className="w-1 h-5 bg-accent-ai rounded-full animate-pulse delay-150"></div>
                         <div className="w-1 h-3 bg-accent-ai rounded-full animate-pulse delay-75"></div>
                         <span className="text-xs text-text-3 font-mono ml-2">0:04</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[15px]">
                      {msg.role === 'ai' ? renderFormattedText(msg.content) : msg.content}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && user?.photoURL && (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-white/10 shrink-0" />
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-end gap-3 justify-start animate-fade-up">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-ai flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="glass-card rounded-2xl rounded-bl-sm px-5 py-4 flex gap-1.5 h-[46px] items-center">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* SECTION 3: INPUT SECTION */}
      <div className="p-4 sm:p-6 border-t border-white/5 bg-bg-surface/50 backdrop-blur-2xl shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.docx" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20 hover:bg-accent/20 transition-colors flex items-center gap-1.5"
            >
              <Paperclip size={14} />
              + Add File / Photo
            </button>
            <button 
              onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                isRecording 
                  ? 'bg-danger/10 text-danger border-danger/30 animate-pulse ring-2 ring-danger/20' 
                  : 'bg-accent-ai/10 text-accent-ai border-accent-ai/20 hover:bg-accent-ai/20'
              }`}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              {isRecording ? 'Recording... tap to stop' : 'Voice Input'}
            </button>
          </div>

          {/* Input Box */}
          <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your loans, scholarships or eligibility..."
              className="w-full bg-bg-base border border-white/10 rounded-2xl py-3.5 pl-4 pr-16 text-text-1 text-sm focus:outline-none focus:border-accent-ai/40 focus:ring-1 focus:ring-accent-ai/40 transition-all placeholder:text-text-3 resize-none min-h-[52px] max-h-32 custom-scrollbar"
              rows={Math.min(4, inputText.split('\n').length || 1)}
            />
            <button 
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className={`absolute right-2 bottom-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                inputText.trim() && !isLoading 
                  ? 'bg-gradient-to-r from-accent to-accent-ai text-white hover:shadow-lg hover:scale-105' 
                  : 'bg-bg-elevated text-text-3 cursor-not-allowed'
              }`}
            >
              <Send size={16} className={inputText.trim() && !isLoading ? 'ml-0.5' : ''} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AIAssistantPage;
