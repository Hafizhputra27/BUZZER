import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { computeStats } from '../utils/validators';

const CARD_CONFIG = [
  {
    key: 'activeCampaigns',
    label: 'Active Campaigns',
    icon: '🏀',
  },
  {
    key: 'totalAssignments',
    label: 'Total Assignments',
    icon: '📋',
  },
  {
    key: 'activeBuzzers',
    label: 'Active Buzzers',
    icon: '📣',
  },
  {
    key: 'approvedSubmissions',
    label: 'Approved Submissions',
    icon: '✅',
  },
];

export default function StatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, campaign_id, buzzer_id, status');

    if (!error && data) {
      setStats(computeStats(data));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('assignments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {CARD_CONFIG.map((card) => (
          <div key={card.key} className="glass-card" style={{ opacity: 0.5, minHeight: '120px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {CARD_CONFIG.map((card) => (
        <div key={card.key} className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>{card.icon}</span>
          <div>
            <div style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-main)' }}>
              {stats ? stats[card.key] : 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {card.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
