import { useState, useEffect } from 'react';
import AssignmentCards from '../components/AssignmentCards';
import useAuthStore from '../store/authStore';
import { supabase } from '../services/supabase';
import './Dashboard.css';

export default function BuzzerDashboard() {
  const { user } = useAuthStore();
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.name) setName(data.name);
      });
  }, [user?.id]);

  const displayName = name || user?.user_metadata?.name || 'Buzzer';

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1
          className="page-title"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            color: 'var(--text-main)',
          }}
        >
          Halo, {displayName}!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Berikut daftar campaign yang ditugaskan kepadamu.
        </p>
      </div>

      {/* Assignment Cards */}
      <section>
        <h2
          className="section-title"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            color: 'var(--text-main)',
            marginBottom: '20px',
          }}
        >
          Penugasanku
        </h2>
        <AssignmentCards />
      </section>
    </div>
  );
}
