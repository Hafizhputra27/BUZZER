import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { calculateProgress } from '../utils/validators';

export default function CampaignList({ campaigns: campaignsProp, onRefresh }) {
  const [campaigns, setCampaigns] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(!campaignsProp);

  async function fetchCampaigns() {
    setLoading(true);
    const { data, error } = await supabase.from('campaigns').select('*');
    if (!error && data) {
      setCampaigns(data);
      await fetchProgress(data);
    }
    setLoading(false);
  }

  async function fetchProgress(list) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, campaign_id, status');

    if (!assignments) return;

    const map = {};
    for (const campaign of list) {
      const total = assignments.filter((a) => a.campaign_id === campaign.id).length;
      const approved = assignments.filter(
        (a) => a.campaign_id === campaign.id && a.status === 'approved'
      ).length;
      map[campaign.id] = calculateProgress(approved, total);
    }
    setProgressMap(map);
  }

  useEffect(() => {
    if (campaignsProp) {
      setCampaigns(campaignsProp);
      fetchProgress(campaignsProp);
    } else {
      fetchCampaigns();
    }
  }, [campaignsProp]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card" style={{ opacity: 0.5, minHeight: '80px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        No campaigns found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {campaigns.map((campaign) => {
        const progress = progressMap[campaign.id] ?? 0;
        const deadline = campaign.deadline
          ? new Date(campaign.deadline).toLocaleDateString()
          : '—';

        return (
          <Link
            key={campaign.id}
            to={`/dashboard/admin/campaigns/${campaign.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-color)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                  }}
                >
                  {campaign.title}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  📅 {deadline}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--border-color)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '6px',
                      background: 'var(--primary-color)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="btn btn-glass"
          style={{ alignSelf: 'flex-end', fontSize: '0.85rem', padding: '8px 16px' }}
        >
          ↻ Refresh
        </button>
      )}
    </div>
  );
}
