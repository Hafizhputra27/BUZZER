/**
 * Validates whether a URL is valid.
 * Returns false if empty, whitespace-only, or does not start with http:// or https://.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  if (!url || url.trim() === '') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Validates a campaign form input.
 * @param {{ title: string, description: string, deadline: string }} input
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateCampaignForm(input) {
  const errors = {};

  if (!input.title || input.title.trim() === '') {
    errors.title = 'Title is required';
  }
  if (!input.description || input.description.trim() === '') {
    errors.description = 'Description is required';
  }
  if (!input.deadline || input.deadline.trim() === '') {
    errors.deadline = 'Deadline is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates the progress percentage of approved submissions.
 * @param {number} approved
 * @param {number} total
 * @returns {number}
 */
export function calculateProgress(approved, total) {
  if (total === 0) return 0;
  return (approved / total) * 100;
}

/**
 * Computes stats from an array of assignments.
 * @param {Array<{ status: string, buzzer_id: string, campaign_id: string }>} assignments
 * @returns {{ activeCampaigns: number, totalAssignments: number, activeBuzzers: number, approvedSubmissions: number }}
 */
export function computeStats(assignments) {
  const approvedSubmissions = assignments.filter(a => a.status === 'approved').length;
  const totalAssignments = assignments.length;
  const activeBuzzers = new Set(assignments.map(a => a.buzzer_id)).size;
  const activeCampaigns = new Set(assignments.map(a => a.campaign_id)).size;

  return {
    activeCampaigns,
    totalAssignments,
    activeBuzzers,
    approvedSubmissions,
  };
}
