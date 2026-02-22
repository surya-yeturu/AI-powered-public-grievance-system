/**
 * AI-assisted Daily Work Plan generation for government officials.
 * Plan size and mix are based on available open tasks and realistic daily capacity (clearing time).
 * Deterministic and explainable; no heavy AI usage.
 */

const Complaint = require('../models/Complaint');
const { enrichComplaint, sortByPriorityScore, getDaysPending } = require('./priorityScoreService');

const TARGET_HIGH = 2;
const TARGET_MEDIUM = 1;
const TARGET_LOW = 2;
const TOTAL_PLAN_TASKS = TARGET_HIGH + TARGET_MEDIUM + TARGET_LOW; // 5 tasks per day
const ELIGIBLE_AGE_DAYS = 7; // Complaints older than this must be eligible (fairness)

/**
 * Generate a short rule-based selection reason for a task in the daily plan.
 */
function getSelectionReason(task, slotType) {
  const baseP = task.basePriority || task.priority;
  const days = task.daysPending ?? 0;
  const parts = [];

  if (slotType === 'high') {
    if (baseP === 'High') {
      parts.push('High priority');
      if (days > 0) parts.push(`pending ${days} day(s)`);
      if (task.priorityExplanation?.sensitiveLocation) parts.push('sensitive location');
    } else {
      parts.push('Escalated to today\'s plan (high score)');
      if (days >= ELIGIBLE_AGE_DAYS) parts.push('included to prevent backlog');
    }
  } else if (slotType === 'medium') {
    if (baseP === 'Medium') {
      parts.push('Medium priority');
      if (days > 0) parts.push(`${days} day(s) pending`);
    } else {
      parts.push('Included to balance workload');
      if (days >= ELIGIBLE_AGE_DAYS) parts.push('pending over a week');
    }
  } else {
    parts.push('Low priority');
    if (days >= ELIGIBLE_AGE_DAYS) parts.push('included to prevent backlog; pending over a week');
    else if (days > 0) parts.push(`pending ${days} day(s)`);
  }

  return parts.join('; ') || 'Scheduled for today\'s review.';
}

/**
 * Build daily plan: exactly 2 High, 1 Medium, 2 Low tasks per day (from available complaints).
 * If fewer exist in a tier, fill from next tier. No duplicate complaints; fairness for 7+ day old items.
 */
function selectTasks(sortedList) {
  const high = sortedList.filter((c) => (c.basePriority || c.priority) === 'High');
  const medium = sortedList.filter((c) => (c.basePriority || c.priority) === 'Medium');
  const low = sortedList.filter((c) => (c.basePriority || c.priority) === 'Low');

  const highTarget = TARGET_HIGH;
  const mediumTarget = TARGET_MEDIUM;
  const lowTarget = TARGET_LOW;

  const usedIds = new Set();
  const pick = (list, n, predicate) => {
    const out = [];
    for (const c of list) {
      if (out.length >= n) break;
      if (usedIds.has(c._id.toString())) continue;
      if (!predicate(c)) continue;
      usedIds.add(c._id.toString());
      out.push(c);
    }
    return out;
  };

  // A. High: up to highTarget (from available High); if fewer High exist, fill from top Medium
  let highSlots = pick(sortedList, highTarget, (c) => (c.basePriority || c.priority) === 'High');
  if (highSlots.length < highTarget) {
    const fill = pick(sortedList, highTarget - highSlots.length, (c) => {
      const p = c.basePriority || c.priority;
      return p === 'Medium' && !usedIds.has(c._id.toString());
    });
    highSlots = highSlots.concat(fill);
  }

  // B. Medium: up to mediumTarget (from available Medium); if fewer, fill from top Low
  let mediumSlots = pick(sortedList, mediumTarget, (c) => (c.basePriority || c.priority) === 'Medium');
  if (mediumSlots.length < mediumTarget) {
    const fill = pick(sortedList, mediumTarget - mediumSlots.length, (c) => {
      const p = c.basePriority || c.priority;
      return p === 'Low' && !usedIds.has(c._id.toString());
    });
    mediumSlots = mediumSlots.concat(fill);
  }

  // C. Low: up to lowTarget, oldest first (fairness for 7+ day old low)
  const lowByAge = [...low].filter((c) => !usedIds.has(c._id.toString())).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const lowSlots = lowByAge.slice(0, lowTarget);

  return [
    ...highSlots.map((c) => ({ ...c, slotType: 'high' })),
    ...mediumSlots.map((c) => ({ ...c, slotType: 'medium' })),
    ...lowSlots.map((c) => ({ ...c, slotType: 'low' }))
  ];
}

/**
 * Generate today's recommended work plan for a department.
 * @param {string} department - Roads | Electricity | Drainage | Sanitation
 * @param {string} dateStr - YYYY-MM-DD (default: today)
 * @returns {Promise<{ date, department, tasks }>}
 */
async function generateDailyPlan(department, dateStr = null) {
  const date = dateStr ? new Date(dateStr + 'T00:00:00Z') : new Date();
  const dateOnly = date.toISOString().slice(0, 10);

  const openComplaints = await Complaint.find({
    department,
    status: { $in: ['Pending', 'In Progress'] }
  })
    .populate('citizenId', 'name email')
    .lean();

  const enriched = sortByPriorityScore(openComplaints);
  const highCount = enriched.filter((c) => (c.basePriority || c.priority) === 'High').length;
  const mediumCount = enriched.filter((c) => (c.basePriority || c.priority) === 'Medium').length;
  const lowCount = enriched.filter((c) => (c.basePriority || c.priority) === 'Low').length;
  const selected = selectTasks(enriched);

  const tasks = selected.map((c, index) => ({
    rank: index + 1,
    complaintId: c._id,
    complaintSummary: (c.complaintText || '').length > 100 ? c.complaintText.slice(0, 100) + '...' : (c.complaintText || ''),
    basePriority: c.basePriority || c.priority,
    priorityScore: c.priorityScore,
    daysPending: c.daysPending ?? getDaysPending(c),
    selectionReason: getSelectionReason(c, c.slotType),
    escalatedDueToDelay: (c.daysPending ?? 0) >= ELIGIBLE_AGE_DAYS
  }));

  const highInPlan = tasks.filter((t) => t.basePriority === 'High').length;
  const mediumInPlan = tasks.filter((t) => t.basePriority === 'Medium').length;
  const lowInPlan = tasks.filter((t) => t.basePriority === 'Low').length;
  const summaryParts = [];
  if (enriched.length === 0) {
    summaryParts.push('No open tasks for this department.');
  } else {
    summaryParts.push(`Based on ${highCount} High, ${mediumCount} Medium, ${lowCount} Low open tasks.`);
    summaryParts.push(`Today's plan: 2 High, 1 Medium, 2 Low (${highInPlan + mediumInPlan + lowInPlan} tasks).`);
  }

  return {
    date: dateOnly,
    department,
    tasks,
    note: 'This plan is AI-assisted and recommended. Officials retain full control.',
    summary: summaryParts.join(' ')
  };
}

/**
 * Get set of complaint IDs that appear in today's plan for the given department.
 * Used to mark citizen complaints as "scheduled for review today".
 */
async function getComplaintIdsInTodayPlan(department, dateStr = null) {
  const plan = await generateDailyPlan(department, dateStr);
  return new Set(plan.tasks.map((t) => t.complaintId.toString()));
}

module.exports = {
  generateDailyPlan,
  getComplaintIdsInTodayPlan,
  TOTAL_PLAN_TASKS,
  ELIGIBLE_AGE_DAYS
};
