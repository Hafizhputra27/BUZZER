import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

const STATUS_BADGE = {
  pending: { label: 'Pending', bg: 'rgba(255, 193, 7, 0.15)', color: '#ffc107', border: 'rgba(255, 193, 7, 0.3)' },
  approved: { label: 'Approved', bg: 'rgba(0, 200, 83, 0.15)', color: '#00c853', border: 'rgba(0, 200, 83, 0.3)' },
  rejected: { label: 'Rejected', bg: 'rgba(244, 67, 54, 0.15)', color: '#f44336', border: 'rgba(244, 67, 54, 0.3)' },
};

function StatusBadge({ status }) {
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: badge.bg,
        color: badge.color,
        border: `1px solid ${badge.border}`,
        textTransform: 'capitalize',
      }}
    >
      {badge.label}
    </span>
  );
}

export default function SubmissionReviewList({ campaignId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*, users(name, email)')
      .eq('campaign_id', campaignId)
      .order('submitted_at', { ascending: false });

    if (error) {
      toast.error('Gagal memuat submissions');
    } else {
      setSubmissions(data ?? []);
    }
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) fetchSubmissions();
  }, [campaignId, fetchSubmissions]);

  async function handleApprove(submission) {
    setActionLoading(submission.id);
    const { error: subErr } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', submission.id);

    if (subErr) {
      toast.error('Gagal approve submission');
      setActionLoading(null);
      return;
    }

    const { error: assignErr } = await supabase
      .from('assignments')
      .update({ status: 'approved' })
      .eq('id', submission.assignment_id);

    if (assignErr) {
      toast.error('Submission diapprove, tapi gagal update assignment');
    } else {
      toast.success('Submission disetujui');
    }

    setActionLoading(null);
    fetchSubmissions();
  }

  async function handleReject(submission) {
    setActionLoading(submission.id);
    const { error: subErr } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', submission.id);

    if (subErr) {
      toast.error('Gagal reject submission');
      setActionLoading(null);
      return;
    }

    const { error: assignErr } = await supabase
      .from('assignments')
      .update({ status: 'pending' })
      .eq('id', submission.assignment_id);

    if (assignErr) {
      toast.error('Submission ditolak, tapi gagal update assignment');
    } else {
      toast.success('Submission ditolak');
    }

    setActionLoading(null);
    fetchSubmissions();
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1, 2].map((i) => (
          <div key={i} className="glass-card" style={{ opacity: 0.5, minHeight: '72px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</span>
          </div>
        ))}
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === 'pending');
  const history = submissions.filter((s) => s.status !== 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Pending submissions */}
      <div>
        <h3
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '12px',
          }}
        >
          Menunggu Review
          {pending.length > 0 && (
            <span
              style={{
                marginLeft: '8px',
                background: 'rgba(255, 193, 7, 0.2)',
                color: '#ffc107',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '0.75rem',
              }}
            >
              {pending.length}
            </span>
          )}
        </h3>

        {pending.length === 0 ? (
          <div
            className="glass-card"
            style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}
          >
            Tidak ada submission yang menunggu review.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pending.map((sub) => (
              <SubmissionCard
                key={sub.id}
                submission={sub}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={actionLoading === sub.id}
                showActions
              />
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h3
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '12px',
          }}
        >
          Riwayat Submission
        </h3>

        {history.length === 0 ? (
          <div
            className="glass-card"
            style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}
          >
            Belum ada riwayat submission.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ submission, onApprove, onReject, isLoading, showActions }) {
  const buzzerName = submission.users?.name ?? submission.users?.email ?? 'Unknown';
  const submittedAt = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div
      className="glass-card animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            {buzzerName}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{submittedAt}</span>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {/* Post link */}
      <a
        href={submission.post_link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          color: 'var(--accent-color)',
          wordBreak: 'break-all',
          transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        🔗 {submission.post_link}
      </a>

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() => onApprove(submission)}
            disabled={isLoading}
            style={{
              padding: '7px 18px',
              borderRadius: 'var(--radius-sm)',
              background: isLoading ? 'rgba(0,200,83,0.1)' : 'rgba(0, 200, 83, 0.15)',
              color: '#00c853',
              border: '1px solid rgba(0, 200, 83, 0.3)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(0,200,83,0.25)'; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(0,200,83,0.15)'; }}
          >
            {isLoading ? '...' : '✓ Approve'}
          </button>
          <button
            onClick={() => onReject(submission)}
            disabled={isLoading}
            style={{
              padding: '7px 18px',
              borderRadius: 'var(--radius-sm)',
              background: isLoading ? 'rgba(244,67,54,0.1)' : 'rgba(244, 67, 54, 0.15)',
              color: '#f44336',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'var(--transition)',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(244,67,54,0.25)'; }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(244,67,54,0.15)'; }}
          >
            {isLoading ? '...' : '✕ Reject'}
          </button>
        </div>
      )}
    </div>
  );
}
