/**
 * Rule-based layer applied on top of the AI result, plus a keyword fallback
 * classifier used when the AI service is unavailable.
 * Matching is whole-word / whole-phrase so "firewall" does not match "fire".
 */
const DEPARTMENTS = ['Roads', 'Electricity', 'Drainage', 'Sanitation'];
const PRIORITIES = ['High', 'Medium', 'Low'];

const HIGH_PRIORITY_KEYWORDS = ['hospital', 'accident', 'accidents', 'fire', 'emergency', 'collapse', 'collapsed', 'injured', 'electrocution', 'live wire', 'exposed wire', 'open manhole', 'sparking'];
const SENSITIVE_LOCATION_KEYWORDS = ['school', 'hospital', 'main road', 'market', 'junction', 'highway', 'bus stop', 'college', 'temple', 'mosque', 'church'];
const LONG_DURATION_PATTERNS = [
  /\b(\d+|several|many|few)\s+(weeks?|months?)\b/,
  /\b([5-9]|\d{2,})\s+days\b/,
  /\bsince\s+(last\s+)?(week|month|long)\b/,
  /\b(long time|no one came|nobody came|ignored|not resolved|still not)\b/
];

const DEPT_KEYWORDS = {
  Roads: ['road', 'pothole', 'potholes', 'footpath', 'sidewalk', 'bridge', 'traffic', 'signal', 'speed breaker', 'highway', 'crack', 'asphalt'],
  Electricity: ['electric', 'electricity', 'power', 'street light', 'streetlight', 'light', 'lights', 'transformer', 'wire', 'wires', 'pole', 'voltage', 'outage', 'blackout', 'meter'],
  Drainage: ['drain', 'drainage', 'sewer', 'sewage', 'waterlogging', 'water logging', 'manhole', 'overflow', 'flood', 'flooding', 'clogged'],
  Sanitation: ['garbage', 'waste', 'trash', 'litter', 'dustbin', 'sweeping', 'dump', 'smell', 'stink', 'sanitation', 'toilet', 'mosquito', 'cleanliness']
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hasWord(text, kw) {
  return new RegExp(`(^|[^a-z0-9])${escapeRe(kw)}($|[^a-z0-9])`).test(text);
}
function firstMatch(text, list) {
  return list.find((kw) => hasWord(text, kw)) || null;
}

function applyRuleOverrides(complaintText, location, aiResult) {
  const text = `${(complaintText || '').toLowerCase()} ${(location || '').toLowerCase()}`;
  let basePriority = aiResult.basePriority || 'Medium';
  let reason = aiResult.reason || '';
  let escalatedByRules = false;
  let sensitiveLocation = false;
  const add = (msg) => { reason = reason ? `${reason} ${msg}` : msg; };

  const safetyKw = firstMatch(text, HIGH_PRIORITY_KEYWORDS);
  if (safetyKw && basePriority !== 'High') {
    basePriority = 'High';
    escalatedByRules = true;
    add(`[Rule: "${safetyKw}" detected - escalated to High.]`);
  }

  const locKw = firstMatch(text, SENSITIVE_LOCATION_KEYWORDS);
  if (locKw) {
    sensitiveLocation = true;
    if (basePriority === 'Low') {
      basePriority = 'Medium';
      escalatedByRules = true;
      add(`[Sensitive location: "${locKw}" - priority increased.]`);
    } else {
      add(`[Sensitive location: "${locKw}".]`);
    }
  }

  if (!escalatedByRules && LONG_DURATION_PATTERNS.some((re) => re.test(text))) {
    if (basePriority === 'Low') {
      basePriority = 'Medium';
      escalatedByRules = true;
      add('[Long-standing issue - priority increased.]');
    } else if (basePriority === 'Medium') {
      basePriority = 'High';
      escalatedByRules = true;
      add('[Long-standing issue - escalated to High.]');
    }
  }

  return { basePriority, reason, escalatedByRules, sensitiveLocation };
}

/** Keyword fallback: returns { department|null, basePriority, reason, confidence } */
function fallbackClassify(complaintText, location = '') {
  const text = `${(complaintText || '').toLowerCase()} ${(location || '').toLowerCase()}`;
  let best = null;
  let bestScore = 0;
  for (const dept of DEPARTMENTS) {
    const score = DEPT_KEYWORDS[dept].filter((kw) => hasWord(text, kw)).length;
    if (score > bestScore) { best = dept; bestScore = score; }
  }
  return {
    department: best,
    basePriority: 'Medium',
    reason: best
      ? 'AI service unavailable - classified using keyword matching. Please review.'
      : 'AI service unavailable and no keywords matched - needs manual review.',
    confidence: best ? Math.min(0.6, 0.3 + bestScore * 0.1) : 0
  };
}

module.exports = { DEPARTMENTS, PRIORITIES, applyRuleOverrides, fallbackClassify };
