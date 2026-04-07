import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Instagram, 
  Linkedin, 
  Twitter, 
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactNumbers = [
    { label: "Main Helpline (General)", number: "+91 1800-200-3001", info: "Toll-Free Support" },
    { label: "Scholarship Support", number: "+91 1800-200-3002", info: "Application Status" },
    { label: "Loan Guidance", number: "+91 1800-200-3003", info: "Bank-related Queries" },
    { label: "Technical Desk", number: "+91 1800-200-3004", info: "Login/App Errors" },
    { label: "Document Verification", number: "+91 1800-200-3005", info: "Aadhar/OCR Issues" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-6">
      <div className="text-center space-y-4 animate-fade-up">
        <h1 className="text-4xl font-extrabold text-heading tracking-tight">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-ai">Touch</span>
        </h1>
        <p className="text-text-3 font-medium max-w-xl mx-auto">Have a question? We’re here to help. Reach out to our specialized teams or send us a message directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Numbers Card */}
          <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 space-y-6 animate-fade-right">
            <h3 className="text-lg font-bold text-text-1 flex items-center gap-2">
              <PhoneCall className="text-accent" size={20} /> Customer Helplines
            </h3>
            <div className="space-y-4">
              {contactNumbers.map((item, idx) => (
                <div key={idx} className="group p-3 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all">
                  <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-bold text-text-1 group-hover:text-accent transition-colors">{item.number}</p>
                  <p className="text-[10px] text-accent/60 font-medium italic">{item.info}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Location Card */}
          <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 space-y-4 animate-fade-right" style={{animationDelay: '0.1s'}}>
             <div className="flex items-center gap-2 text-text-1 font-bold">
               <MapPin className="text-accent-ai" size={20} /> Our Office
             </div>
             <p className="text-xs text-text-3 font-medium leading-relaxed">
               5th Floor, AI Innovation Center,<br />
               Sector-62, Noida, Uttar Pradesh, 201301.
             </p>
          </div>

          {/* Socials Card */}
          <div className="flex justify-between p-4 glass-card rounded-2xl border border-white/5 animate-fade-right" style={{animationDelay: '0.2s'}}>
             <a href="#" className="p-3 bg-white/5 rounded-xl text-text-3 hover:text-accent hover:bg-accent/10 transition-all"><Instagram size={20} /></a>
             <a href="#" className="p-3 bg-white/5 rounded-xl text-text-3 hover:text-accent hover:bg-accent/10 transition-all"><Linkedin size={20} /></a>
             <a href="#" className="p-3 bg-white/5 rounded-xl text-text-3 hover:text-accent hover:bg-accent/10 transition-all"><Twitter size={20} /></a>
          </div>
        </div>

        {/* Main Contact Form */}
        <div className="lg:col-span-2 space-y-8 animate-fade-left">
           {/* Direct Emails & Hours */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-accent/10 border border-accent/20 space-y-3">
                 <Mail className="text-accent" size={24} />
                 <h4 className="font-bold text-text-1">Email Us</h4>
                 <div className="space-y-1">
                   <p className="text-xs text-text-3 italic">Student Support:</p>
                   <p className="text-sm font-bold text-text-1">support@edufinanceai.com</p>
                 </div>
                 <div className="space-y-1 pt-2">
                   <p className="text-xs text-text-3 italic">Business & Partners:</p>
                   <p className="text-sm font-bold text-text-1">hello@grantify.ai</p>
                 </div>
              </div>
              <div className="p-6 rounded-[2rem] bg-bg-surface/50 border border-white/5 space-y-3">
                 <Clock className="text-accent-ai" size={24} />
                 <h4 className="font-bold text-text-1">Operating Hours</h4>
                 <p className="text-xs text-text-3 font-medium leading-relaxed">
                   Mon - Fri: 9:00 AM – 7:00 PM<br />
                   Sat: 10:00 AM – 4:00 PM<br />
                   Sun: Closed (AI Online)
                 </p>
              </div>
           </div>

           {/* Message Form Area */}
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden backdrop-blur-xl">
             {isSubmitted ? (
               <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
                  <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-1">Message Sent Successfully!</h3>
                  <p className="text-text-3 text-sm">We'll get back to you within 24 hours.</p>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-text-1 mb-8">Send us a direct message</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest pl-2">Full Name</label>
                        <input 
                          required type="text" placeholder="Your name" 
                          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-accent transition-all text-sm" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest pl-2">Email Address</label>
                        <input 
                          required type="email" placeholder="email@example.com" 
                          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-accent transition-all text-sm" 
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest pl-2">Subject</label>
                     <input 
                       required type="text" placeholder="How can we help you?" 
                       value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                       className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-accent transition-all text-sm" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest pl-2">Your Message</label>
                     <textarea 
                       required rows="4" placeholder="Tell us more about your query..." 
                       value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                       className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-accent transition-all text-sm resize-none" 
                     ></textarea>
                  </div>
                  <button type="submit" className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-accent to-accent-hover text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-accent/20 transition-all group">
                    Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
               </form>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
