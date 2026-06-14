import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import type { Campaign, Communication } from '../types';
import { useCampaignUpdates } from '../hooks/useSocket';
import { Rocket, Sparkles, Send, CheckCircle2, MailOpen, MousePointerClick, XCircle, ChevronLeft, Loader2, Trash2 } from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const data = await api.campaigns.getById(id!);
      setCampaign(data.campaign);
      setCommunications(data.communications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useCampaignUpdates(id, (newStats) => {
    if (campaign) {
      setCampaign({ ...campaign, stats: newStats, status: newStats.queued === 0 && newStats.sent === 0 ? 'completed' : 'sending' });
    }
  });

  const handleSend = async () => {
    if (!id) return;
    setSending(true);
    try {
      await api.campaigns.send(id);
      await fetchCampaign();
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!id) return;
    setGeneratingReport(true);
    try {
      const res = await api.campaigns.getIntelligence(id);
      setCampaign(prev => prev ? { ...prev, intelligenceReport: res.report } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return;
    try {
      await api.campaigns.delete(id);
      window.history.back();
    } catch (err) {
      console.error(err);
      alert('Failed to delete campaign');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-kev-muted font-medium"><div className="w-10 h-10 border-4 border-kev-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!campaign) return <div className="flex items-center justify-center h-[60vh] font-heading font-bold text-2xl text-kev-text">Campaign not found</div>;

  const statBars = [
    { label: 'Sent', key: 'sent', val: campaign.stats.sent, icon: Send, color: 'from-blue-500 to-cyan-400' },
    { label: 'Delivered', key: 'delivered', val: campaign.stats.delivered, icon: CheckCircle2, color: 'from-emerald-500 to-teal-400' },
    { label: 'Opened', key: 'opened', val: campaign.stats.opened, icon: MailOpen, color: 'from-kev-primary to-purple-400' },
    { label: 'Clicked', key: 'clicked', val: campaign.stats.clicked, icon: MousePointerClick, color: 'from-kev-accent to-amber-400' },
    { label: 'Failed', key: 'failed', val: campaign.stats.failed, icon: XCircle, color: 'from-red-500 to-rose-400' },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'status-draft';
      case 'sending': return 'status-sending';
      case 'sent': case 'completed': return 'status-sent';
      case 'failed': return 'status-failed';
      default: return 'status-draft';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Back button */}
      <button 
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-[13px] font-semibold text-kev-muted hover:text-kev-text transition-colors group mb-2"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Campaigns
      </button>

      {/* ── Hero Header ── */}
      <header className="card p-8 lg:p-10 flex flex-col md:flex-row justify-between md:items-center gap-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-kev-primary/10 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-white">{campaign.name}</h1>
            <span className={`status-badge ${getStatusClass(campaign.status)} shadow-lg`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-[14px] font-medium text-kev-text-secondary flex items-center gap-2">
            Targeting <strong className="text-kev-text font-bold px-2 py-0.5 bg-white/[0.05] rounded border border-kev-border">{typeof campaign.segmentId === 'object' ? campaign.segmentId.name : 'Segment'}</strong> via <strong className="text-kev-text font-bold capitalize px-2 py-0.5 bg-white/[0.05] rounded border border-kev-border">{campaign.channel}</strong>
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-3 md:items-center">
          {campaign.status === 'draft' && (
            <button onClick={handleSend} disabled={sending} className="btn-primary px-8 py-3.5 flex items-center gap-3 shadow-md shadow-kev-primary/20">
              {sending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Dispatching...</> : <>Launch Campaign <Rocket size={18} /></>}
            </button>
          )}
          <button onClick={handleDelete} className="px-5 py-3.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center justify-center gap-2 text-sm font-bold tracking-wider uppercase">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Delivery Metrics ── */}
        <div className="card p-8 lg:p-10 lg:col-span-1 h-[600px] flex flex-col relative overflow-hidden">
          <h2 className="text-xl font-heading font-bold mb-8 text-kev-text">Delivery Metrics</h2>
          <div className="mb-10 relative z-10">
            <p className="text-[11px] text-kev-muted uppercase tracking-wider font-bold mb-1">Total Audience</p>
            <p className="text-5xl font-heading font-bold gradient-text">{campaign.stats.total.toLocaleString()}</p>
          </div>
          
          <div className="space-y-7 flex-1 relative z-10 flex flex-col justify-center">
            {statBars.map(bar => {
              const width = campaign.stats.total > 0 ? `${(bar.val / campaign.stats.total) * 100}%` : '0%';
              return (
                <div key={bar.key}>
                  <div className="flex justify-between items-end mb-2 text-[12px] font-semibold">
                    <span className="flex items-center gap-2 text-kev-text-secondary"><bar.icon size={14} strokeWidth={2} /> {bar.label}</span>
                    <span className="text-kev-text">{bar.val.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-kev-surface-solid rounded-full h-2 overflow-hidden shadow-sm">
                    <div className={`h-full rounded-full bg-gradient-to-r ${bar.color} transition-all duration-700 ease-out shadow-lg`} style={{ width }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* ── AI Debrief ── */}
          {campaign.status !== 'draft' && campaign.status !== 'sending' && (
            <div className="card p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-kev-primary/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6 pb-5 border-b border-kev-border relative z-10">
                <h2 className="text-xl font-heading font-bold flex items-center gap-2.5 text-kev-text">
                  <Sparkles size={18} className="text-kev-accent" strokeWidth={2} /> AI Debrief
                </h2>
                {!campaign.intelligenceReport && (
                  <button onClick={handleGenerateReport} disabled={generatingReport} className="text-[11px] font-bold px-4 py-2 rounded-lg bg-white/[0.03] border border-kev-border text-kev-text-secondary hover:text-kev-text hover:bg-white/[0.05] transition-all uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
                    {generatingReport ? <><Loader2 className="animate-spin" size={14} /> Analyzing</> : 'Generate Report'}
                  </button>
                )}
              </div>
              
              <div className="relative z-10">
                {campaign.intelligenceReport ? (
                  <div className="prose prose-invert prose-p:font-sans prose-headings:font-heading prose-h2:text-kev-primary prose-h3:text-kev-text-secondary prose-a:text-kev-accent text-[14px] max-w-none text-kev-text leading-relaxed" dangerouslySetInnerHTML={{ __html: campaign.intelligenceReport.replace(/\n/g, '<br />') }} />
                ) : (
                  <div className="py-12 text-center text-kev-muted text-[14px]">No debrief generated yet. Click generate to analyze performance.</div>
                )}
              </div>
            </div>
          )}

          {/* ── Message Log ── */}
          <div className="card p-8 lg:p-10">
            <h2 className="text-xl font-heading font-bold mb-6 pb-5 border-b border-kev-border text-kev-text">Message Log</h2>
            {communications.length > 0 ? (
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar" data-lenis-prevent>
                {communications.map(comm => (
                  <div key={comm._id} className="pb-5 border-b border-kev-border/50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading font-bold text-base text-kev-text">{typeof comm.customerId === 'object' ? (comm.customerId as any).name : comm.customerId}</span>
                          <span className={`status-badge ${getStatusClass(comm.status)} ml-2`}>
                            {comm.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-kev-muted uppercase tracking-wider font-bold">
                          via {comm.channel}
                          {comm.channelReason && (
                            <span className="text-[11px] text-kev-accent/90 italic font-medium ml-2 font-sans normal-case">
                              — {comm.channelReason}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-[14px] leading-relaxed text-kev-text-secondary bg-kev-surface-solid p-4 rounded-xl border border-kev-border whitespace-pre-wrap">
                      {comm.personalizedMessage}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-kev-muted text-[14px]">No communications sent.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
