/**
 * Auto-escalation and admin alert service.
 * Deterministic rules; system-driven only. Officials cannot modify escalation flags.
 */

const Complaint = require('../models/Complaint');

const RESPONSE_DELAY_HOURS = 48;
const RESOLUTION_DELAY_DAYS = 5;
const CRITICAL_PRIORITY_HOURS = 24;

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;

/**
 * Get last official activity time for "days since last update".
 * Prefer lastOfficialUpdateAt; else last progress update; else complaint updatedAt.
 */
function getLastOfficialActivity(complaint) {
  if (complaint.lastOfficialUpdateAt) return new Date(complaint.lastOfficialUpdateAt);
  if (complaint.progressUpdates?.length) {
    const last = complaint.progressUpdates[complaint.progressUpdates.length - 1];
    return last.updatedAt ? new Date(last.updatedAt) : new Date(complaint.updatedAt);
  }
  return new Date(complaint.updatedAt);
}

/** True if an official has ever updated status or added a progress update. */
function hasOfficialUpdate(complaint) {
  return !!complaint.lastOfficialUpdateAt;
}

/**
 * Evaluate a single complaint and return recommended escalation level and reason.
 */
function evaluateEscalation(complaint) {
  const now = new Date();
  const createdAt = new Date(complaint.createdAt);
  const lastActivity = getLastOfficialActivity(complaint);
  const hoursSinceCreation = (now - createdAt) / MS_HOUR;
  const daysSinceLastActivity = (now - lastActivity) / MS_DAY;
  const isPending = complaint.status === 'Pending';
  const isInProgress = complaint.status === 'In Progress';
  const isResolved = complaint.status === 'Resolved';
  const officialHasUpdated = hasOfficialUpdate(complaint);

  if (isResolved) {
    return { level: 'None', reason: '', escalatedToAdmin: false };
  }

  // Critical: High priority, no update within 24 hours
  if (complaint.basePriority === 'High' && !officialHasUpdated && hoursSinceCreation >= CRITICAL_PRIORITY_HOURS) {
    return { level: 'Response Delayed', reason: 'High priority – no response within 24 hours', escalatedToAdmin: true };
  }
  if (complaint.basePriority === 'High' && officialHasUpdated && daysSinceLastActivity * 24 >= CRITICAL_PRIORITY_HOURS && isInProgress) {
    return { level: 'Resolution Delayed', reason: 'High priority – no update in 24+ hours', escalatedToAdmin: true };
  }

  // Response delay: Pending, no official update, > 48 hours
  if (isPending && !officialHasUpdated && hoursSinceCreation >= RESPONSE_DELAY_HOURS) {
    return { level: 'Response Delayed', reason: 'No response to citizen within 48 hours', escalatedToAdmin: true };
  }

  // Resolution delay: In Progress, no update for > 5 days
  if (isInProgress && daysSinceLastActivity >= RESOLUTION_DELAY_DAYS) {
    return { level: 'Resolution Delayed', reason: `No progress update in ${Math.floor(daysSinceLastActivity)} days`, escalatedToAdmin: true };
  }

  return { level: 'None', reason: '', escalatedToAdmin: false };
}

/**
 * Run escalation check on all open complaints (Pending, In Progress).
 * Updates escalationLevel, escalatedAt, escalatedToAdmin.
 * Can be triggered manually (e.g. GET/POST /api/admin/check-escalations) for demo.
 */
async function checkEscalations() {
  const open = await Complaint.find({ status: { $in: ['Pending', 'In Progress'] } }).lean();
  const results = { updated: 0, escalated: 0 };

  for (const doc of open) {
    const { level, reason, escalatedToAdmin } = evaluateEscalation(doc);
    const currentLevel = doc.escalationLevel || 'None';
    const currentlyEscalated = doc.escalatedToAdmin === true;

    const newLevel = level;
    const newEscalated = escalatedToAdmin;

    if (newLevel !== currentLevel || newEscalated !== currentlyEscalated) {
      await Complaint.updateOne(
        { _id: doc._id },
        {
          escalationLevel: newLevel,
          escalatedAt: newEscalated ? new Date() : null,
          escalatedToAdmin: newEscalated
        }
      );
      results.updated += 1;
      if (newEscalated) results.escalated += 1;
    }
  }

  return results;
}

module.exports = {
  checkEscalations,
  evaluateEscalation,
  getLastOfficialActivity,
  hasOfficialUpdate,
  RESPONSE_DELAY_HOURS,
  RESOLUTION_DELAY_DAYS,
  CRITICAL_PRIORITY_HOURS
};
