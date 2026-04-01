import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { isValidUrl } from '../utils/validators';

/**
 * SubmissionForm — lets a buzzer submit a post link for an assignment.
 *
 * Props:
 *   assignmentId  {string}    — ID of the assignment
 *   campaignId    {string}    — ID of the campaign
 *   buzzerId      {string}    — ID of the buzzer (current user)
 *   disabled      {boolean}   — true when status is 'submitted' or 'approved'
 *   onSubmit      {function}  — optional callback after successful submission
 */
export default function SubmissionForm({
  assignmentId,
  campaignId,
  buzzerId,
  disabled = false,
  onSubmit,
}) {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!url || url.trim() === '') {
      setUrlError('URL tidak boleh kosong.');
      return false;
    }
    if (!isValidUrl(url.trim())) {
      setUrlError('URL tidak valid. Gunakan format http:// atau https://');
      return false;
    }
    setUrlError('');
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Insert submission record
      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          campaign_id: campaignId,
          buzzer_id: buzzerId,
          assignment_id: assignmentId,
          post_link: url.trim(),
          status: 'pending',
        });

      if (insertError) throw insertError;

      // 2. Update assignment status → submitted
      const { error: updateError } = await supabase
        .from('assignments')
        .update({ status: 'submitted' })
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      toast.success('Submission berhasil dikirim!');
      setUrl('');
      onSubmit?.();
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Gagal mengirim submission. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="glass-card"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <h3
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--text-main)',
        }}
      >
        📤 Kirim Submission
      </h3>

      {disabled ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>✅</span>
          <span style={{ fontSize: '0.9rem', color: '#22c55e', fontWeight: 500 }}>
            Submission sudah dikirim
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="post-link"
              style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}
            >
              Link Posting
            </label>
            <input
              id="post-link"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError('');
              }}
              placeholder="https://instagram.com/p/..."
              disabled={disabled || loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${urlError ? '#ef4444' : 'var(--border-color)'}`,
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                opacity: disabled || loading ? 0.5 : 1,
              }}
              onFocus={(e) => {
                if (!urlError) e.target.style.borderColor = 'var(--primary-color)';
              }}
              onBlur={(e) => {
                if (!urlError) e.target.style.borderColor = 'var(--border-color)';
              }}
            />
            {urlError && (
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  marginTop: '2px',
                }}
              >
                {urlError}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={disabled || loading}
            className="btn btn-primary"
            style={{
              alignSelf: 'flex-start',
              opacity: disabled || loading ? 0.6 : 1,
              cursor: disabled || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Mengirim...' : 'Kirim Submission'}
          </button>
        </form>
      )}
    </div>
  );
}
