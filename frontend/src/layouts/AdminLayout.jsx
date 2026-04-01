import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRight: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <img src="/logobuzzer.png" alt="Buzzer" style={{ height: '36px' }} />
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/dashboard/admin" label="Dashboard" icon="📊" />
          <NavLink to="/dashboard/admin" label="Campaigns" icon="📣" />
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'var(--transition)',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,80,80,0.1)';
            e.currentTarget.style.color = '#ff6b6b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  );
};

const NavLink = ({ to, label, icon }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      fontWeight: 500,
      transition: 'var(--transition)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--surface-hover)';
      e.currentTarget.style.color = 'var(--text-main)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--text-muted)';
    }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

export default AdminLayout;
