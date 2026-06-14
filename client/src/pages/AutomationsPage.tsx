import { useState, useEffect } from 'react';
import { Zap, Gift, RefreshCw, ShoppingCart, Activity, CheckCircle2, MessageCircle, PartyPopper, Sparkles, Loader2 } from 'lucide-react';

const NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Riya', 'Arjun', 'Sai', 'Kriti', 'Krishna', 'Ishan', 'Sneha', 'Ananya', 'Diya'];
const SURNAMES = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Joshi', 'Mehta'];
const PRODUCTS = ['Classic Shake', 'Brownie Shake', 'Cold Coffee', 'Vanilla Shake', 'Strawberry Shake', 'Chocolate Hazelnut'];
const STATUSES = [
  { status: 'AT RISK', color: 'bg-[#FFE4E6] text-rose-600' },
  { status: 'NUDGED', color: 'bg-kev-info-soft text-kev-info' },
  { status: 'RECOVERED', color: 'bg-emerald-100 text-emerald-700' }
];

const Var = ({ children }: { children: React.ReactNode }) => (
  <span className="text-kev-primary bg-kev-primary-soft px-1 rounded font-bold">{children}</span>
);

const BDAY_MESSAGES = [
  (name: string) => <>Happy birthday, <Var>{name}</Var>! 🎂 Enjoy 25% off your favourite Keventers milkshake today — our little gift to you 🥤</>,
  (name: string) => <>Make a wish, <Var>{name}</Var>! 🌟 Your birthday gift is waiting: 25% off any milkshake in-store today! 🎉</>,
  (name: string) => <>Cheers to another year, <Var>{name}</Var>! 🥳 Celebrate with a Keventers shake and take 25% off your order today only!</>
];

const ANNIV_MESSAGES = [
  (name: string) => <>"We're 15! 🎉 To celebrate a decade and a half of iconic milkshakes, here's a limited edition golden ticket for <Var>{name}</Var>. Claim it at any store this week! 🏆"</>,
  (name: string) => <>"15 years of Keventers, and we couldn't have done it without you, <Var>{name}</Var>! 💛 Show this message for a special anniversary surprise on us. 🎁"</>,
  (name: string) => <>"It's our 15th Birthday! 🎈 <Var>{name}</Var>, you're invited to the celebration. Use your exclusive anniversary pass for a free upgrade this week! ✨"</>
];

