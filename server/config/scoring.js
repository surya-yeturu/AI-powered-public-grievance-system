/**
 * Central scoring / escalation configuration. All values can be overridden via env.
 */
const num = (v, d) => (v !== undefined && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : d);

module.exports = {
  BASE_SCORES: { High: 100, Medium: 60, Low: 30 },
  AGING_POINTS_PER_DAY: num(process.env.AGING_POINTS_PER_DAY, 10),
  // Aging stops growing after this many days so very old items cannot grow without bound
  AGING_MAX_DAYS: num(process.env.AGING_MAX_DAYS, 30),
  SENSITIVE_LOCATION_BONUS: 20,
  RESPONSE_DELAY_HOURS: num(process.env.RESPONSE_DELAY_HOURS, 48),
  RESOLUTION_DELAY_DAYS: num(process.env.RESOLUTION_DELAY_DAYS, 5),
  CRITICAL_PRIORITY_HOURS: num(process.env.CRITICAL_PRIORITY_HOURS, 24),
  ESCALATION_CRON: process.env.ESCALATION_CRON || '0 * * * *' // hourly
};
