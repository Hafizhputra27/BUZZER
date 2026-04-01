import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const BuzzerLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const displayName = user?.name || user?.email || 'Buzzer';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '64px',
          background: 'rgba(4, 13, 26, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logobuzzer.png" alt="Buzzer" style={{ height: '32px' }} />
        </div>

        {/* Right side: user name + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            👤 {displayName}
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,80,80,0.1)';
              e.currentTarget.style.color = '#ff6b6b';
              e.currentTarget.style.borderColor = 'rgba(255,80,80,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ marginTop: '64px', flex: 1, padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default BuzzerLayout;
