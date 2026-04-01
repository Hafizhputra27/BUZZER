// Feature: buzzer-basketball-platform, Property 1: Role-based redirect setelah login
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// Mock supabase
vi.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock react-router-dom to capture navigate calls
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock authStore - LoginPage uses useAuthStore((state) => state.setUser) selector pattern
const mockSetUser = vi.fn();
vi.mock('../../store/authStore', () => ({
  default: vi.fn((selector) => {
    const state = { setUser: mockSetUser };
    return selector ? selector(state) : state;
  }),
}));

import { supabase } from '../../services/supabase';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Property 1: Role-based redirect setelah login ───────────────────────────

// Validates: Requirements 1.3
describe('LoginPage — Property 1: Role-based redirect setelah login', () => {
  it('navigates to correct dashboard based on role after successful login', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('admin', 'buzzer'),
        async (role) => {
          vi.clearAllMocks();

          const fakeUser = { id: 'user-123' };
          const fakeSession = { access_token: 'token-abc' };

          // Mock signInWithPassword success
          supabase.auth.signInWithPassword.mockResolvedValue({
            data: { user: fakeUser, session: fakeSession },
            error: null,
          });

          // Mock supabase.from('users').select('role').eq('id', ...).single()
          const singleMock = vi.fn().mockResolvedValue({
            data: { role },
            error: null,
          });
          const eqMock = vi.fn().mockReturnValue({ single: singleMock });
          const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
          supabase.from.mockReturnValue({ select: selectMock });

          const { unmount } = render(
            <MemoryRouter>
              <LoginPage />
            </MemoryRouter>
          );

          // Fill in the form
          fireEvent.change(screen.getByPlaceholderText('Masukkan email'), {
            target: { value: 'test@example.com' },
          });
          fireEvent.change(screen.getByPlaceholderText('Masukkan password'), {
            target: { value: 'password123' },
          });

          // Submit the form
          fireEvent.click(screen.getByRole('button', { name: /login/i }));

          // Wait for async operations
          await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
          });

          const expectedPath =
            role === 'admin' ? '/dashboard/admin' : '/dashboard/buzzer';
          expect(mockNavigate).toHaveBeenCalledWith(expectedPath);

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
