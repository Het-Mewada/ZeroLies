import { Flame, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';

// Replace with your actual NAV_ITEMS and isStudyPage prop
const NAV_ITEMS = [
    { path: '/', icon: Flame, label: 'Dashboard' },
    { path: '/study', icon: Clock, label: 'Study' },
    { path: '/today', icon: Flame, label: 'Today' },
];

export default function NavBar({ isStudyPage = false }) {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .header-root {
          font-family: 'DM Sans', sans-serif;
          padding:0 20px;
        }

        .nav-link-item {
          position: relative;
          display: flex;a
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.875rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: color 0.18s ease, background 0.18s ease;
          color: rgba(240, 240, 240, 0.38);
          background: transparent;
          white-space: nowrap;
        }

        .nav-link-item:hover:not(.active) {
          color: rgba(240, 240, 240, 0.72);
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-link-item.active {
          color: #e8ff4a;
          background: rgba(232, 255, 74, 0.08);
        }

        /* Subtle bottom indicator for active link */
        .nav-link-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 1.5px;
          border-radius: 99px;
          background: #e8ff4a;
          opacity: 0.6;
        }

        .logo-mark {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 7px;
          background: rgba(232, 255, 74, 0.08);
          border: 1px solid rgba(232, 255, 74, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(232, 255, 74, 0.08);
          flex-shrink: 0;
        }

        .logo-wordmark {
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.015em;
          color: #f0f0f0;
        }

        .header-divider {
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.07);
          margin: 0 0.75rem;
          flex-shrink: 0;
        }
      `}</style>

            <header
                className="header-root hidden md:flex items-center justify-between px-7 h-[3.375rem]"
                style={{
                    background: isStudyPage
                        ? 'transparent'
                        : 'rgba(10,10,10,0.97)',
                    backdropFilter: isStudyPage ? 'none' : 'blur(12px)',
                    WebkitBackdropFilter: isStudyPage ? 'none' : 'blur(12px)',
                    borderBottom: isStudyPage
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isStudyPage
                        ? 'none'
                        : '0 1px 0 rgba(255,255,255,0.02), 0 4px 24px rgba(0,0,0,0.3)',
                    position: isStudyPage ? 'absolute' : 'sticky',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <img src="/favicon.svg" alt="Logo" className="logo-mark" />
                    <span className="logo-wordmark" style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.2rem' }}>ZeroLie</span>
                </div>

                {/* Nav */}
                <nav className="flex items-center" style={{ gap: '0.125rem' }}>
                    {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) =>
                                `nav-link-item${isActive ? ' active' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={13}
                                        strokeWidth={isActive ? 2.25 : 1.75}
                                        style={{ flexShrink: 0 }}
                                    />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </header>
        </>
    );
}