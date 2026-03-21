import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/today', icon: ListChecks, label: 'Today' },
  { path: '/study', icon: BookOpen, label: 'Study' },
];

export default function BottomNav() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600&display=swap');

        .bottom-nav-root {
          font-family: 'DM Sans', sans-serif;
        }

        .bottom-nav-link {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 20px;
          min-width: 80px;
          border-radius: 10px;
          text-decoration: none;
          transition: color 0.18s ease, background 0.18s ease;
          color: rgba(240, 240, 240, 0.32);
          background: transparent;
          -webkit-tap-highlight-color: transparent;
        }

        .bottom-nav-link:hover:not(.bnav-active) {
          color: rgba(240, 240, 240, 0.6);
          background: rgba(255, 255, 255, 0.04);
        }

        .bottom-nav-link.bnav-active {
          color: #e8ff4a;
          background: rgba(232, 255, 74, 0.08);
        }

        /* Top edge indicator */
        .bottom-nav-link.bnav-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 1.5px;
          border-radius: 99px;
          background: #e8ff4a;
          opacity: 0.55;
        }

        .bnav-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
        }
      `}</style>

      <nav
        className="bottom-nav-root fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'rgba(10,10,10,0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4), 0 -1px 0 rgba(255,255,255,0.02)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `bottom-nav-link${isActive ? ' bnav-active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    style={{ flexShrink: 0 }}
                  />
                  <span className="bnav-label">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}