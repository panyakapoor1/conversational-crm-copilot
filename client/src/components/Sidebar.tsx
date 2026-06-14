import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Megaphone } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/segments', icon: Target, label: 'Segments' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-[calc(100vh-1.5rem)] fixed left-3 top-3 flex flex-col z-20 glass-card overflow-hidden">
      {/* ── Brand ── */}
      <div className="p-7 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kev-primary to-purple-400 flex items-center justify-center shadow-lg shadow-kev-primary-glow">
            <span className="font-heading font-extrabold text-white text-sm">K</span>
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg text-kev-text tracking-tight">Keventers</span>
            <span className="block text-[10px] font-semibold text-kev-muted uppercase tracking-[0.15em] -mt-0.5">CRM Suite</span>
          </div>
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-kev-border to-transparent my-3" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 mt-2 space-y-1 font-sans font-medium text-[14px]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                ? 'bg-kev-primary-soft text-kev-text font-semibold'
                : 'text-kev-muted hover:text-kev-text-secondary hover:bg-white/[0.02]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-kev-primary to-purple-400 shadow-[0_0_8px_rgba(124,92,252,0.5)]" />
                )}
                <item.icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  className={`transition-colors ${isActive ? 'text-kev-primary' : 'group-hover:text-kev-text-secondary'}`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Card ── */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-kev-bg-alt/60 border border-kev-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-kev-primary/30 to-purple-400/20 border border-kev-border flex items-center justify-center">
            <span className="text-kev-primary font-bold text-xs">MK</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[13px] text-kev-text truncate">Marketer</p>
            <p className="text-[11px] text-kev-muted">Admin</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-kev-success shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        </div>
      </div>
    </aside>
  );
}
