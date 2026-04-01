import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

export default function AssignBuzzerModal({ campaignId, alreadyAssigned = [], onAssign, onClose }) {
  const [buzzers, setBuzzers] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [{ data: buzzerData, error: buzzerError }, { data: campaignData, error: campaignError }] =
          await Promise.all([
            supabase.from('users').select('id, name, email').eq('role', 'buzzer'),
            supabase.from('campaigns').select('*').eq('id', campaignId).single(),
          ]);

        if (buzzerError) throw buzzerError;
        if (campaignError) throw campaignError;

        const available = (buzzerData || []).filter((b) => !alreadyAssigned.includes(b.id));
        setBuzzers(available);
        setCampaign(campaignData);
      } catch (err) {
        toast.error('Gagal memuat data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [campaignId, alreadyAssigned]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error('Pilih minimal satu buzzer');
      return;
    }

    setSubmitting(true);
    const assignedIds = [];

    try {
      for (const buzzerId of selected) {
        const buzzer = buzzers.find((b) => b.id === buzzerId);

        const { data: insertData, error: insertError } = await supabase
          .from('assignments')
          .insert({ campaign_id: campaignId, buzzer_id: buzzerId, status: 'pending' })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            toast.error(`Buzzer ${buzzer?.name || buzzerId} sudah ditugaskan`);
          } else {
            toast.error(`Gagal menugaskan ${buzzer?.name || buzzerId}: ${insertError.message}`);
          }
          continue;
        }

        assignedIds.push(buzzerId);

        // Send assignment email via Edge Function
        try {
          await supabase.functions.invoke('send-assignment-email', {
            body: {
              assignmentId: insertData.id,
              buzzerEmail: buzzer?.email,
              buzzerName: buzzer?.name,
              campaignTitle: campaign?.title,
              campaignDescription: campaign?.description,
              campaignDeadline: campaign?.deadline,
            },
          });
        } catch (emailErr) {
          // Email failure is non-blocking — assignment is still saved
          console.error('Email send failed for buzzer', buzzerId, emailErr);
        }
      }

      if (assignedIds.length > 0) {
        toast.success(`${assignedIds.length} buzzer berhasil ditugaskan`);
        if (onAssign) await onAssign(assignedIds);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-md mx-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Tugaskan Buzzer
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Tutup"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Memuat daftar buzzer...</p>
        ) : buzzers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Tidak ada buzzer tersedia untuk ditugaskan.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Pilih buzzer yang akan ditugaskan ke campaign ini:
            </p>

            <ul
              className="flex flex-col gap-2"
              style={{
                maxHeight: '280px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {buzzers.map((buzzer) => (
                <li key={buzzer.id}>
                  <label
                    className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition"
                    style={{
                      background: selected.includes(buzzer.id)
                        ? 'rgba(26, 115, 232, 0.15)'
                        : 'var(--surface-color)',
                      border: `1px solid ${
                        selected.includes(buzzer.id)
                          ? 'rgba(26, 115, 232, 0.5)'
                          : 'var(--border-color)'
                      }`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(buzzer.id)}
                      onChange={() => toggleSelect(buzzer.id)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{buzzer.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {buzzer.email}
                      </span>
                    </div>
                  </label>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-glass flex-1 text-sm"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 text-sm"
                disabled={submitting || selected.length === 0}
              >
                {submitting ? 'Menugaskan...' : `Tugaskan (${selected.length})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
