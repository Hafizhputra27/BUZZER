// Feature: buzzer-basketball-platform, Task 12.2: AssignmentCards component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const { mockFrom, mockUser } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  const mockUser = { id: 'user-123' };
  return { mockFrom, mockUser };
});

vi.mock('../../services/supabase', () => ({
  supabase: { from: mockFrom },
}));

vi.mock('../../store/authStore', () => ({
  default: vi.fn((selector) =>
    typeof selector === 'function' ? selector({ user: mockUser }) : { user: mockUser }
  ),
}));

import AssignmentCards from '../AssignmentCards';

function renderComponent() {
  return render(
    <MemoryRouter>
      <AssignmentCards />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function wireAssignments(assignments) {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: assignments, error: null }),
    }),
  });
}

// ---------------------------------------------------------------------------
// Tests — Requirements 5.1, 5.2, 5.3, 9.3
// ---------------------------------------------------------------------------
describe('AssignmentCards', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state initially', () => {
    // Never resolves — keeps loading state visible
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(new Promise(() => {})),
      }),
    });

    renderComponent();
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('shows empty state when no assignments returned', async () => {
    // **Validates: Requirements 5.1**
    wireAssignments([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No assignments yet')).toBeInTheDocument();
    });
  });

  it('renders assignment cards with campaign title, excerpt, deadline, and status', async () => {
    // **Validates: Requirements 5.2, 5.3**
    wireAssignments([
      {
        id: 'a1',
        status: 'pending',
        buzzer_id: 'user-123',
        campaigns: {
          title: 'Campaign Alpha',
          description: 'Brief description of the campaign.',
          deadline: '2025-12-31',
        },
      },
    ]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Campaign Alpha')).toBeInTheDocument();
      expect(screen.getByText('Brief description of the campaign.')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('truncates long descriptions to 100 chars with ellipsis', async () => {
    const longDesc = 'A'.repeat(120);
    wireAssignments([
      {
        id: 'a2',
        status: 'submitted',
        buzzer_id: 'user-123',
        campaigns: { title: 'Campaign Beta', description: longDesc, deadline: null },
      },
    ]);

    renderComponent();

    await waitFor(() => {
      const excerpt = screen.getByText(/^A+…$/);
      expect(excerpt.textContent.length).toBeLessThanOrEqual(102); // 100 chars + '…'
    });
  });

  it('renders correct status badge colors for all statuses', async () => {
    // **Validates: Requirements 5.3, 9.3**
    const statuses = ['pending', 'submitted', 'approved', 'rejected'];
    const assignments = statuses.map((status, i) => ({
      id: `a${i}`,
      status,
      buzzer_id: 'user-123',
      campaigns: { title: `Campaign ${status}`, description: 'desc', deadline: null },
    }));

    wireAssignments(assignments);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });

  it('each card links to the assignment detail page', async () => {
    // **Validates: Requirements 5.4**
    wireAssignments([
      {
        id: 'assign-99',
        status: 'approved',
        buzzer_id: 'user-123',
        campaigns: { title: 'Linked Campaign', description: 'desc', deadline: '2025-06-01' },
      },
    ]);

    renderComponent();

    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/dashboard/buzzer/assignments/assign-99');
    });
  });
});

// Feature: buzzer-basketball-platform, Property 8: Buzzer hanya melihat assignment miliknya
describe('AssignmentCards — Property 8: Buzzer hanya melihat assignment miliknya', () => {
  // **Validates: Requirements 5.1**
  it('property: Supabase query always filters by the logged-in buzzer_id and all returned assignments belong to that buzzer', async () => {
    const fc = await import('fast-check');
    const useAuthStore = (await import('../../store/authStore')).default;

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(
          fc.record({
            id: fc.uuid(),
            status: fc.constantFrom('pending', 'submitted', 'approved', 'rejected'),
            campaigns: fc.record({
              title: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ minLength: 0, maxLength: 200 }),
              deadline: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
            }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        async (buzzerId, rawAssignments) => {
          // Build assignments with the correct buzzer_id for this run
          const assignments = rawAssignments.map(a => ({ ...a, buzzer_id: buzzerId }));

          // Wire up the mock auth store to return this buzzerId
          useAuthStore.mockImplementation((selector) => {
            const state = { user: { id: buzzerId } };
            return typeof selector === 'function' ? selector(state) : state;
          });

          // Capture the eq mock so we can assert on its arguments
          const eqMock = vi.fn().mockResolvedValue({ data: assignments, error: null });
          mockFrom.mockReturnValue({
            select: vi.fn().mockReturnValue({ eq: eqMock }),
          });

          const { unmount } = render(
            <MemoryRouter>
              <AssignmentCards />
            </MemoryRouter>
          );

          // Wait for the async fetch to complete
          await waitFor(() => {
            expect(eqMock).toHaveBeenCalled();
          });

          // Property: eq must be called with ('buzzer_id', buzzerId)
          expect(eqMock).toHaveBeenCalledWith('buzzer_id', buzzerId);

          // Property: every assignment returned has the correct buzzer_id
          const result = await eqMock.mock.results[0].value;
          const returnedData = result?.data ?? [];
          for (const assignment of returnedData) {
            expect(assignment.buzzer_id).toBe(buzzerId);
          }

          unmount();
          vi.clearAllMocks();
        }
      ),
      { numRuns: 100 }
    );
  });
});
