/**
 * Dynamic Priority Score Service
 * Computes: BasePriorityScore + AgingScore + LocationBonus
 * Ensures fairness: low-priority complaints rise over time; sensitive locations get bonus.
 */

const BASE_SCORES = { High: 100, Medium: 60, Low: 30 };
const AGING_POINTS_PER_DAY = 10;
const SENSITIVE_LOCATION_BONUS = 20;
const SENSITIVE_KEYWORDS = ['school', 'hospital', 'main road', 'market', 'junction', 'highway', 'bus stop'];

/**
 * Get base score from basePriority (or legacy priority)
 */
function getBaseScore(complaint) {
  const p = complaint.basePriority || complaint.priority || 'Medium';
  return BASE_SCORES[p] ?? BASE_SCORES.Medium;
}

/**
 * Days since creation (only count unresolved days for aging)
 */
function getDaysPending(complaint) {
  const created = new Date(complaint.createdAt);
  const until = complaint.status === 'Resolved' ? new Date(complaint.updatedAt) : new Date();
  const ms = until - created;
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

/**
 * Aging score: +10 per full day unresolved. Prevents starvation of low/medium.
 */
function getAgingScore(complaint) {
  if (complaint.status === 'Resolved') return 0;
  const days = getDaysPending(complaint);
  return days * AGING_POINTS_PER_DAY;
}

/**
 * Sensitive location bonus: +20 if complaint/location mentions sensitive keywords
 */
function getLocationBonus(complaint) {
  if (complaint.sensitiveLocation === true) return SENSITIVE_LOCATION_BONUS;
  const text = `${(complaint.complaintText || '')} ${(complaint.location || '')}`.toLowerCase();
  for (const kw of SENSITIVE_KEYWORDS) {
    if (text.includes(kw)) return SENSITIVE_LOCATION_BONUS;
  }
  return 0;
}

/**
 * Calculate final priority score and explanation.
 * Recalculate when: complaint fetched, status changed, or day passed.
 */
function calculatePriorityScore(complaint) {
  const baseScore = getBaseScore(complaint);
  const agingScore = getAgingScore(complaint);
  const locationBonus = getLocationBonus(complaint);
  const total = baseScore + agingScore + locationBonus;

  const daysPending = getDaysPending(complaint);
  const explanation = {
    aiReason: complaint.priorityReason || 'Classified by system.',
    basePriority: complaint.basePriority || complaint.priority,
    baseScore,
    agingScore,
    agingDays: complaint.status === 'Resolved' ? 0 : daysPending,
    locationBonus: locationBonus > 0 ? SENSITIVE_LOCATION_BONUS : 0,
    sensitiveLocation: locationBonus > 0,
    escalatedByRules: complaint.escalatedByRules === true,
    finalScore: total,
    summary: []
  };

  if (explanation.aiReason) explanation.summary.push(explanation.aiReason);
  if (agingScore > 0) explanation.summary.push(`+${agingScore} points (${daysPending} day(s) pending).`);
  if (locationBonus > 0) explanation.summary.push(`+${locationBonus} points (sensitive location).`);
  if (explanation.escalatedByRules) explanation.summary.push('Priority increased by rules (safety/duration/location).');

  return {
    priorityScore: total,
    daysPending,
    explanation
  };
}

/**
 * Enrich a single complaint (or plain object) with computed score and explanation.
 * Mutates and returns the same object with priorityScore, daysPending, priorityExplanation.
 */
function enrichComplaint(complaint) {
  const doc = complaint.toObject ? complaint.toObject() : { ...complaint };
  const result = calculatePriorityScore(doc);
  doc.priorityScore = result.priorityScore;
  doc.daysPending = result.daysPending;
  doc.priorityExplanation = result.explanation;
  return doc;
}

/**
 * Sort complaints by final score DESC, then createdAt ASC (older first when tie).
 */
function sortByPriorityScore(complaints) {
  const enriched = complaints.map((c) => enrichComplaint(c));
  enriched.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  return enriched;
}

module.exports = {
  calculatePriorityScore,
  enrichComplaint,
  sortByPriorityScore,
  getDaysPending,
  BASE_SCORES,
  AGING_POINTS_PER_DAY,
  SENSITIVE_LOCATION_BONUS
};
