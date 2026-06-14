import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, Rocket, ArrowRight, Sparkles, BarChart3, Loader2 } from 'lucide-react';
import { api } from '../api';
import type { CustomerStats, SegmentSuggestion, Campaign } from '../types';
import { useNavigate } from 'react-router-dom';

const statConfig = [
  { label: 'Total Customers', key: 'customers', icon: Users, color: 'from-blue-500 to-cyan-400', glow: 'rgba(59, 130, 246, 0.15)' },
  { label: 'Total Revenue', key: 'revenue', icon: DollarSign, color: 'from-emerald-500 to-teal-400', glow: 'rgba(16, 185, 129, 0.15)' },
  { label: 'Avg Order Value', key: 'avg', icon: TrendingUp, color: 'from-kev-accent to-amber-400', glow: 'rgba(240, 168, 72, 0.15)' },
  { label: 'Active Campaigns', key: 'campaigns', icon: Rocket, color: 'from-kev-primary to-purple-400', glow: 'rgba(124, 92, 252, 0.15)' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [suggestions, setSuggestions] = useState<SegmentSuggestion[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingSegmentName, setGeneratingSegmentName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, campaignsData, suggestData] = await Promise.all([
          api.customers.getStats(),
          api.campaigns.getAll(),
          api.segments.suggest()
        ]);
        setStats(statsData);
        setRecentCampaigns(campaignsData.slice(0, 5));
        setSuggestions(suggestData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSegment = async (suggestion: SegmentSuggestion) => {
    setGeneratingSegmentName(suggestion.name);
    try {
      await api.segments.create({ naturalLanguageQuery: suggestion.naturalLanguageQuery });
      navigate('/segments');
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSegmentName(null);
    }
  };

  const formatCurrency = (val: number) => `₹${(val / 1000).toFixed(1)}k`;

  const getStatValue = (key: string): string => {
    if (!stats) return '...';
    switch (key) {
      case 'customers': return stats.totalCustomers.toLocaleString();
      case 'revenue': return formatCurrency(stats.totalRevenue);
      case 'avg': return `₹${stats.avgSpend.toFixed(0)}`;
      case 'campaigns': return recentCampaigns.length.toString();
      default: return '...';
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

  return (
    <div className="space-y-10 animate-fade-in-up pb-12">
      {/* ── Header ── */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight">Overview</h1>
          <p className="text-kev-muted mt-1.5 text-sm font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => navigate('/campaigns')} className="glow-button px-5 py-2.5 flex items-center gap-2 text-sm" id="new-campaign-btn">
          <Rocket size={16} strokeWidth={2} />
          New Campaign
        </button>
      </header>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {statConfig.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col justify-between h-[150px] animate-fade-in-up opacity-0">
            <div className="flex justify-between items-start">
              <p className="text-xs text-kev-muted font-medium tracking-wide uppercase">{stat.label}</p>
              <div 
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                style={{ boxShadow: `0 4px 14px ${stat.glow}` }}
              >
                <stat.icon size={16} strokeWidth={2} className="text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold font-heading text-kev-text">
              {loading ? <div className="h-9 w-24 rounded-lg animate-shimmer" /> : getStatValue(stat.key)}
            </h3>
          </div>
        ))}
      </div>

      {/* ── AI Suggestions + Audience ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Suggestions */}
        <section className="lg:col-span-2 space-y-5">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2.5">
            <Sparkles size={18} className="text-kev-accent" />
            Smart Segments
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="glass-card h-52 animate-shimmer opacity-0 animate-fade-in-up" />
              ))
            ) : suggestions.length > 0 ? (
              suggestions.map((sugg, i) => (
                <div key={i} className="glass-card p-6 flex flex-col h-full hover:-translate-y-1 group opacity-0 animate-fade-in-up">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <h3 className="text-base font-heading font-bold leading-snug max-w-[75%] text-kev-text">{sugg.name}</h3>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-kev-primary-soft text-kev-primary border border-kev-primary/15 shrink-0">
                      ~{sugg.estimatedCount || 0}
                    </span>
                  </div>
                  <p className="text-[13px] text-kev-muted mb-6 leading-relaxed flex-1 line-clamp-3">{sugg.reasoning}</p>
                  
                  <button 
                    onClick={() => handleCreateSegment(sugg)}
                    disabled={generatingSegmentName === sugg.name}
                    className="group/btn w-full py-2.5 rounded-xl bg-white/[0.03] border border-kev-border hover:border-kev-primary/30 hover:bg-kev-primary-soft/30 transition-all flex items-center justify-center gap-2 text-[13px] font-semibold text-kev-text-secondary hover:text-kev-text mt-auto disabled:opacity-50"
                  >
                    {generatingSegmentName === sugg.name ? (
                      <><Loader2 size={16} className="animate-spin text-kev-primary" /> Generating...</>
                    ) : (
                      <>Generate Segment <ArrowRight size={14} className="text-kev-primary group-hover/btn:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 glass-card p-10 text-center text-kev-muted text-sm">
                No suggestions available.
              </div>
            )}
          </div>
        </section>

        {/* Audience Makeup */}
        <div className="space-y-5">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2.5">
            <BarChart3 size={18} className="text-kev-primary" />
            Audience Makeup
          </h2>
          <div className="glass-card p-6 h-[calc(100%-3rem)]">
            <div className="space-y-5">
              {stats && (stats as any).tagBreakdown?.length > 0 ? (
                (stats as any).tagBreakdown
                  .filter((tagObj: any) => tagObj.tag)
                  .map((tagObj: any) => {
                  const tag = tagObj.tag;
                  const count = tagObj.count;
                  const pct = stats.totalCustomers > 0 ? (count / stats.totalCustomers) * 100 : 0;

                  const tagLabels: Record<string, string> = {
                    'loyalist': 'Loyalist',
                    'at-risk': 'At Risk',
                    'churned': 'Churned',
                    'new': 'New',
                    'mango-lover': 'Mango Lover',
                    'lapsed': 'Lapsed',
                  };

                  const tagColors: Record<string, string> = {
                    'loyalist': 'from-emerald-500 to-teal-400',
                    'at-risk': 'from-amber-500 to-yellow-400',
                    'churned': 'from-red-500 to-orange-400',
                    'new': 'from-blue-500 to-cyan-400',
                    'mango-lover': 'from-orange-500 to-amber-400',
                    'lapsed': 'from-rose-500 to-pink-400',
                  };

                  return (
                    <div key={tag}>
                      <div className="flex justify-between text-[13px] mb-2 font-medium">
                        <span className="text-kev-text-secondary">{tagLabels[tag] || tag}</span>
                        <span className="text-kev-muted">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-kev-bg-alt rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${tagColors[tag] || 'from-kev-primary to-purple-400'} animate-bar-fill`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                loading ? <div className="h-full w-full animate-shimmer rounded-xl" /> : <p className="text-kev-muted text-center py-8 text-sm">No data.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="space-y-5 pt-2">
        <h2 className="text-xl font-heading font-bold">Recent Activity</h2>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse" id="recent-campaigns-table">
            <thead>
              <tr className="border-b border-kev-border text-[11px] text-kev-muted font-semibold uppercase tracking-wider bg-white/[0.01]">
                <th className="py-4 px-6 font-semibold">Campaign Name</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Channel</th>
                <th className="py-4 px-6 font-semibold text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kev-border/50">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-sm text-kev-muted">Loading...</td></tr>
              ) : recentCampaigns.length > 0 ? (
                recentCampaigns.map((camp) => (
                  <tr 
                    key={camp._id} 
                    className="hover:bg-white/[0.015] transition-colors cursor-pointer group" 
                    onClick={() => navigate(`/campaigns/${camp._id}`)}
                  >
                    <td className="py-4 px-6 text-sm font-semibold text-kev-text group-hover:text-kev-primary transition-colors">{camp.name}</td>
                    <td className="py-4 px-6">
                      <span className={`status-badge ${getStatusClass(camp.status)}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm capitalize text-kev-muted">{camp.channel}</td>
                    <td className="py-4 px-6 text-right text-sm font-semibold text-kev-text">
                      {camp.stats.total > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-kev-success inline-block" />
                          {Math.round((camp.stats.opened / camp.stats.total) * 100)}% opened
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-12 text-center text-sm text-kev-muted">No campaigns yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
