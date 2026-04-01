// Feature: buzzer-basketball-platform, Property 12 & 13: Approve/Reject status update
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared before any module imports that use them
// ---------------------------------------------------------------------------
const { mockFrom } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return { mockFrom };
});

vi.mock('../../services/supabase', () => ({
  supabase: { from: mockFrom },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import SubmissionReviewList from '../SubmissionReviewList';

// ---------------------------------------------------------------------------
// Helper: wire mockFrom for a given pending submission
// Returns the per-table update spies so we can assert on them.
// ---------------------------------------------------------------------------
function wireMocks(pendingSubmission) {
  const submissionsUpdateMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }));
  const assignmentsUpdateMock = vi.fn(() => ({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }));

  mockFrom.mockImplementation((table) => {
    if (table === 'submissions') {
      return {
        // initial fetch: .select().eq().order()
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: [pendingSubmission],
              error: null,
            }),
          })),
        })),
        update: submissionsUpdateMock,
      };
    }
    if (table === 'assignments') {
      return { update: assignmentsUpdateMock };
    }
    return {};
  });

  return { submissionsUpdateMock, assignmentsUpdateMock };
}

// ---------------------------------------------------------------------------
// Property 12: Approve → submissions.status = 'approved' AND
//                         assignments.status = 'approved'
// Validates: Requirements 7.3
// ---------------------------------------------------------------------------
describe('SubmissionReviewList — Property 12: Approve status update', () => {
  beforeEach(() => vi.clearAllMocks());

  it('approve memanggil update submissions dan assignments dengan status approved', async () => {
    // **Validates: Requirements 7.3**

    // Generate IDs via fast-check (property-based ID generation)
    const [submissionId, assignmentId, campaignId] = fc.sample(fc.uuid(), 3);

    const pendingSubmission = {
      id: submissionId,
      assignment_id: assignmentId,
      campaign_id: campaignId,
      status: 'pending',
      post_link: 'https://example.com/post',
      submitted_at: new Date().toISOString(),
      users: { name: 'Test Buzzer', email: 'buzzer@test.com' },
    };

    const { submissionsUpdateMock, assignmentsUpdateMock } = wireMocks(pendingSubmission);

    const user = userEvent.setup();
    render(<SubmissionReviewList campaignId={campaignId} />);

    // Wait for the pending submission to render
    await waitFor(() => {
      expect(screen.getByText('✓ Approve')).toBeInTheDocument();
    });

    await user.click(screen.getByText('✓ Approve'));

    await waitFor(() => {
      // supabase.from('submissions').update({ status: 'approved' }) called
      expect(submissionsUpdateMock).toHaveBeenCalledWith({ status: 'approved' });
      // supabase.from('assignments').update({ status: 'approved' }) called
      expect(assignmentsUpdateMock).toHaveBeenCalledWith({ status: 'approved' });
    });
  });
});

// ---------------------------------------------------------------------------
// Property 13: Reject → submissions.status = 'rejected' AND
//                        assignments.status = 'pending'
// Validates: Requirements 7.4
// ---------------------------------------------------------------------------
describe('SubmissionReviewList — Property 13: Reject status update', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reject memanggil update submissions dengan rejected dan assignments dengan pending', async () => {
    // **Validates: Requirements 7.4**

    // Generate IDs via fast-check (property-based ID generation)
    const [submissionId, assignmentId, campaignId] = fc.sample(fc.uuid(), 3);

    const pendingSubmission = {
      id: submissionId,
      assignment_id: assignmentId,
      campaign_id: campaignId,
      status: 'pending',
      post_link: 'https://example.com/post',
      submitted_at: new Date().toISOString(),
      users: { name: 'Test Buzzer', email: 'buzzer@test.com' },
    };

    const { submissionsUpdateMock, assignmentsUpdateMock } = wireMocks(pendingSubmission);

    const user = userEvent.setup();
    render(<SubmissionReviewList campaignId={campaignId} />);

    await waitFor(() => {
      expect(screen.getByText('✕ Reject')).toBeInTheDocument();
    });

    await user.click(screen.getByText('✕ Reject'));

    await waitFor(() => {
      // supabase.from('submissions').update({ status: 'rejected' }) called
      expect(submissionsUpdateMock).toHaveBeenCalledWith({ status: 'rejected' });
      // supabase.from('assignments').update({ status: 'pending' }) called
      expect(assignmentsUpdateMock).toHaveBeenCalledWith({ status: 'pending' });
    });
  });
});