const LAPSED_MESSAGES = [
  (name: string, product: string) => <>"Hi <Var>{name}</Var>, we miss you! 🥺 Your favourite <Var>{product}</Var> is waiting for you. Grab 15% off your next order!"</>,
  (name: string, product: string) => <>"Hey <Var>{name}</Var>, it's been a while! 🥤 Treat yourself to a <Var>{product}</Var> today and get 15% off on us!"</>,
  (name: string, product: string) => <>"<Var>{name}</Var>, your <Var>{product}</Var> cravings are calling... 📞 Answer them with a special 15% discount just for you!"</>
];

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  const [birthdayLive, setBirthdayLive] = useState(true);
  const [lapsedLive, setLapsedLive] = useState(true);
  const [annivLive, setAnnivLive] = useState(true);
  const [journeyLive, setJourneyLive] = useState(true);
  
  const [triggerTime, setTriggerTime] = useState('60');

  const [bdayStats, setBdayStats] = useState({
    today: 482,
    sent: 142,
    clicked: 45,
    revenue: 4500
  });

  const [annivStats, setAnnivStats] = useState({
    sent: 1450,
    clicked: 320,
    redeemed: 85,
    revenue: 21250
  });

  const [bdayName, setBdayName] = useState('Netra');
  const [bdayMsgIdx, setBdayMsgIdx] = useState(0);

  const [annivName, setAnnivName] = useState('Krish');
  const [annivMsgIdx, setAnnivMsgIdx] = useState(0);

  const [lapsedData, setLapsedData] = useState({ name: 'Anirudh', product: 'Cold Coffee' });
  const [lapsedMsgIdx, setLapsedMsgIdx] = useState(0);

  const [journeyStats, setJourneyStats] = useState({
    emailSent: 14200,
    unopened: 8400,
    smsSent: 8400,
    recovered: 1250,
  });

  const [stats, setStats] = useState({
    atRisk: 142,
    selfCheckout: 68,
    recovered: 18,
    revenue: 12450
  });

  const [liveActivity, setLiveActivity] = useState([
    { id: 1, initials: 'NB', name: 'Netra Bahl', desc: 'Classic Shake', status: 'AT RISK', price: '₹220', color: 'bg-[#FFE4E6] text-rose-600' },
    { id: 2, initials: 'KT', name: 'Krish Thaman', desc: 'Brownie Shake', status: 'AT RISK', price: '₹250', color: 'bg-[#FFE4E6] text-rose-600' },
    { id: 3, initials: 'AV', name: 'Anirudh Varty', desc: 'Cold Coffee', status: 'NUDGED', price: '₹190', color: 'bg-kev-info-soft text-kev-info' },
    { id: 4, initials: 'ER', name: 'Ethan Raju', desc: 'Vanilla Shake', status: 'NUDGED', price: '₹180', color: 'bg-kev-info-soft text-kev-info' }
  ]);

  useEffect(() => {
      const interval = setInterval(() => {
      // Autonomous Journey Animation
      if (journeyLive) {
        setJourneyStats(prev => {
          const newEmail = prev.emailSent + Math.floor(Math.random() * 5);
          const newUnopened = prev.unopened + Math.floor(Math.random() * 3);
          const newSms = prev.smsSent + Math.floor(Math.random() * 3);
          const newRecov = prev.recovered + (Math.random() > 0.6 ? 1 : 0);
          return { emailSent: newEmail, unopened: newUnopened, smsSent: newSms, recovered: newRecov };
        });
      }

      // Birthday animation
      if (birthdayLive) {
        setBdayStats(prev => {
          const newToday = prev.today + (Math.random() > 0.7 ? 1 : 0);
          const newSent = prev.sent + Math.floor(Math.random() * 3);
          const newClicked = prev.clicked + Math.floor(Math.random() * 2);
          const newRevenue = prev.revenue + (Math.random() > 0.6 ? 250 : 0);
          return { today: newToday, sent: newSent, clicked: newClicked, revenue: newRevenue };
        });
        if (Math.random() > 0.5) {
          setBdayName(NAMES[Math.floor(Math.random() * NAMES.length)]);
          setBdayMsgIdx(Math.floor(Math.random() * BDAY_MESSAGES.length));
        }
      }

      // Anniversary animation
      if (annivLive) {
        setAnnivStats(prev => {
          const newSent = prev.sent < 2000 ? prev.sent + Math.floor(Math.random() * 4) : prev.sent;
          const newClicked = prev.clicked + Math.floor(Math.random() * 2);
          const newRedeemed = prev.redeemed + (Math.random() > 0.6 ? 1 : 0);
          const newRevenue = prev.revenue + (Math.random() > 0.6 ? 300 : 0);
          return { sent: newSent, clicked: newClicked, redeemed: newRedeemed, revenue: newRevenue };
        });
        if (Math.random() > 0.5) {
          setAnnivName(NAMES[Math.floor(Math.random() * NAMES.length)]);
          setAnnivMsgIdx(Math.floor(Math.random() * ANNIV_MESSAGES.length));
        }
      }

      // Lapsed Rescue animation
      if (lapsedLive) {
        setStats(prev => ({
          atRisk: prev.atRisk + Math.floor(Math.random() * 2),
          selfCheckout: prev.selfCheckout + Math.floor(Math.random() * 2),
          recovered: prev.recovered + (Math.random() > 0.7 ? 1 : 0),
          revenue: prev.revenue + (Math.random() > 0.7 ? 250 : 0)
        }));

        if (Math.random() > 0.2) {
          const first = NAMES[Math.floor(Math.random() * NAMES.length)];
          const last = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
          const prod = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
          const st = STATUSES[Math.floor(Math.random() * STATUSES.length)];
          const price = 150 + Math.floor(Math.random() * 200);
          
          setLapsedData({ name: first, product: prod });
          setLapsedMsgIdx(Math.floor(Math.random() * LAPSED_MESSAGES.length));
          
          setLiveActivity(prev => {
            const next = [{
              id: Date.now(),
              initials: first[0] + last[0],
              name: `${first} ${last}`,
              desc: prod,
              status: st.status,
              price: `₹${price}`,
              color: st.color
            }, ...prev];
            if (next.length > 4) next.pop();
            return next;
          });
        }
      }
    }, 2500);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthdayLive, annivLive, lapsedLive]);

  return (
    <div className="space-y-10 animate-fade-in-up pb-12">
      {/* ── Header ── */}
      <header>
        <h1 className="text-3xl font-heading font-extrabold tracking-tight flex items-center gap-3">
          <Zap className="text-kev-primary fill-kev-primary/20" size={32} />
          Automations
        </h1>
        <p className="text-kev-muted mt-1.5 text-sm font-medium">Always-on, event-triggered flows that run on live customer activity — no manual send.</p>
      </header>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-kev-border pb-px">
        {['All Automations', 'Live', 'Drafts'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab.toLowerCase() || (activeTab === 'all' && tab === 'All Automations')
                ? 'border-kev-primary text-kev-primary'
                : 'border-transparent text-kev-muted hover:text-kev-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Autonomous Agent Journey Card ── */}
      {(activeTab === 'all' || (activeTab === 'live' && journeyLive) || (activeTab === 'drafts' && !journeyLive)) && (
        <div className="card p-6 overflow-hidden relative border-kev-primary/30 shadow-[0_0_40px_-10px_rgba(var(--color-kev-primary),0.15)]">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-kev-primary/5 blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-kev-primary-soft border border-kev-primary/20 flex items-center justify-center">
                <Sparkles className="text-kev-primary" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-heading font-bold text-kev-text">Mango Season Reactivation</h2>
                  {journeyLive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Agent
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-kev-border text-kev-muted border border-kev-border/50">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-sm text-kev-muted font-medium mt-0.5 flex items-center gap-1.5">
                  Goal: Win back Summer Mango Buyers <span className="text-kev-border/60 mx-1">•</span> Multi-Step Journey
                </p>
              </div>
            </div>
            
            <div onClick={() => setJourneyLive(!journeyLive)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${journeyLive ? 'bg-emerald-500' : 'bg-kev-border/80'}`}>
              <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${journeyLive ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="bg-kev-surface-solid rounded-xl border border-kev-border/50 p-8 relative z-10 mb-2">
            <h3 className="text-[11px] text-kev-muted font-bold uppercase tracking-wider mb-8 flex items-center gap-2">
              <Activity size={14} /> Live Journey Funnel
            </h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between relative px-4 gap-8 md:gap-0">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[18px] left-10 right-10 h-[2px] bg-kev-border/60 z-0" />
              <div className="md:hidden absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-[2px] bg-kev-border/60 z-0" />
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-4 bg-kev-surface-solid px-2 py-2 md:py-0">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-kev-primary/40 flex items-center justify-center text-kev-primary font-bold text-sm">1</div>
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-kev-muted mb-1">Email Pitch</p>
                  <p className="text-2xl font-heading font-black text-kev-text">{journeyStats.emailSent.toLocaleString()}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-4 bg-kev-surface-solid px-2 py-2 md:py-0">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-kev-border flex items-center justify-center text-kev-muted font-bold text-sm"><Loader2 size={14} className="animate-spin" /></div>
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-kev-muted mb-1">Wait 48 Hrs</p>
                  <p className="text-2xl font-heading font-black text-kev-muted opacity-80">{journeyStats.unopened.toLocaleString()} <span className="text-[10px] block mt-0.5">Unopened</span></p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-4 bg-kev-surface-solid px-2 py-2 md:py-0">
                <div className="w-9 h-9 rounded-full bg-kev-primary border border-kev-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-kev-primary/20">3</div>
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-kev-primary mb-1">SMS Follow-up</p>
                  <p className="text-2xl font-heading font-black text-kev-primary">{journeyStats.smsSent.toLocaleString()}</p>
                </div>
              </div>

              {/* Goal Reached */}
              <div className="relative z-10 flex flex-col items-center gap-4 bg-kev-surface-solid px-2 py-2 md:py-0">
                <div className="w-9 h-9 rounded-full bg-emerald-500 border border-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20"><CheckCircle2 size={16} /></div>
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Recovered</p>
                  <p className="text-2xl font-heading font-black text-emerald-600">{journeyStats.recovered.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 15-Year Anniversary Card ── */}
      {(activeTab === 'all' || (activeTab === 'live' && annivLive) || (activeTab === 'drafts' && !annivLive)) && (
        <div className="card p-6 overflow-hidden relative">
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                <PartyPopper className="text-yellow-600" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-heading font-bold text-kev-text">Keventers 15-Year Anniversary</h2>
                  {annivLive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Event
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-kev-border text-kev-muted border border-kev-border/50">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-sm text-kev-muted font-medium mt-0.5 flex items-center gap-1.5">
                  Target: 2,000 global shoppers <span className="text-kev-border/60 mx-1">•</span> SMS & Email
                </p>
              </div>
            </div>
            
            <div onClick={() => setAnnivLive(!annivLive)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${annivLive ? 'bg-emerald-500' : 'bg-kev-border/80'}`}>
              <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${annivLive ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
            {[
              { label: 'Invites Sent', value: annivStats.sent.toLocaleString() + ' / 2,000' },
              { label: 'Clicked Link', value: annivStats.clicked.toLocaleString() },
              { label: 'Redeemed', value: annivStats.redeemed.toLocaleString(), color: 'text-kev-info' },
              { label: 'Event Revenue', value: '₹' + annivStats.revenue.toLocaleString(), color: 'text-emerald-600' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50">
                <p className="text-[11px] text-kev-muted font-bold uppercase tracking-wider mb-1.5">{stat.label}</p>
                <p className={`font-heading font-bold text-2xl ${stat.color || 'text-kev-text'}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50 max-w-lg relative z-10">
            <p className="text-[13px] text-kev-text-secondary leading-relaxed font-medium">
              {ANNIV_MESSAGES[annivMsgIdx](annivName)}
            </p>
          </div>
        </div>
      )}

      {/* ── Birthday Offer Card ── */}
      {(activeTab === 'all' || (activeTab === 'live' && birthdayLive) || (activeTab === 'drafts' && !birthdayLive)) && (
        <div className="card p-6 overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
        
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF5EC] border border-[#FFE4CC] flex items-center justify-center">
                <Gift className="text-orange-500" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-heading font-bold text-kev-text">Birthday Treat</h2>
                  {birthdayLive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-kev-border text-kev-muted border border-kev-border/50">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-sm text-kev-muted font-medium mt-0.5 flex items-center gap-1.5">
                  Trigger: shopper's birthday <span className="text-kev-border/60 mx-1">•</span> whatsapp
                </p>
              </div>
            </div>
            
            <div onClick={() => setBirthdayLive(!birthdayLive)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${birthdayLive ? 'bg-emerald-500' : 'bg-kev-border/80'}`}>
              <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${birthdayLive ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
            {[
              { label: 'Birthdays today', value: bdayStats.today.toString() },
              { label: 'Offers sent', value: bdayStats.sent.toString() },
              { label: 'Clicked', value: bdayStats.clicked.toString(), color: 'text-kev-info' },
              { label: 'Revenue', value: '₹' + bdayStats.revenue.toLocaleString(), color: 'text-emerald-600' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50">
                <p className="text-[11px] text-kev-muted font-bold uppercase tracking-wider mb-1.5">{stat.label}</p>
                <p className={`font-heading font-bold text-2xl ${stat.color || 'text-kev-text'}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50 max-w-lg relative z-10">
            <p className="text-[13px] text-kev-text-secondary leading-relaxed font-medium">
              {BDAY_MESSAGES[bdayMsgIdx](bdayName)}
            </p>
          </div>
        </div>
      )}

      {/* ── Lapsed Customer Recovery Card ── */}
      {(activeTab === 'all' || (activeTab === 'live' && lapsedLive) || (activeTab === 'drafts' && !lapsedLive)) && (
        <div className="card p-6 overflow-hidden relative">
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-kev-primary/5 blur-3xl pointer-events-none" />
          
          <div className="flex gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-kev-info-soft border border-kev-info/20 flex items-center justify-center">
                    <ShoppingCart className="text-kev-info" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-heading font-bold text-kev-text">Lapsed Customer Rescue</h2>
                    </div>
                    {lapsedLive ? (
                      <p className="text-sm text-kev-info font-bold mt-0.5 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-kev-info animate-pulse" /> LIVE STATUS
                      </p>
                    ) : (
                      <p className="text-sm text-kev-muted font-bold mt-0.5 uppercase tracking-widest flex items-center gap-1.5">
                        PAUSED
                      </p>
                    )}
                  </div>
                </div>
                
                <div onClick={() => setLapsedLive(!lapsedLive)} className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${lapsedLive ? 'bg-kev-info' : 'bg-kev-border/80'}`}>
                  <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${lapsedLive ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50">
                  <p className="text-[10px] text-kev-muted font-bold uppercase tracking-wider mb-1.5">TRIGGER</p>
                  <div className="flex items-center gap-2 font-medium text-[14px]">
                    <RefreshCw size={14} className="text-kev-muted" /> 
                    <select 
                      value={triggerTime} 
                      onChange={e => setTriggerTime(e.target.value)}
                      className="bg-transparent font-medium border-none outline-none cursor-pointer"
                    >
                      <option value="30">Idle 30+ days</option>
                      <option value="60">Idle 60+ days</option>
                      <option value="90">Idle 90+ days</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50">
                  <p className="text-[10px] text-kev-muted font-bold uppercase tracking-wider mb-1.5">CHANNEL</p>
                  <div className="flex items-center gap-2 font-medium text-[14px]">
                    <MessageCircle size={14} className="text-[#25D366]" /> Whatsapp
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-kev-surface-solid border border-kev-border/50">
                <p className="text-[10px] text-kev-muted font-bold uppercase tracking-wider mb-2">MESSAGE PREVIEW</p>
                <p className="text-[13px] text-kev-text-secondary leading-relaxed font-medium mb-3 italic">
                  {LAPSED_MESSAGES[lapsedMsgIdx](lapsedData.name, lapsedData.product)}
                </p>
                <p className="text-[11px] text-kev-muted flex justify-between items-center font-medium">
                  14:32 <CheckCircle2 size={12} className="text-kev-info" />
                </p>
              </div>
            </div>
          </div>

          {/* Extended Stats Area */}
          <div className="mt-6 pt-6 border-t border-kev-border grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div>
              <p className="text-sm text-kev-text font-medium mb-1">At risk (live)</p>
              <p className="font-heading font-bold text-3xl mb-2">{stats.atRisk.toLocaleString()} <span className="text-sm font-normal text-kev-muted ml-1">active</span></p>
              <p className="text-xs font-bold text-kev-info uppercase tracking-wider flex items-center gap-1.5"><Activity size={12}/> Watching now</p>
            </div>
            <div>
              <p className="text-sm text-kev-text font-medium mb-1">Self-checkout</p>
              <p className="font-heading font-bold text-3xl mb-2">{stats.selfCheckout.toLocaleString()} <span className="text-sm font-normal text-kev-muted ml-1">shoppers</span></p>
              <p className="text-xs font-medium text-kev-muted flex items-center gap-1.5"><ShoppingCart size={12}/> Bought on their own</p>
            </div>
            <div>
              <p className="text-sm text-kev-text font-medium mb-1">Customers recovered</p>
              <p className="font-heading font-bold text-3xl mb-2">{stats.recovered.toLocaleString()} <span className="text-sm font-normal text-kev-muted ml-1">total</span></p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 size={12}/> 12.6% of nudged</p>
            </div>
            <div>
              <p className="text-sm text-kev-text font-medium mb-1">Recovery revenue</p>
              <p className="font-heading font-bold text-3xl mb-2 text-emerald-600">₹{stats.revenue.toLocaleString()}</p>
              <p className="text-xs font-bold text-kev-primary flex items-center gap-1.5"><Zap size={12}/> Attributed to nudges</p>
            </div>
          </div>

          {/* Funnel & Live Activity */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            <div className="md:col-span-3 card bg-kev-surface-solid border-none p-6 shadow-inner shadow-kev-border/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-lg">Recovery funnel</h3>
                <button className="text-kev-muted hover:text-kev-text">•••</button>
              </div>
              
              <div className="space-y-5">
                {[
                  { label: 'At Risk', value: stats.atRisk, max: Math.max(142, stats.atRisk), color: 'bg-kev-info' },
                  { label: 'Nudge sent', value: 89 + (stats.atRisk - 142), max: Math.max(142, stats.atRisk), color: 'bg-kev-info' },
                  { label: 'Opened/Read', value: 45 + Math.floor((stats.atRisk - 142)/2), max: Math.max(142, stats.atRisk), color: 'bg-kev-primary' },
                  { label: 'Clicked', value: 24 + Math.floor((stats.atRisk - 142)/4), max: Math.max(142, stats.atRisk), color: 'bg-kev-accent' },
                  { label: 'Recovered', value: stats.recovered, max: Math.max(142, stats.atRisk), color: 'bg-emerald-500' }
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between text-sm font-semibold mb-1.5">
                      <span className="text-kev-text-secondary">{step.label}</span>
                      <span className="text-kev-text">{step.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-kev-border">
                      <div className={`h-full rounded-full ${step.color}`} style={{ width: `${(step.value / step.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-heading font-bold text-lg mb-1">Live audience activity</h3>
              {lapsedLive ? (
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auto-refreshing
                </p>
              ) : (
                <p className="text-[10px] font-bold text-kev-muted uppercase tracking-wider flex items-center gap-1.5 mb-6">
                  PAUSED
                </p>
              )}
              
              <div className="space-y-4 pr-2">
                {liveActivity.map((user) => (
                  <div key={user.id} className="flex items-center justify-between pb-4 border-b border-kev-border/50 last:border-0 last:pb-0 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-kev-surface-solid border border-kev-border flex items-center justify-center text-[11px] font-bold text-kev-muted">
                        {user.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-kev-text">{user.name}</p>
                        <p className="text-xs text-kev-muted font-medium">{user.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${user.color}`}>{user.status}</span>
                      <span className="text-sm font-semibold text-kev-text-secondary w-10 text-right">{user.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
