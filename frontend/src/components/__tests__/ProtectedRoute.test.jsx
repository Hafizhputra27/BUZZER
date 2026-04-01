// Feature: buzzer-basketball-platform, Property 2 & 3: Redirect logic
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

vi.mock('../../store/authStore');

import useAuthStore from '../../store/authStore';

beforeEach(() => {
  vi.resetAllMocks();
});

// ─── Property 2: Redirect ke login jika tidak ada sesi ────────────────────────

// Validates: Requirements 1.4
describe('ProtectedRoute — Property 2: Redirect ke login jika tidak ada sesi', () => {
  it('does not render protected content when session is null', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('admin', 'buzzer', 'user', null),
        (requiredRole) => {
          useAuthStore.mockReturnValue({ session: null, role: null });

          const { unmount } = render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
              <Routes>
                <Route
                  path="*"
                  element={
                    <ProtectedRoute requiredRole={requiredRole}>
                      <div>Protected</div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          );

          expect(screen.queryByText('Protected')).toBeNull();
          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ─── Property 3: Buzzer tidak bisa akses Dashboard Admin ─────────────────────

// Validates: Requirements 1.5
describe('ProtectedRoute — Property 3: Buzzer tidak bisa akses Dashboard Admin', () => {
  it('does not render admin content when role is buzzer', () => {
    fc.assert(
      fc.property(
        fc.record({
          user: fc.string({ minLength: 1 }),
        }),
        (sessionData) => {
          useAuthStore.mockReturnValue({ session: sessionData, role: 'buzzer' });

          const { unmount } = render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
              <Routes>
                <Route
                  path="*"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <div>Admin Content</div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          );

          expect(screen.queryByText('Admin Content')).toBeNull();
          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
