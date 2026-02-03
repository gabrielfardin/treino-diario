import { Outlet } from 'react-router-dom';
import { Dumbbell, Utensils, Calendar, Home, Flame, Activity, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import NotificationManager from './NotificationManager';

const Layout = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path) => location.pathname === path;

  const dateString = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const timeString = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/workout', icon: Dumbbell, label: 'Treino' },
    { path: '/nutrition', icon: Utensils, label: 'Dieta' },
    { path: '/health', icon: Activity, label: 'Saúde' }, // New Tab
    { path: '/history', icon: Calendar, label: 'Histórico' },
  ];

  return (
    <div className="layout">
      <NotificationManager />
      {/* Premium Header */}
      <header className="header-clock">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--accent-soft)',
            padding: '0.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={24} color="var(--accent-color)" className="glow-accent" />
          </div>
          <div>
            <div className="clock-date">{dateString}</div>
            <div className="clock-time">{timeString}</div>
          </div>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'right',
          fontWeight: 500
        }}>
          <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>FOCO TOTAL</span>
            <Settings size={18} />
          </Link>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg-primary);
        }

        .header-clock {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 1rem 0.75rem;
          z-index: 1000;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          padding-top: 85px;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default Layout;
