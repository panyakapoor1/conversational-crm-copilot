import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Megaphone, Zap } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/segments', icon: Target, label: 'Cohorts' },
  { to: '/automations', icon: Zap, label: 'Automations' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
];

export default function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex w-64 h-[calc(100vh-1.5rem)] fixed left-3 top-3 flex-col z-20 bg-kev-surface-solid border border-kev-border rounded-xl overflow-hidden shadow-sm">
        {/* ── Brand ── */}
        <div className="p-7 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-kev-primary flex items-center justify-center shadow-md shadow-kev-primary-glow">
              <span className="font-heading font-extrabold text-white text-sm">K</span>
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-kev-text tracking-tight">Keventers</span>
              <span className="block text-[10px] font-semibold text-kev-muted uppercase tracking-[0.15em] -mt-0.5">CRM Suite</span>
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-kev-border my-3" />

        {/* ── Section Label ── */}
        <div className="px-6 mb-2 mt-4">
          <span className="text-[10px] font-bold text-kev-muted uppercase tracking-widest">Growth</span>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-4 mt-2 space-y-1 font-sans font-medium text-[14px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-white shadow-sm border border-kev-border text-kev-primary font-bold'
                  : 'text-kev-text-secondary hover:text-kev-text hover:bg-white/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-kev-primary shadow-[0_0_8px_var(--color-kev-primary-glow)]" />
                  )}
                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors ${isActive ? 'text-kev-primary' : 'group-hover:text-kev-text'}`}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-3 rounded-xl bg-white border border-kev-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-kev-primary-soft border border-kev-border flex items-center justify-center">
              <span className="text-kev-primary font-bold text-xs">MK</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[13px] text-kev-text truncate">Marketer</p>
              <p className="text-[11px] text-kev-muted">Admin</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-kev-success shadow-[0_0_4px_var(--color-kev-success-soft)]" />
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-kev-surface-solid/90 backdrop-blur-md border-t border-kev-border pb-safe flex justify-around p-2 shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
                isActive ? 'text-kev-primary' : 'text-kev-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
