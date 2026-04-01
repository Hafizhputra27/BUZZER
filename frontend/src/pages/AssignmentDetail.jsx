import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import useAuthStore from '../store/authStore';
import SubmissionForm from '../components/SubmissionForm';
import './Dashboard.css';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    emoji: '⏳',
    bg: 'rgba(234, 179, 8, 0.12)',
    color: '#eab308',
    border: 'rgba(234, 179, 8, 0.3)',
  },
  submitted: {
    label: 'Submitted',
    emoji: '📤',
    bg: 'rgba(59, 130, 246, 0.12)',
    color: '#3b82f6',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  approved: {
    label: 'Approved',
    emoji: '✅',
    bg: 'rgba(34, 197, 94, 0.12)',
    color: '#22c55e',
    border: 'rgba(34, 197, 94, 0.3)',
  },
  rejected: {
    label: 'Rejected',
    emoji: '❌',
    bg: 'rgba(239, 68, 68, 0.12)',
    color: '#ef4444',
    border: 'rgba(239, 68, 68, 0.3)',
  },
};

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignment = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('assignments')
        .select('*, campaigns(*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setAssignment(data);
    } catch (err) {
      console.error('Error fetching assignment:', err);
      setError('Gagal memuat data assignment.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const isDisabled =
    assignment?.status === 'submitted' || assignment?.status === 'approved';

  const statusCfg = STATUS_CONFIG[assignment?.status] ?? STATUS_CONFIG.pending;

  const campaign = assignment?.campaigns;

  const formatDeadline = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          color: 'var(--text-muted)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Memuat data...
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/dashboard/buzzer')}
          className="btn"
          style={{
            background: 'rgba(255,255,255,0.07)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px',
          }}
        >
          ← Kembali
        </button>
        <div
          className="glass-card"
          style={{ color: '#ef4444', textAlign: 'center', padding: '32px' }}
        >
          {error || 'Assignment tidak ditemukan.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard/buzzer')}
        className="btn"
        style={{
          background: 'rgba(255,255,255,0.07)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
          marginBottom: '28px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.9rem',
        }}
      >
        ← Kembali ke Dashboard
      </button>

      {/* Campaign Brief Card */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        {/* Header row: title + status badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: 0,
              flex: 1,
            }}
          >
            {campaign?.title ?? 'Campaign'}
          </h1>

          {/* Status badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: statusCfg.bg,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {statusCfg.emoji} {statusCfg.label}
          </span>
        </div>

        {/* Deadline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          <span>📅</span>
          <span>
            Deadline:{' '}
            <strong style={{ color: 'var(--text-main)' }}>
              {formatDeadline(campaign?.deadline)}
            </strong>
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--border-color)',
            marginBottom: '20px',
          }}
        />

        {/* Description / Brief */}
        <div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Brief Campaign
          </h2>
          <p
            style={{
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {campaign?.description ?? '—'}
          </p>
        </div>
      </div>

      {/* Submission Form */}
      <SubmissionForm
        assignmentId={assignment.id}
        campaignId={assignment.campaign_id}
        buzzerId={user?.id}
        disabled={isDisabled}
        onSubmit={fetchAssignment}
      />
    </div>
  );
}
