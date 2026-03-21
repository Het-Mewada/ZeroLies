import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BookOpen, Flame } from 'lucide-react';
import BottomNav from './BottomNav';
import NavBar from './NavBar';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/today', icon: ListChecks, label: 'Today' },
  { path: '/study', icon: BookOpen, label: 'Study' },
];

export default function Layout() {
  const location = useLocation();
  const isStudyPage = location.pathname === '/study';

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <NavBar />
      <Outlet />
      <BottomNav />
    </div>
  );
}
