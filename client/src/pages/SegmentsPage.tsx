import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Segment } from '../types';
import { Sparkles, Loader2, Search, Users, Layers, X, MapPin, Filter } from 'lucide-react';

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
      setPreview({ query: res.mongoQuery, count: res.matchCount });
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
        <h1 className="text-4xl font-heading font-extrabold tracking-tight text-kev-text">Cohorts</h1>
        <p className="text-kev-muted mt-2 text-[15px] font-medium">Build and manage your customer cohorts for personalized targeting.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ── Left Column: Command Center (Builder + Estimate) ── */}
        <div className="lg:w-[400px] xl:w-[450px] flex flex-col gap-6 sticky top-8">
          
          {/* Builder */}
          <div className="card p-8 bg-white shadow-sm border border-kev-border/80">
            <h2 className="text-xl font-heading font-bold text-kev-text flex items-center gap-2 mb-6">
              <Filter className="text-kev-info" size={20} />
              Cohort Builder
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-kev-muted mb-2">Target Description</label>
                <textarea
                  value={input}
                  onChange={e => { setInput(e.target.value); setPreview(null); }}
                  placeholder="e.g. Spent over ₹1000 in Mumbai..."
                  className="input w-full p-4 text-[14px] resize-none h-32 leading-relaxed bg-kev-bg border-none focus:ring-1 focus:ring-kev-primary/20"
                  id="segment-query-input"
                />
              </div>

              <div className="flex justify-end">
                {!preview ? (
                  <button 
                    onClick={handlePreview}
                    disabled={!input.trim() || isGenerating}
                    className="btn-primary px-7 py-3 flex items-center gap-2 text-sm shadow-md"
                    id="segment-preview-btn"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    Preview Match
                  </button>
                ) : (
                  <button 
                    onClick={handleCreate}
                    disabled={isGenerating}
                    className="px-7 py-3 bg-kev-text text-white rounded-xl font-semibold hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                    id="segment-save-btn"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Layers size={18} />}
                    Save Cohort
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview Estimate Card */}
          <div className="rounded-3xl bg-gradient-to-br from-kev-primary to-[#183B2B] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/milkshake.png')] bg-cover bg-center opacity-10 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            <div className="relative z-10">
              <h3 className="font-heading font-bold text-[13px] uppercase tracking-wider mb-8 opacity-90 text-[#E8F5E9]">Live Preview Estimate</h3>
              
              <div className="flex items-end gap-3 mb-2">
                <span className="text-7xl font-heading font-extrabold leading-none tracking-tight">
                  {preview ? preview.count.toLocaleString() : '0'}
                </span>
              </div>
              <p className="text-sm font-medium text-white/80">shoppers matched</p>
              
              {/* Generated Rule removed per user request */}
            </div>
          </div>

        </div>

        {/* ── Right Column: Content Area (AI Groups + Saved Cohorts) ── */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* AI Target Groups */}
          <div className="card bg-kev-surface-solid p-8 border-none shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[url('/milkshake.png')] opacity-5 mix-blend-darken -translate-y-1/2 translate-x-1/4" />
            
            <h2 className="text-xl font-heading font-bold text-kev-text flex items-center gap-2 mb-2 relative z-10">
              <Sparkles className="text-kev-primary" size={20} />
              AI Target Groups
            </h2>
            <p className="text-sm text-kev-muted mb-6 relative z-10">Click any pre-generated AI target group to load it into the builder.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 relative z-10">
              {[
                { title: 'High-Value Churn Risk', desc: 'Spenders > ₹5k currently at risk.', q: 'Customers who have spent more than 5000 and have an engagement score under 30' },
                { title: 'Recent VIPs', desc: '> 5 orders and bought in last 30 days.', q: 'Customers with more than 5 orders who purchased in the last 30 days' },
                { title: 'One-Timers to Nudge', desc: 'Only 1 order, > 60 days ago.', q: 'Customers with exactly 1 order who have not purchased in the last 60 days' }
              ].map((card, i) => (
                <div 
                  key={i} 
                  onClick={() => { setInput(card.q); setPreview(null); }}
                  className="bg-white p-5 rounded-2xl border border-kev-border shadow-sm cursor-pointer hover:border-kev-primary/40 hover:-translate-y-0.5 transition-all group flex flex-col justify-between h-full"
                >
                  <div>
                    <h3 className="font-bold text-[14px] text-kev-text group-hover:text-kev-primary transition-colors mb-2 leading-snug">{card.title}</h3>
                    <p className="text-[12px] text-kev-text-secondary font-medium leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Cohorts List */}
          <div className="card p-6 border border-kev-border/80 bg-white">
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
              <Users className="text-kev-muted" size={18} />
              Saved Cohorts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-kev-surface-solid animate-shimmer" />)
              ) : segments.length > 0 ? (
                segments.map(seg => (
                  <div key={seg._id} className="p-5 rounded-xl bg-kev-surface-solid border border-kev-border/50 flex flex-col justify-between group hover:border-kev-primary/30 transition-colors">
                    <div className="mb-4">
                      <h4 className="font-bold text-[15px] text-kev-text mb-1 line-clamp-1">{seg.name}</h4>
                      <p className="text-[12px] text-kev-muted font-medium flex items-center gap-1.5">
                        <Users size={12} /> {seg.customerCount.toLocaleString()} matched shoppers
                      </p>
                    </div>
                    <div className="flex justify-end mt-auto">
                      <button 
                        onClick={() => handleViewData(seg._id)}
                        className="text-[12px] font-bold text-kev-primary bg-kev-primary-soft px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Data
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-sm text-kev-muted font-medium border-2 border-dashed border-kev-border rounded-xl">No saved cohorts yet. Generate one above!</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Slide-out Drawer for Segment Data ── */}
      <div 
        className={`fixed top-3 right-3 h-[calc(100vh-1.5rem)] w-[400px] bg-white border-l border-kev-border shadow-xl rounded-l-xl flex flex-col z-30 transition-all duration-400 ${viewingSegment || loadingSegment ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
      >
        <div className="p-6 border-b border-kev-border flex justify-between items-start">
          <div>
            <h2 className="font-heading font-bold text-xl text-kev-text">
              {viewingSegment ? viewingSegment.name : 'Loading...'}
            </h2>
            {viewingSegment && (
              <p className="text-kev-muted font-medium mt-0.5 text-[13px]">
                {viewingSegment.customerCount} shoppers
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3" data-lenis-prevent>
          {loadingSegment ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-kev-muted" /></div>
          ) : viewingSegment?.customerIds?.map((cust: any) => (
            <div key={cust._id} className="p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="font-heading font-bold text-[14px] text-kev-text">{cust.name}</span>
                <span className="text-[12px] font-bold text-kev-primary">{cust.engagementScore}%</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-kev-muted">
                <MapPin size={12} /> {cust.city}
                <span className="mx-1">•</span>
                ₹{cust.totalSpend.toLocaleString()}
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
