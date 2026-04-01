import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'buzzer';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = form;

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Semua field wajib diisi.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (
          signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('already been registered') ||
          signUpError.message.toLowerCase().includes('user already exists')
        ) {
          toast.error('Email sudah digunakan. Silakan gunakan email lain.');
        } else {
          toast.error(signUpError.message);
        }
        return;
      }

      const user = data?.user;
      if (!user) {
        toast.error('Registrasi gagal. Silakan coba lagi.');
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: user.id, name, email, role });

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('Email sudah digunakan. Silakan gunakan email lain.');
        } else {
          toast.error('Gagal menyimpan data pengguna: ' + insertError.message);
        }
        return;
      }

      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page flex items-center justify-center" style={styles.page}>
      <div className="glass-card animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Buat Akun</h2>
          <p style={styles.subtitle}>Bergabung dengan Buzzer Basketball Platform</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Full Name */}
          <div style={styles.field}>
            <label style={styles.label}>Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              style={styles.input}
              required
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              style={styles.input}
              required
            />
          </div>

          {/* Role Selection */}
          <div style={styles.field}>
            <label style={styles.label}>Daftar sebagai</label>
            <div style={styles.roleGroup}>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: 'buzzer' }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === 'buzzer' ? styles.roleBtnActive : {}),
                }}
              >
                🏀 Buzzer
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: 'admin' }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === 'admin' ? styles.roleBtnActive : {}),
                }}
              >
                ⚙️ Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Sudah punya akun?{' '}
          <Link to="/login" style={styles.link}>
            Login di sini
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
  roleGroup: {
    display: 'flex',
    gap: '12px',
  },
  roleBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  roleBtnActive: {
    border: '1px solid var(--primary-color)',
    background: 'rgba(26, 115, 232, 0.15)',
    color: 'var(--text-main)',
  },
  submitBtn: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    fontSize: '1rem',
  },
  loginLink: {
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

export default RegisterPage;
