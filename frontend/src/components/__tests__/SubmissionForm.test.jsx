// Feature: buzzer-basketball-platform, Property 11: Form submission dinonaktifkan
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    })),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import SubmissionForm from '../SubmissionForm';

// ---------------------------------------------------------------------------
// Property 11: Form submission dinonaktifkan setelah submitted/approved
// Validates: Requirements 6.5
// ---------------------------------------------------------------------------
describe('SubmissionForm — Property 11: Form submission dinonaktifkan setelah submitted/approved', () => {
  it('menampilkan pesan "Submission sudah dikirim" dan menyembunyikan form ketika disabled=true', () => {
    // **Validates: Requirements 6.5**
    fc.assert(
      fc.property(
        fc.constantFrom('submitted', 'approved'),
        (status) => {
          const { unmount } = render(
            <SubmissionForm
              assignmentId="assignment-1"
              campaignId="campaign-1"
              buzzerId="buzzer-1"
              disabled={true}
            />
          );

          // The "Submission sudah dikirim" message must be present
          expect(screen.getByText('Submission sudah dikirim')).toBeInTheDocument();

          // The submit button must NOT be present
          expect(screen.queryByRole('button', { name: /kirim submission/i })).not.toBeInTheDocument();

          unmount();
        }
      )
    );
  });

  it('menampilkan form dan tombol submit ketika disabled=false', () => {
    // **Validates: Requirements 6.5**
    render(
      <SubmissionForm
        assignmentId="assignment-1"
        campaignId="campaign-1"
        buzzerId="buzzer-1"
        disabled={false}
      />
    );

    // The submit button must be present
    expect(screen.getByRole('button', { name: /kirim submission/i })).toBeInTheDocument();

    // The "Submission sudah dikirim" message must NOT be present
    expect(screen.queryByText('Submission sudah dikirim')).not.toBeInTheDocument();
  });
});

// Feature: buzzer-basketball-platform, Property 10: Status assignment terupdate setelah submission
// ---------------------------------------------------------------------------
// Property 10: Status assignment terupdate setelah submission
// Validates: Requirements 6.3
// ---------------------------------------------------------------------------
import { fireEvent, waitFor } from '@testing-library/react';
import { supabase } from '../../services/supabase';

describe('SubmissionForm — Property 10: Status assignment terupdate setelah submission', () => {
  it('memanggil supabase.from("assignments").update({ status: "submitted" }) setelah submit berhasil', async () => {
    // **Validates: Requirements 6.3**
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (assignmentId) => {
          // Capture the update mock
          const mockEq = vi.fn().mockResolvedValue({ error: null });
          const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
          const mockInsert = vi.fn().mockResolvedValue({ error: null });

          supabase.from.mockImplementation((table) => {
            if (table === 'assignments') return { update: mockUpdate };
            if (table === 'submissions') return { insert: mockInsert };
            return { insert: vi.fn().mockResolvedValue({ error: null }), update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) };
          });

          const { unmount } = render(
            <SubmissionForm
              assignmentId={assignmentId}
              campaignId="campaign-1"
              buzzerId="buzzer-1"
              disabled={false}
            />
          );

          // Fill in a valid URL
          const input = screen.getByPlaceholderText(/https:\/\/instagram\.com/i);
          fireEvent.change(input, { target: { value: 'https://example.com/post' } });

          // Click submit
          const submitBtn = screen.getByRole('button', { name: /kirim submission/i });
          fireEvent.click(submitBtn);

          // Wait for async operations
          await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith({ status: 'submitted' });
            expect(mockEq).toHaveBeenCalledWith('id', assignmentId);
          });

          unmount();
        }
      )
    );
  });
});
