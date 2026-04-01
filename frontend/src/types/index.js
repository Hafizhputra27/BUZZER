/**
 * @fileoverview JSDoc type definitions for the Buzzer Basketball Platform.
 * These types correspond to the database schema and frontend data models.
 */

/**
 * @typedef {'admin' | 'buzzer'} Role
 */

/**
 * @typedef {'pending' | 'submitted' | 'approved' | 'rejected'} AssignmentStatus
 */

/**
 * @typedef {'pending' | 'approved' | 'rejected'} SubmissionStatus
 */

/**
 * Represents a platform user (admin or buzzer).
 * @typedef {Object} User
 * @property {string} id - UUID of the user
 * @property {string} name - Display name
 * @property {string} email - Email address
 * @property {Role} role - User role
 */

/**
 * Represents a marketing campaign created by an admin.
 * @typedef {Object} Campaign
 * @property {string} id - UUID of the campaign
 * @property {string} title - Campaign title
 * @property {string} description - Campaign brief/description
 * @property {string} deadline - Deadline as ISO date string
 * @property {string} created_by - UUID of the admin who created it
 * @property {string} created_at - Creation timestamp as ISO string
 */

/**
 * Represents a buzzer assignment to a campaign.
 * @typedef {Object} Assignment
 * @property {string} id - UUID of the assignment
 * @property {string} campaign_id - UUID of the related campaign
 * @property {string} buzzer_id - UUID of the assigned buzzer
 * @property {AssignmentStatus} status - Current assignment status
 * @property {string} created_at - Creation timestamp as ISO string
 * @property {Campaign} [campaign] - Optionally joined campaign data
 * @property {User} [buzzer] - Optionally joined buzzer user data
 */

/**
 * Represents a submission made by a buzzer for an assignment.
 * @typedef {Object} Submission
 * @property {string} id - UUID of the submission
 * @property {string} campaign_id - UUID of the related campaign
 * @property {string} buzzer_id - UUID of the buzzer who submitted
 * @property {string} assignment_id - UUID of the related assignment
 * @property {string} post_link - URL of the social media post
 * @property {SubmissionStatus} status - Current submission status
 * @property {string} submitted_at - Submission timestamp as ISO string
 */

/**
 * Input data for creating a new campaign.
 * @typedef {Object} CampaignInput
 * @property {string} title - Campaign title
 * @property {string} description - Campaign brief/description
 * @property {string} deadline - Deadline as ISO date string
 */

/**
 * Aggregated statistics displayed on the admin dashboard.
 * @typedef {Object} StatsData
 * @property {number} activeCampaigns - Number of active campaigns
 * @property {number} totalAssignments - Total number of assignments
 * @property {number} activeBuzzers - Number of active buzzers
 * @property {number} approvedSubmissions - Number of approved submissions
 */

export {};
