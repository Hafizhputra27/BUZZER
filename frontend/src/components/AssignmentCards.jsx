import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import useAuthStore from '../store/authStore';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  submitted: { label: 'Submitted', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}40`,
        letterSpacing: '0.03em',
        textTransform: 'capitalize',
      }}
    >
      {config.label}
    </span>
  );
}

function formatDeadline(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AssignmentCards() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchAssignments() {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select('*, campaigns(title, description, deadline)')
        .eq('buzzer_id', user.id);

      if (!error && data) {
        setAssignments(data);
      }
      setLoading(false);
    }

    fetchAssignments();
  }, [user?.id]);

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass-card"
            style={{ opacity: 0.4, minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</span>
          </div>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
        <p style={{ fontSize: '1rem', fontWeight: 500 }}>No assignments yet</p>
        <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>
          You'll see your campaign assignments here once an admin assigns you.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}
    >
      {assignments.map((assignment) => {
        const campaign = assignment.campaigns || {};
        const excerpt = campaign.description
          ? campaign.description.length > 100
            ? campaign.description.slice(0, 100) + '…'
            : campaign.description
          : '—';

        return (
          <Link
            key={assignment.id}
            to={`/dashboard/buzzer/assignments/${assignment.id}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                transition: 'var(--transition)',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.2)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    lineHeight: 1.3,
                  }}
                >
                  {campaign.title || 'Untitled Campaign'}
                </h3>
                <StatusBadge status={assignment.status} />
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                {excerpt}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px',
                  marginTop: 'auto',
                }}
              >
                <span>🗓</span>
                <span>Deadline: {formatDeadline(campaign.deadline)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
