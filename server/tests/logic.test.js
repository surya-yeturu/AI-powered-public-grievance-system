const test = require('node:test');
const assert = require('node:assert');
const { applyRuleOverrides, fallbackClassify } = require('../services/classificationRules');
const { calculatePriorityScore } = require('../services/priorityScoreService');
const { evaluateEscalation } = require('../services/escalationService');

const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

test('whole-word matching: "firewall" does not trigger the fire rule', () => {
  const r = applyRuleOverrides('Firewall box is broken', 'Sector 4', { basePriority: 'Low', reason: '' });
  assert.strictEqual(r.basePriority, 'Low');
});

test('safety keyword forces High', () => {
  const r = applyRuleOverrides('Accident happened near the pothole', '', { basePriority: 'Low', reason: '' });
  assert.strictEqual(r.basePriority, 'High');
  assert.ok(r.escalatedByRules);
});

test('"2 days" does not escalate, "3 weeks" does', () => {
  assert.strictEqual(applyRuleOverrides('Light off for 2 days', '', { basePriority: 'Low' }).basePriority, 'Low');
  assert.strictEqual(applyRuleOverrides('Light off for 3 weeks', '', { basePriority: 'Low' }).basePriority, 'Medium');
});

test('sensitive location lifts Low to Medium and sets flag', () => {
  const r = applyRuleOverrides('Crack on wall', 'Near City School', { basePriority: 'Low' });
  assert.strictEqual(r.basePriority, 'Medium');
  assert.ok(r.sensitiveLocation);
});

test('keyword fallback routes by department', () => {
  assert.strictEqual(fallbackClassify('Garbage dump and bad smell').department, 'Sanitation');
  assert.strictEqual(fallbackClassify('asdf qwer').department, null);
});

test('aging adds points per day and is capped', () => {
  const base = { basePriority: 'Low', status: 'Pending', sensitiveLocation: false };
  const d5 = calculatePriorityScore({ ...base, createdAt: daysAgo(5) });
  assert.strictEqual(d5.priorityScore, 30 + 50);
  const d90 = calculatePriorityScore({ ...base, createdAt: daysAgo(90) });
  assert.strictEqual(d90.priorityScore, 30 + 300); // capped at 30 days
});

test('resolved complaints get no aging', () => {
  const r = calculatePriorityScore({ basePriority: 'High', status: 'Resolved', createdAt: daysAgo(10), updatedAt: new Date() });
  assert.strictEqual(r.priorityScore, 100);
});

test('escalation: pending 49h with no official update', () => {
  const e = evaluateEscalation({ basePriority: 'Low', status: 'Pending', createdAt: hoursAgo(49), updatedAt: hoursAgo(49) });
  assert.strictEqual(e.level, 'Response Delayed');
  assert.ok(e.escalatedToAdmin);
});

test('escalation: high priority 25h with no update', () => {
  const e = evaluateEscalation({ basePriority: 'High', status: 'Pending', createdAt: hoursAgo(25), updatedAt: hoursAgo(25) });
  assert.ok(e.escalatedToAdmin);
});

test('escalation: fresh complaint is not escalated', () => {
  const e = evaluateEscalation({ basePriority: 'Medium', status: 'Pending', createdAt: hoursAgo(2), updatedAt: hoursAgo(2) });
  assert.strictEqual(e.escalatedToAdmin, false);
});
