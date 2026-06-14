import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Segment } from '../types';
import { Sparkles, Loader2, Search, Users, Layers, X, MapPin } from 'lucide-react';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<{ query: any, count: number } | null>(null);
  const [viewingSegment, setViewingSegment] = useState<any>(null);
  const [loadingSegment, setLoadingSegment] = useState(false);

  const handleViewData = async (id: string) => {
    setLoadingSegment(true);
    setViewingSegment(null);
    try {
      const data = await api.segments.getById(id);
      setViewingSegment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSegment(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const data = await api.segments.getAll();
      setSegments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.segments.preview({ naturalLanguageQuery: input });
      setPreview({ query: res.mongoQuery, count: res.estimatedCount });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!input.trim() || !preview) return;
    setIsGenerating(true);
    try {
      await api.segments.create({ naturalLanguageQuery: input });
      setInput('');
      setPreview(null);
      await fetchSegments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-12">
      {/* ── Header ── */}
      <header>
        <h1 className="text-3xl font-heading font-extrabold tracking-tight">Segments</h1>
        <p className="text-kev-muted mt-1.5 text-sm font-medium">Build hyper-targeted audiences using plain English.</p>
      </header>

      {/* ── AI Creator ── */}
      <div className="glass-card p-8 relative overflow-hidden gradient-border">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-kev-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-kev-accent/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kev-accent/15 to-kev-accent/5 border border-kev-accent/15 flex items-center justify-center">
                <Sparkles className="text-kev-accent" size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-kev-text">Describe your audience</h2>
                <p className="text-[12px] text-kev-muted">AI will generate the MongoDB query for you</p>
              </div>
            </div>
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); setPreview(null); }}
              placeholder="e.g. Find customers from Mumbai who haven't ordered in 60 days and spent over ₹2000 total..."
              className="glass-input w-full p-5 text-[15px] font-medium resize-none h-36 leading-relaxed"
              id="segment-query-input"
            />
            
            <div className="mt-5 flex justify-end">
              {!preview ? (
                <button 
                  onClick={handlePreview}
                  disabled={!input.trim() || isGenerating}
                  className="glow-button px-7 py-3 flex items-center gap-2 text-sm"
                  id="segment-preview-btn"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  Find Segment
                </button>
              ) : (
                <button 
                  onClick={handleCreate}
                  disabled={isGenerating}
                  className="px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                  id="segment-save-btn"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Layers size={18} />}
                  Save Segment
                </button>
              )}
            </div>
          </div>
          
          {preview && (
            <div className="lg:w-1/3 animate-fade-in-up border-l border-kev-border pl-8 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kev-muted mb-3">Estimated Audience</p>
              <div className="flex items-end gap-2.5 mb-6">
                <span className="text-5xl font-heading font-bold gradient-text-primary">{preview.count}</span>
                <span className="text-base font-semibold text-kev-muted mb-1.5">users</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kev-muted mb-2">Generated Query</p>
              <code className="text-[11px] font-mono text-kev-text-secondary bg-kev-bg-alt/80 p-4 rounded-xl border border-kev-border block break-all max-h-40 overflow-y-auto leading-relaxed">
                {JSON.stringify(typeof preview.query === 'string' ? JSON.parse(preview.query) : preview.query, null, 2)}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* ── Saved Segments ── */}
      <div>
        <h2 className="text-xl font-heading font-bold mb-5 flex items-center gap-2.5">
          <Layers size={18} className="text-kev-primary" />
          Saved Segments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="glass-card h-48 animate-shimmer opacity-0 animate-fade-in-up" />)
          ) : segments.map(seg => (
            <div key={seg._id} className="glass-card p-6 flex flex-col group hover:-translate-y-0.5 opacity-0 animate-fade-in-up">
              <div className="flex justify-between items-start mb-5 gap-3">
                <h3 className="font-heading font-bold text-lg leading-snug text-kev-text">{seg.name}</h3>
                {seg.aiGenerated && (
                  <div className="w-7 h-7 rounded-lg bg-kev-accent-soft border border-kev-accent/15 flex items-center justify-center shrink-0">
                    <Sparkles size={13} strokeWidth={1.8} className="text-kev-accent" />
                  </div>
                )}
              </div>
              
              <div className="mb-6 flex items-end gap-2">
                <span className="text-3xl font-heading font-bold gradient-text-primary">{seg.customerCount.toLocaleString()}</span>
                <span className="text-sm font-medium text-kev-muted mb-0.5 flex items-center gap-1">
                  <Users size={13} strokeWidth={1.5} /> users
                </span>
              </div>

              <div className="mt-auto pt-4 border-t border-kev-border/30 flex justify-between items-center">
                <span className="text-[11px] text-kev-muted font-medium">
                  {new Date(seg.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => handleViewData(seg._id)}
                  className="text-[12px] font-semibold text-kev-muted hover:text-kev-primary transition-colors uppercase tracking-wider"
                >
                  View Data
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Slide-out Drawer for Segment Data ── */}
      <div 
        className={`fixed top-3 right-3 h-[calc(100vh-1.5rem)] w-[400px] glass-card flex flex-col z-30 transition-all duration-400 ${viewingSegment || loadingSegment ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
      >
        <div className="p-6 border-b border-kev-border flex justify-between items-start">
          <div>
            <h2 className="font-heading font-bold text-xl text-kev-text">
              {viewingSegment ? viewingSegment.name : 'Loading...'}
            </h2>
            {viewingSegment && (
              <p className="text-kev-muted font-medium mt-0.5 text-[13px]">
                {viewingSegment.customerCount} customers
              </p>
            )}
          </div>
          <button 
            onClick={() => setViewingSegment(null)}
            className="p-2 rounded-lg text-kev-muted hover:text-kev-text hover:bg-white/[0.03] transition-all"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingSegment ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-kev-muted" /></div>
          ) : viewingSegment?.customerIds?.map((cust: any) => (
            <div key={cust._id} className="p-4 rounded-xl bg-kev-bg-alt/60 border border-kev-border/50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="font-heading font-bold text-[14px] text-kev-text">{cust.name}</span>
                <span className="text-[12px] font-bold text-kev-primary">{cust.engagementScore}%</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-kev-muted">
                <MapPin size={12} /> {cust.city}
                <span className="mx-1">•</span>
                ₹{cust.totalSpend.toLocaleString()}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {cust.tags?.map((tag: string) => (
                  <span key={tag} className="text-[9px] px-2 py-0.5 rounded uppercase tracking-wider border border-kev-border bg-white/[0.02]">
                    {(tag || '').replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {(viewingSegment || loadingSegment) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden" onClick={() => setViewingSegment(null)} />
      )}
    </div>
  );
}
