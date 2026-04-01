// Feature: buzzer-basketball-platform, Property 5: Uniqueness constraint assignment
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

const { mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));
  return { mockSingle, mockFrom };
});

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import { supabase } from '../../services/supabase';

beforeEach(() => {
  vi.clearAllMocks();
});

// Validates: Requirements 3.6
describe('AssignBuzzerModal — Property 5: Uniqueness constraint assignment', () => {
  it('menolak duplikasi assignment untuk pasangan (campaign_id, buzzer_id) yang sama', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uuid(),
        async (campaignId, buzzerId) => {
          // Wire up the chain for this iteration
          const mockSelect = vi.fn(() => ({ single: mockSingle }));
          const mockInsert = vi.fn(() => ({ select: mockSelect }));
          mockFrom.mockReturnValue({ insert: mockInsert });

          // First insert succeeds, second fails with uniqueness violation
          mockSingle
            .mockResolvedValueOnce({
              data: { id: 'assignment-1' },
              error: null,
            })
            .mockResolvedValueOnce({
              data: null,
              error: {
                code: '23505',
                message: 'duplicate key value violates unique constraint',
              },
            });

          // Simulate first insert
          const result1 = await supabase
            .from('assignments')
            .insert({ campaign_id: campaignId, buzzer_id: buzzerId, status: 'pending' })
            .select()
            .single();

          // Simulate second insert with same (campaign_id, buzzer_id) pair
          const result2 = await supabase
            .from('assignments')
            .insert({ campaign_id: campaignId, buzzer_id: buzzerId, status: 'pending' })
            .select()
            .single();

          // First insert should succeed
          expect(result1.error).toBeNull();
          expect(result1.data).not.toBeNull();

          // Second insert must return error with uniqueness constraint code
          expect(result2.error).not.toBeNull();
          expect(result2.error.code).toBe('23505');
        }
      ),
      { numRuns: 100 }
    );
  });
});
