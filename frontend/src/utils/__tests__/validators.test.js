import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  isValidUrl,
  validateCampaignForm,
  calculateProgress,
  computeStats,
} from '../validators';

// ─── Unit tests: isValidUrl ───────────────────────────────────────────────────

describe('isValidUrl', () => {
  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isValidUrl('   ')).toBe(false);
  });

  it('returns false for string without http/https', () => {
    expect(isValidUrl('instagram.com/p/abc')).toBe(false);
  });

  it('returns true for https URL', () => {
    expect(isValidUrl('https://instagram.com/p/abc')).toBe(true);
  });

  it('returns true for http URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });
});

// ─── Unit tests: calculateProgress ───────────────────────────────────────────

describe('calculateProgress', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('returns 0 when no approved', () => {
    expect(calculateProgress(0, 5)).toBe(0);
  });

  it('returns 100 when all approved', () => {
    expect(calculateProgress(5, 5)).toBe(100);
  });

  it('returns correct percentage', () => {
    expect(calculateProgress(2, 4)).toBe(50);
  });
});

// ─── Unit tests: computeStats ─────────────────────────────────────────────────

describe('computeStats', () => {
  it('returns zeros for empty array', () => {
    const stats = computeStats([]);
    expect(stats).toEqual({
      activeCampaigns: 0,
      totalAssignments: 0,
      activeBuzzers: 0,
      approvedSubmissions: 0,
    });
  });

  it('counts approved submissions correctly', () => {
    const assignments = [
      { status: 'approved', buzzer_id: 'b1', campaign_id: 'c1' },
      { status: 'pending', buzzer_id: 'b2', campaign_id: 'c1' },
      { status: 'approved', buzzer_id: 'b3', campaign_id: 'c2' },
    ];
    const stats = computeStats(assignments);
    expect(stats.approvedSubmissions).toBe(2);
    expect(stats.totalAssignments).toBe(3);
    expect(stats.activeBuzzers).toBe(3);
    expect(stats.activeCampaigns).toBe(2);
  });

  it('deduplicates buzzers and campaigns', () => {
    const assignments = [
      { status: 'pending', buzzer_id: 'b1', campaign_id: 'c1' },
      { status: 'pending', buzzer_id: 'b1', campaign_id: 'c1' },
    ];
    const stats = computeStats(assignments);
    expect(stats.activeBuzzers).toBe(1);
    expect(stats.activeCampaigns).toBe(1);
  });
});

// ─── Unit tests: validateCampaignForm ────────────────────────────────────────

describe('validateCampaignForm', () => {
  it('returns valid for complete input', () => {
    const result = validateCampaignForm({
      title: 'Campaign A',
      description: 'Some description',
      deadline: '2025-12-31',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('returns invalid when title is empty', () => {
    const result = validateCampaignForm({ title: '', description: 'desc', deadline: '2025-12-31' });
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('returns invalid when description is empty', () => {
    const result = validateCampaignForm({ title: 'T', description: '', deadline: '2025-12-31' });
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeDefined();
  });

  it('returns invalid when deadline is empty', () => {
    const result = validateCampaignForm({ title: 'T', description: 'D', deadline: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.deadline).toBeDefined();
  });

  it('returns invalid when title is whitespace only', () => {
    const result = validateCampaignForm({ title: '   ', description: 'desc', deadline: '2025-12-31' });
    expect(result.valid).toBe(false);
  });
});

// ─── Property test: Campaign form validation ──────────────────────────────────

// Feature: buzzer-basketball-platform, Property 4: Campaign form validation
describe('validateCampaignForm — Property 4', () => {
  it('rejects any input with empty or whitespace-only title', () => {
    // Validates: Requirements 2.5
    fc.assert(
      fc.property(
        fc.record({
          title: fc.oneof(
            fc.constant(''),
            fc.array(fc.constant(' '), { minLength: 1 }).map(arr => arr.join(''))
          ),
          description: fc.string(),
          deadline: fc.string(),
        }),
        (input) => {
          const result = validateCampaignForm(input);
          expect(result.valid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: buzzer-basketball-platform, Property 9: Submission URL validation
describe('isValidUrl — Property 9', () => {
  it('rejects empty string, whitespace-only, or any string not starting with http', () => {
    // Validates: Requirements 6.4
    const whitespaceArb = fc.array(fc.constant(' '), { minLength: 1 }).map(arr => arr.join(''));
    const nonHttpArb = fc.string().filter(s => !s.startsWith('http'));

    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), whitespaceArb, nonHttpArb),
        (url) => {
          expect(isValidUrl(url)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: buzzer-basketball-platform, Property 14 & 15: Statistik konsisten dengan data

// Property 14: Statistik admin konsisten dengan data
describe('computeStats — Property 14', () => {
  it('approvedSubmissions equals count of assignments with status approved', () => {
    // Validates: Requirements 10.1
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            status: fc.constantFrom('pending', 'submitted', 'approved', 'rejected'),
            buzzer_id: fc.string(),
            campaign_id: fc.string(),
          })
        ),
        (assignments) => {
          const stats = computeStats(assignments);
          const expectedApproved = assignments.filter(a => a.status === 'approved').length;
          expect(stats.approvedSubmissions).toBe(expectedApproved);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 15: Progress bar konsisten dengan data assignment
describe('calculateProgress — Property 15', () => {
  it('returns (approved / total) * 100 for any valid approved <= total', () => {
    // Validates: Requirements 10.2
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain(total =>
          fc.integer({ min: 0, max: total }).map(approved => ({ approved, total }))
        ),
        ({ approved, total }) => {
          const result = calculateProgress(approved, total);
          expect(result).toBe((approved / total) * 100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 0 when total is 0', () => {
    // Validates: Requirements 10.2
    fc.assert(
      fc.property(
        fc.integer(),
        (anything) => {
          expect(calculateProgress(anything, 0)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
