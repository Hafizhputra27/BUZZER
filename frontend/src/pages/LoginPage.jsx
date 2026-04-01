import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.registered) {
      toast.success('Registrasi berhasil! Silakan login.');
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email.trim() || !password.trim()) {
      toast.error('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (
          signInError.message.toLowerCase().includes('invalid login credentials') ||
          signInError.message.toLowerCase().includes('invalid credentials') ||
          signInError.message.toLowerCase().includes('email not confirmed')
        ) {
          toast.error('Email atau password salah. Silakan periksa kembali.');
        } else {
          toast.error(signInError.message);
        }
        return;
      }

      const user = data?.user;
      const session = data?.session;

      if (!user) {
        toast.error('Login gagal. Silakan coba lagi.');
        return;
      }

      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (roleError || !userData) {
        toast.error('Gagal mengambil data pengguna. Silakan coba lagi.');
        return;
      }

      const { role } = userData;
      setUser(user, role, session);

      toast.success('Login berhasil!');

      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/buzzer');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex items-center justify-center" style={styles.page}>
      <div className="glass-card animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Selamat Datang</h2>
          <p style={styles.subtitle}>Login ke Buzzer Basketball Platform</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p style={styles.registerLink}>
          Belum punya akun?{' '}
          <Link to="/register" style={styles.link}>
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
  },
  header: {
    marginBottom: '28px',
    textAlign: 'center',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'var(--transition)',
    fontFamily: "'Inter', sans-serif",
  },
  submitBtn: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    fontSize: '1rem',
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  link: {
    color: 'var(--primary-color)',
    fontWeight: 500,
  },
};

export default LoginPage;
