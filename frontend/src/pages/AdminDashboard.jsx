import { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import CampaignList from '../components/CampaignList';
import CampaignForm from '../components/CampaignForm';
import { supabase } from '../services/supabase';
import './Dashboard.css';

export default function AdminDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleFormClose() {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  }

  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard-submissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        () => setRefreshKey((prev) => prev + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        className="dashboard-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <h1
            className="page-title"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Kelola campaign dan pantau performa buzzer.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{
            background: 'var(--primary-color)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + Buat Campaign
        </button>
      </div>

      {/* Stats */}
      <section style={{ marginBottom: '32px' }}>
        <StatsCards />
      </section>

      {/* Campaign List */}
      <section>
        <div
          className="section-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h2
            className="section-title"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: 'var(--text-main)',
            }}
          >
            Daftar Campaign
          </h2>
        </div>
        <CampaignList key={refreshKey} />
      </section>

      {/* Campaign Form Modal */}
      {showForm && <CampaignForm onClose={handleFormClose} />}
    </div>
  );
}
