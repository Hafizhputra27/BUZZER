import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import AssignBuzzerModal from '../components/AssignBuzzerModal';

const STATUS_BADGE = {
  pending: { label: 'Pending', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: 'rgba(234, 179, 8, 0.4)' },
  submitted: { label: 'Submitted', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' },
  approved: { label: 'Approved', bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.4)' },
  rejected: { label: 'Rejected', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: '6px',
        padding: '2px 10px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'capitalize',
      }}
    >
      {s.label}
    </span>
  );
}

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('assignments')
      .select('*, users(name, email)')
      .eq('campaign_id', id);
    if (err) {
      console.error('Failed to fetch assignments:', err);
    } else {
      setAssignments(data || []);
    }
  }, [id]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const { data: campaignData, error: campaignErr } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (campaignErr) throw campaignErr;
        setCampaign(campaignData);

        await fetchAssignments();
      } catch (err) {
        setError(err.message || 'Gagal memuat data campaign');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [id, fetchAssignments]);

  const alreadyAssigned = assignments.map((a) => a.buzzer_id);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)' }}>Memuat detail campaign...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button
          className="btn btn-glass"
          style={{ marginTop: '16px' }}
          onClick={() => navigate('/dashboard/admin')}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        className="btn btn-glass"
        style={{ marginBottom: '24px', fontSize: '0.875rem', padding: '8px 16px' }}
        onClick={() => navigate('/dashboard/admin')}
      >
        ← Kembali
      </button>

      {/* Campaign Info Card */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '1.75rem',
                color: 'var(--text-main)',
                marginBottom: '8px',
              }}
            >
              {campaign?.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
              {campaign?.description || '-'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Deadline:</span>
              <span
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: 'rgba(26, 115, 232, 0.12)',
                  border: '1px solid rgba(26, 115, 232, 0.3)',
                  borderRadius: '6px',
                  padding: '2px 10px',
                }}
              >
                {formatDeadline(campaign?.deadline)}
              </span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}
            onClick={() => setShowAssignModal(true)}
          >
            + Assign Buzzer
          </button>
        </div>
      </div>

      {/* Assignment List */}
      <div>
        <h2
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            color: 'var(--text-main)',
            marginBottom: '16px',
          }}
        >
          Daftar Buzzer Ditugaskan
          <span
            style={{
              marginLeft: '10px',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '2px 10px',
            }}
          >
            {assignments.length} buzzer
          </span>
        </h2>

        {assignments.length === 0 ? (
          <div
            className="glass-card"
            style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}
          >
            <p style={{ fontSize: '0.95rem' }}>Belum ada buzzer yang ditugaskan.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
              Klik tombol "Assign Buzzer" untuk menugaskan buzzer ke campaign ini.
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  {['Nama', 'Email', 'Status'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '14px 20px',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, idx) => (
                  <tr
                    key={assignment.id}
                    style={{
                      borderBottom:
                        idx < assignments.length - 1 ? '1px solid var(--border-color)' : 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '0.9rem', fontWeight: 500 }}>
                      {assignment.users?.name || '-'}
                    </td>
                    <td
                      style={{
                        padding: '14px 20px',
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {assignment.users?.email || '-'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={assignment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Buzzer Modal */}
      {showAssignModal && (
        <AssignBuzzerModal
          campaignId={id}
          alreadyAssigned={alreadyAssigned}
          onAssign={fetchAssignments}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
}
