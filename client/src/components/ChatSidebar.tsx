import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, MessageCircle } from 'lucide-react';
import { api } from '../api';
import type { ChatMessage } from '../types';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

    if (userMsg.toLowerCase().includes('customer')) {
      navigate('/customers');
      setIsOpen(false);
    }

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
      {/* ── Floating Action Button & Label ── */}
      <div 
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-4 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <div className="bg-white px-4 py-2.5 rounded-xl shadow-lg border border-kev-border animate-float relative flex flex-col items-end cursor-pointer" onClick={() => setIsOpen(true)}>
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-kev-border pointer-events-none" />
          <span className="text-[13px] font-bold text-kev-primary leading-tight">Talk to Keventers AI</span>
          <span className="text-[11px] text-kev-text-secondary">Your marketing co-pilot</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-kev-primary/30 transition-all duration-300 bg-kev-primary hover:bg-kev-primary-hover"
          id="chat-fab"
        >
          <MessageCircle size={22} strokeWidth={1.8} className="text-white relative z-10" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl animate-ping bg-kev-primary/40 pointer-events-none" style={{ animationDuration: '3s' }} />
        </button>
      </div>

      <div 
        className={`fixed top-0 right-0 h-full w-full md:top-3 md:right-3 md:h-[calc(100vh-1.5rem)] md:w-[400px] bg-white border-l md:border border-kev-border md:shadow-xl md:rounded-xl flex flex-col z-50 transition-all duration-400 ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-kev-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-kev-accent-soft border border-kev-accent/20 flex items-center justify-center">
              <Sparkles className="text-kev-accent" size={16} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-kev-text">Keventers AI</h3>
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4" data-lenis-prevent>
          {messages.length === 0 && (
            <div className="text-center mt-16 px-6">
              <div className="w-14 h-14 rounded-2xl bg-kev-accent-soft border border-kev-accent/20 flex items-center justify-center mx-auto mb-5">
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
                    className="text-left text-[13px] px-4 py-2.5 rounded-xl bg-kev-surface-solid border border-kev-border text-kev-text-secondary hover:text-kev-text hover:border-kev-border-hover transition-all"
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
                    ? 'bg-kev-primary text-white rounded-2xl rounded-br-md shadow-md shadow-kev-primary/20' 
                    : 'bg-kev-surface-solid text-kev-text rounded-2xl rounded-bl-md border border-kev-border [&_p]:mb-2 last:[&_p]:mb-0 [&_strong]:font-bold [&_strong]:text-kev-text-dark [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-kev-surface-solid rounded-2xl rounded-bl-md px-5 py-3.5 border border-kev-border flex items-center gap-1.5">
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
              placeholder="Ask Keventers AI anything..."
              className="input w-full py-3.5 pl-4 pr-12 text-[14px]"
              id="chat-input"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-1.5 p-2 rounded-lg bg-kev-primary text-white disabled:opacity-30 transition-all hover:shadow-md hover:shadow-kev-primary/20"
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
