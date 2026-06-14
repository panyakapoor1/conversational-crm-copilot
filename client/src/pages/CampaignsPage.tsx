import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Campaign, Segment } from '../types';
import { Rocket, Plus, Loader2, Sparkles, MessageSquare, Smartphone, Mail, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email' | 'mixed'>('mixed');
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [campData, segData] = await Promise.all([
        api.campaigns.getAll(),
        api.segments.getAll()
      ]);
      setCampaigns(campData);
      setSegments(segData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'status-draft';
      case 'sending': return 'status-sending';
      case 'sent': case 'completed': return 'status-sent';
      default: return 'status-draft';
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !segmentId || !messageTemplate) return;
    setIsCreating(true);
    try {
      const res = await api.campaigns.create({ name, segmentId, messageTemplate, channel });
      navigate(`/campaigns/${res._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };



  return (
    <div className="space-y-10 animate-fade-in-up pb-12">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight">Campaigns</h1>
          <p className="text-kev-muted mt-1.5 text-sm font-medium">Manage and launch personalised messaging.</p>
        </div>
        {!showCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm shadow-md shadow-kev-primary/20">
            <Plus size={16} strokeWidth={2.5} /> New Campaign
          </button>
        )}
      </header>

      {/* ── Create Campaign Form (Slide Down) ── */}
      {showCreate && (
        <div className="card p-8 animate-fade-in-up relative">
          <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 text-kev-muted hover:text-kev-text p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
            ✕
          </button>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kev-primary/20 to-purple-500/10 border border-kev-primary/20 flex items-center justify-center">
              <Rocket size={18} strokeWidth={2} className="text-kev-primary" />
            </div>
            <h2 className="text-xl font-heading font-bold text-kev-text">New Campaign</h2>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-kev-muted mb-2 uppercase tracking-wider">Campaign Name</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="input w-full py-3.5 px-4 text-[14px]" required
                  placeholder="e.g. Summer Mango Reactivation"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-kev-muted mb-2 uppercase tracking-wider">Target Segment</label>
                <select 
                  value={segmentId} onChange={e => setSegmentId(e.target.value)}
                  className="input w-full py-3.5 px-4 text-[14px] appearance-none" required
                >
                  <option value="" disabled>Select Segment...</option>
                  {segments.map(s => <option key={s._id} value={s._id}>{s.name} ({s.customerCount.toLocaleString()} users)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-kev-muted mb-2 uppercase tracking-wider">Channel</label>
                <select 
                  value={channel} onChange={e => setChannel(e.target.value as 'whatsapp' | 'sms' | 'email' | 'mixed')}
                  className="input w-full py-3.5 px-4 text-[14px] appearance-none"
                >
                  <option value="mixed">AI Recommended (Mixed)</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-kev-muted mb-2 uppercase tracking-wider flex items-center gap-2">
                Message Intent <Sparkles size={12} className="text-kev-accent" />
              </label>
              <textarea 
                value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)}
                className="input w-full py-4 px-5 h-28 resize-none text-[14px] leading-relaxed" required
                placeholder="Describe what you want to say. The AI will personalize this for each user based on their engagement score and preferences..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={isCreating} className="btn-primary px-7 py-3 flex items-center gap-2 text-sm shadow-md shadow-kev-primary/20">
                {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Create Draft
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Campaigns Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="card h-48 animate-shimmer opacity-0 animate-fade-in-up" />)
        ) : campaigns.map(camp => (
          <div key={camp._id} onClick={() => navigate(`/campaigns/${camp._id}`)} className="card p-6 cursor-pointer group flex flex-col justify-between h-[200px] hover:-translate-y-0.5 opacity-0 animate-fade-in-up">
            <div>
              <div className="flex justify-between items-start mb-1.5">
                <span className={`status-badge ${getStatusClass(camp.status)}`}>
                  {camp.status}
                </span>
                <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-kev-border flex items-center justify-center">
                  {camp.channel === 'whatsapp' ? <MessageSquare size={14} className="text-kev-muted group-hover:text-emerald-400 transition-colors" /> :
                   camp.channel === 'email' ? <Mail size={14} className="text-kev-muted group-hover:text-blue-400 transition-colors" /> :
                   camp.channel === 'sms' ? <Smartphone size={14} className="text-kev-muted group-hover:text-purple-400 transition-colors" /> :
                   <Sparkles size={14} className="text-kev-muted group-hover:text-kev-accent transition-colors" />}
                </div>
              </div>
              <h3 className="font-heading font-bold text-lg mt-3 text-kev-text group-hover:text-kev-primary transition-colors line-clamp-1">{camp.name}</h3>
              <p className="text-[13px] font-medium text-kev-muted mt-1.5 line-clamp-1">Target: {typeof camp.segmentId === 'object' ? (camp.segmentId as { name?: string }).name : 'Segment'}</p>
            </div>
            
            <div className="mt-auto pt-5 border-t border-kev-border/30 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-kev-muted uppercase tracking-wider font-bold mb-0.5">Opened</p>
                <p className="font-heading font-bold text-xl text-kev-text">{camp.stats.total ? Math.round((camp.stats.opened / camp.stats.total) * 100) : 0}%</p>
              </div>
              <p className="text-[11px] font-medium text-kev-muted flex items-center gap-1.5"><Clock size={12} className="text-kev-muted/70" /> {new Date(camp.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
