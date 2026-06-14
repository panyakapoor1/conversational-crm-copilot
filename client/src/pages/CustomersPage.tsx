import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Customer } from '../types';
import { Search, MapPin, ShoppingBag, X, Mail, Phone, Activity, Filter } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [city, setCity] = useState('all');
  const [sort, setSort] = useState('recent');
  const [channel, setChannel] = useState('all');
  const [gender, setGender] = useState('all'); // Mock for UI parity
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [search, selectedTag, city, sort, channel]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (selectedTag !== 'all') params.tags = selectedTag;
      if (city !== 'all') params.city = city;
      if (sort !== 'recent') params.sort = sort;
      if (channel !== 'all') params.channel = channel;
      
      const data = await api.customers.getAll(params);
      setCustomers(data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tags = [
    { id: 'all', label: 'All' },
    { id: 'discount_hunter', label: 'Discount Hunter' },
    { id: 'lapsing_regular', label: 'Lapsing Regular' },
    { id: 'loyal_subscriber', label: 'Loyal Subscriber' },
    { id: 'new_promising', label: 'New Promising' },
    { id: 'one_time_tryer', label: 'One-Time Tryer' },
    { id: 'seasonal_gifter', label: 'Seasonal Gifter' },
    { id: 'loyalist', label: 'Loyalist' },
    { id: 'at-risk', label: 'At Risk' },
    { id: 'churned', label: 'Churned' },
    { id: 'new', label: 'New' },
    { id: 'mango-lover', label: 'Mango Lover' },
  ];

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-kev-success';
    if (score >= 40) return 'text-kev-warning';
    return 'text-kev-danger';
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'discount_hunter': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'lapsing_regular': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'loyal_subscriber': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'new_promising': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'one_time_tryer': return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'seasonal_gifter': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'loyalist': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'at-risk': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'churned': return 'bg-red-50 text-red-600 border-red-200';
      case 'new': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'mango-lover': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-kev-surface-solid text-kev-text-secondary border-kev-border';
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 h-full flex flex-col relative">
      {/* ── Header ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-extrabold tracking-tight">Customers</h1>
        <p className="text-kev-muted mt-1.5 text-sm font-medium">Manage and segment your audience.</p>
      </header>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 mb-8 w-full max-w-full">
        {/* Top Row: Search & Tags */}
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <div className="relative w-full md:w-1/3 min-w-[250px] shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-kev-muted" size={16} strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full py-2.5 pl-11 pr-4 text-[14px]"
              id="customer-search"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center flex-1 w-full min-w-0 pr-4">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-4 py-2 rounded-full text-[13px] font-bold tracking-wide transition-all whitespace-nowrap shrink-0 border ${
                  selectedTag === tag.id 
                    ? 'bg-kev-primary text-white border-kev-primary shadow-md shadow-kev-primary/20' 
                    : 'bg-[#F9F7F5] border-[#E8E4DF] text-kev-text-secondary hover:text-kev-text hover:bg-white'
                }`}
                id={`tag-filter-${tag.id}`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Row: Toggle & Count */}
        <div className="flex justify-between items-center bg-[#F9F7F5] rounded-xl p-2 border border-[#E8E4DF]">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-bold text-kev-text hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E8E4DF]"
          >
            <Filter size={14} className="text-kev-muted" /> 
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
          <span className="text-[13px] font-bold text-kev-text-secondary px-3">
            Showing 0-{customers.length} Customers
          </span>
        </div>

        {/* Bottom Row: Additional Filters */}
        <div className={`transition-all duration-300 overflow-hidden flex flex-wrap gap-4 items-center bg-[#F9F7F5] rounded-xl border border-[#E8E4DF] ${showFilters ? 'p-3 max-h-[500px] opacity-100' : 'p-0 max-h-0 opacity-0 border-transparent'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-kev-muted">CITY</span>
            <select 
              value={city} 
              onChange={e => setCity(e.target.value)}
              className="input py-2 pl-3 pr-8 text-[13px] font-medium appearance-none cursor-pointer bg-white border-[#E8E4DF] min-w-[130px] rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjY4NzIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_10px_center]"
            >
              <option value="all">Any city</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-kev-muted">CHANNEL</span>
            <select 
              value={channel} 
              onChange={e => setChannel(e.target.value)}
              className="input py-2 pl-3 pr-8 text-[13px] font-medium appearance-none cursor-pointer bg-white border-[#E8E4DF] min-w-[130px] rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjY4NzIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_10px_center]"
            >
              <option value="all">Any channel</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-kev-muted">GENDER</span>
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)}
              className="input py-2 pl-3 pr-8 text-[13px] font-medium appearance-none cursor-pointer bg-white border-[#E8E4DF] min-w-[130px] rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjY4NzIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_10px_center]"
            >
              <option value="all">Any gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-kev-muted">SORT</span>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)}
              className="input py-2 pl-3 pr-8 text-[13px] font-medium appearance-none cursor-pointer bg-white border-[#E8E4DF] min-w-[130px] rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjY4NzIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[position:right_10px_center]"
            >
              <option value="recent">Most Recent</option>
              <option value="spend_desc">Top spend</option>
              <option value="engagement_desc">Top engagement</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Grid of Cards ── */}
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 transition-all duration-500 ${selectedCustomer ? 'pr-[420px]' : ''}`}>
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="card h-48 animate-shimmer" />)
        ) : customers.length > 0 ? (
          customers.map(cust => (
            <div 
              key={cust._id} 
              onClick={() => setSelectedCustomer(cust)}
              className="card p-5 cursor-pointer hover:-translate-y-0.5 group flex flex-col"
            >
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-kev-primary-soft border border-kev-primary-soft flex items-center justify-center text-kev-primary font-heading font-bold text-[13px]">
                  {getInitials(cust.name)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-heading font-bold text-[15px] truncate group-hover:text-kev-primary transition-colors">{cust.name}</h3>
                  <div className="flex items-center gap-1.5 text-[12px] text-kev-muted mt-0.5">
                    <MapPin size={12} strokeWidth={1.5} /> <span className="truncate">{cust.city}</span>
                  </div>
                </div>
                <div className={`text-[12px] font-bold ${getEngagementColor(cust.engagementScore)}`}>
                  {cust.engagementScore}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-5">
                {cust.tags.slice(0, 3).map(tag => (
                  <span key={tag} className={`text-[10px] px-2.5 py-0.5 rounded-md font-semibold uppercase tracking-wider border ${getTagColor(tag)}`}>
                    {tag.replace('-', ' ')}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-kev-border/50 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-kev-muted uppercase tracking-wider font-bold mb-0.5">Total Spend</p>
                  <p className="font-heading font-bold text-lg text-kev-text">₹{cust.totalSpend.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-kev-muted uppercase tracking-wider font-bold mb-0.5">Last Order</p>
                  <p className="text-[13px] font-semibold text-kev-text-secondary">{cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-kev-muted text-sm">
            No customers found. Try adjusting your filters.
          </div>
        )}
      </div>

      {/* ── Slide-out Drawer ── */}
      <div 
        className={`fixed top-3 right-3 h-[calc(100vh-1.5rem)] w-[400px] bg-white border-l border-kev-border shadow-xl rounded-l-xl flex flex-col z-30 transition-all duration-400 ${selectedCustomer ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
      >
        {selectedCustomer && (
          <>
            <div className="p-6 border-b border-kev-border flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-kev-primary-soft border border-kev-primary-soft flex items-center justify-center text-kev-primary font-heading font-bold text-base">
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-kev-text">{selectedCustomer.name}</h2>
                  <p className="text-kev-muted font-medium flex items-center gap-1.5 mt-0.5 text-[13px]"><MapPin size={12} strokeWidth={1.5} /> {selectedCustomer.city}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-lg text-kev-muted hover:text-kev-text hover:bg-white/[0.03] transition-all"
                id="customer-drawer-close"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8" data-lenis-prevent>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Spend', value: `₹${selectedCustomer.totalSpend.toLocaleString()}` },
                  { label: 'Avg Order', value: `₹${Math.round(selectedCustomer.averageOrderValue).toLocaleString()}` },
                  { label: 'Orders', value: selectedCustomer.orderCount.toString() },
                  { label: 'Engagement', value: selectedCustomer.engagementScore.toString(), suffix: '/100' },
                ].map((metric, i) => (
                  <div key={i} className="p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50">
                    <p className="text-[10px] text-kev-muted uppercase tracking-wider font-bold mb-1.5">{metric.label}</p>
                    <p className="font-heading font-bold text-xl text-kev-text">
                      {metric.value}
                      {metric.suffix && <span className="text-xs text-kev-muted font-normal ml-0.5">{metric.suffix}</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Engagement Score Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-kev-muted uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Activity size={12} /> Engagement Score
                  </span>
                  <span className={`text-sm font-bold ${getEngagementColor(selectedCustomer.engagementScore)}`}>
                    {selectedCustomer.engagementScore}%
                  </span>
                </div>
                <div className="w-full bg-kev-surface-solid rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full animate-bar-fill ${
                      selectedCustomer.engagementScore >= 70 ? 'bg-emerald-500' :
                      selectedCustomer.engagementScore >= 40 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${selectedCustomer.engagementScore}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-kev-muted mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCustomer.tags.map(tag => (
                    <span key={tag} className={`text-[10px] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider border ${getTagColor(tag)}`}>
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-kev-muted mb-3">Preferences</h3>
                <div className="space-y-0">
                  <div className="flex justify-between items-center py-3 border-b border-kev-border/30">
                    <span className="text-[13px] font-medium text-kev-text-secondary">Favourite Product</span>
                    <span className="font-semibold text-[13px] flex items-center gap-1.5 text-kev-text">
                      <ShoppingBag size={13} strokeWidth={1.5} className="text-kev-accent" /> {selectedCustomer.favouriteProduct || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-kev-border/30">
                    <span className="text-[13px] font-medium text-kev-text-secondary">Preferred Channel</span>
                    <span className="font-semibold text-[13px] capitalize text-kev-text">{selectedCustomer.channelPreference}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-kev-muted mb-3">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="w-8 h-8 rounded-lg bg-kev-surface-solid border border-kev-border flex items-center justify-center">
                      <Mail size={13} className="text-kev-muted" />
                    </div>
                    <span className="text-kev-text-secondary">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="w-8 h-8 rounded-lg bg-kev-surface-solid border border-kev-border flex items-center justify-center">
                      <Phone size={13} className="text-kev-muted" />
                    </div>
                    <span className="text-kev-text-secondary">{selectedCustomer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden" onClick={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}
