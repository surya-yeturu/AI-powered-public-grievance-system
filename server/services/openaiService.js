const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Base priority keywords: if present, force High (rule-based override)
const HIGH_PRIORITY_KEYWORDS = ['school', 'hospital', 'accident', 'fire', 'emergency', 'collapse', 'injured'];
// Duration/urgency keywords: suggest escalation
const DURATION_KEYWORDS = ['days', 'week', 'weeks', 'long time', 'months', 'since long', 'no one came', 'ignored'];
// Sensitive location keywords: +20 score bonus and flag
const SENSITIVE_LOCATION_KEYWORDS = ['school', 'hospital', 'main road', 'market', 'junction', 'highway', 'bus stop'];

/**
 * Apply rule-based overrides after AI classification.
 * AI provides base intent; rules refine final decision for fairness and safety.
 */
function applyRuleOverrides(complaintText, location, aiResult) {
  const text = `${(complaintText || '').toLowerCase()} ${(location || '').toLowerCase()}`;
  let basePriority = aiResult.basePriority || aiResult.priority || 'Medium';
  let reason = aiResult.reason || aiResult.priorityReason || '';
  let escalatedByRules = false;
  let sensitiveLocation = false;

  // Rule 1: Safety/critical keywords → force High
  for (const kw of HIGH_PRIORITY_KEYWORDS) {
    if (text.includes(kw)) {
      basePriority = 'High';
      escalatedByRules = true;
      reason = reason ? `${reason} [Rule: "${kw}" detected - escalated to High.]` : `Escalated to High due to "${kw}".`;
      break;
    }
  }

  // Rule 2: Sensitive location → flag for score bonus (and optionally escalate if was Low)
  for (const kw of SENSITIVE_LOCATION_KEYWORDS) {
    if (text.includes(kw)) {
      sensitiveLocation = true;
      if (basePriority === 'Low') {
        basePriority = 'Medium';
        escalatedByRules = true;
        reason = reason ? `${reason} [Sensitive location: "${kw}".]` : `Sensitive location "${kw}" - priority increased.`;
      } else {
        reason = reason ? `${reason} [Sensitive location: "${kw}".]` : reason;
      }
      break;
    }
  }

  // Rule 3: Duration/urgency keywords → increase urgency by one level (max High)
  if (!escalatedByRules) {
    for (const kw of DURATION_KEYWORDS) {
      if (text.includes(kw)) {
        if (basePriority === 'Low') {
          basePriority = 'Medium';
          escalatedByRules = true;
          reason = reason ? `${reason} [Duration/urgency: "${kw}" - priority increased.]` : `Pending duration - priority increased.`;
        } else if (basePriority === 'Medium') {
          basePriority = 'High';
          escalatedByRules = true;
          reason = reason ? `${reason} [Duration/urgency: "${kw}" - escalated to High.]` : `Long pending - escalated to High.`;
        }
        break;
      }
    }
  }

  return {
    basePriority,
    reason,
    escalatedByRules,
    sensitiveLocation
  };
}

/**
 * Classify complaint using OpenAI API (hybrid: AI + rule-based overrides).
 * Returns department, basePriority, reason, and rule flags.
 */
exports.classifyComplaint = async (complaintText, location = '') => {
  try {
    const prompt = `You are an AI assistant for a smart city grievance system. Classify citizen complaints strictly.

RULES:
- department: exactly one of Roads, Electricity, Drainage, Sanitation
- basePriority: exactly one of High, Medium, Low (based on safety, impact, urgency)
- reason: one short sentence explaining why this priority

Return ONLY valid JSON in this exact format:
{"department":"","basePriority":"","reason":""}

EXAMPLES:

Complaint: "Pothole on Main Street causing bike accidents."
{"department":"Roads","basePriority":"High","reason":"Safety hazard causing accidents."}

Complaint: "Street light not working in lane 5 for 2 days."
{"department":"Electricity","basePriority":"Medium","reason":"Public amenity failure, moderate urgency."}

Complaint: "Garbage not collected from our colony for a week."
{"department":"Sanitation","basePriority":"High","reason":"Prolonged waste accumulation affects health."}

Complaint: "Drainage clogged near the market, water logging."
{"department":"Drainage","basePriority":"High","reason":"Market area water logging affects commerce and safety."}

Complaint: "Minor crack on sidewalk in park."
{"department":"Roads","basePriority":"Low","reason":"Low impact infrastructure issue."}

NOW CLASSIFY THIS COMPLAINT:

Complaint: ${complaintText}
${location ? `Location: ${location}` : ''}`;

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You classify civic complaints. Respond with valid JSON only: {"department":"...","basePriority":"...","reason":"..."}. No other text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    const department = parsed.department || 'Roads';
    const validDepartments = ['Roads', 'Electricity', 'Drainage', 'Sanitation'];
    const validPriorities = ['High', 'Medium', 'Low'];

    let basePriority = validPriorities.includes(parsed.basePriority) ? parsed.basePriority : 'Medium';
    let reason = typeof parsed.reason === 'string' ? parsed.reason.trim() : 'Classified by AI.';

    // Apply rule-based overrides (safety, duration, sensitive location)
    const overridden = applyRuleOverrides(complaintText, location, { basePriority, reason });
    basePriority = overridden.basePriority;
    reason = overridden.reason;

    return {
      success: true,
      data: {
        department: validDepartments.includes(department) ? department : 'Roads',
        basePriority,
        reason,
        escalatedByRules: overridden.escalatedByRules,
        sensitiveLocation: overridden.sensitiveLocation
      }
    };
  } catch (error) {
    console.error('OpenAI Classification Error:', error.message);
    return {
      success: false,
      data: {
        department: 'Roads',
        basePriority: 'Medium',
        reason: 'Auto-classified due to AI service error. Please review manually.',
        escalatedByRules: false,
        sensitiveLocation: false
      },
      error: error.message
    };
  }
};

/**
 * Test OpenAI connection
 */
exports.testConnection = async () => {
  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    return { success: true, message: 'OpenAI connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
