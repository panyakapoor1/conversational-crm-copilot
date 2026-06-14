import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, MessageCircle } from 'lucide-react';
import { api } from '../api';
import type { ChatMessage } from '../types';

export default function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const data = await api.chat.sendMessage(userMsg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center z-40 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, #7c5cfc, #9b6dff)',
          boxShadow: '0 6px 24px rgba(124, 92, 252, 0.4), 0 0 0 0 rgba(124, 92, 252, 0.2)',
        }}
        id="chat-fab"
      >
        <MessageCircle size={22} strokeWidth={1.8} className="text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-2xl animate-ping bg-kev-primary/20 pointer-events-none" style={{ animationDuration: '3s' }} />
      </button>

      {/* ── Chat Panel ── */}
      <div 
        className={`fixed top-3 right-3 h-[calc(100vh-1.5rem)] w-[400px] glass-card flex flex-col z-50 transition-all duration-400 ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-kev-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-kev-accent/20 to-kev-accent/5 border border-kev-accent/20 flex items-center justify-center">
              <Sparkles className="text-kev-accent" size={16} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-kev-text">Xeno AI</h3>
              <p className="text-[10px] text-kev-muted font-medium">CRM Intelligence</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-kev-muted hover:text-kev-text transition-colors p-2 rounded-lg hover:bg-white/[0.03]"
            id="chat-close-btn"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-16 px-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-kev-primary/10 to-kev-accent/5 border border-kev-border flex items-center justify-center mx-auto mb-5">
                <Sparkles size={24} strokeWidth={1.2} className="text-kev-accent" />
              </div>
              <p className="font-heading font-bold text-lg text-kev-text">Hi there 👋</p>
              <p className="text-sm mt-2.5 text-kev-muted leading-relaxed max-w-[85%] mx-auto">
                Ask me about your customers, campaigns, or segments. I have access to live CRM data.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {['How are my campaigns performing?', 'Suggest a new segment', 'Revenue breakdown by city'].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
                    className="text-left text-[13px] px-4 py-2.5 rounded-xl bg-kev-bg-alt/80 border border-kev-border text-kev-text-secondary hover:text-kev-text hover:border-kev-border-hover transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-kev-primary to-purple-500 text-white rounded-2xl rounded-br-md shadow-lg shadow-kev-primary-glow/30' 
                    : 'bg-kev-bg-alt/80 text-kev-text rounded-2xl rounded-bl-md border border-kev-border'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-kev-bg-alt/80 rounded-2xl rounded-bl-md px-5 py-3.5 border border-kev-border flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-kev-primary rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-kev-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 bg-kev-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-kev-border">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Xeno AI anything..."
              className="glass-input w-full py-3.5 pl-4 pr-12 text-[14px]"
              id="chat-input"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-br from-kev-primary to-purple-500 text-white disabled:opacity-30 transition-all hover:shadow-lg hover:shadow-kev-primary-glow/30"
              id="chat-send-btn"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
      
      {/* Overlay on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
