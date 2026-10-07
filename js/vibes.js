/** Display rules for a playful excerpt, not a validated relationship measure. */
export const VIBE_KEYS = Object.freeze(['friendly', 'mixed', 'strained', 'uncertain']);

/** The map shows only Jev's two ordinal scores. No hidden weighting. */
export function vibePoint(answers, raw = false) {
  if (raw) return null;
  const warmth = answers?.warmth?.score;
  const tension = answers?.tension?.score;
  if (![warmth, tension].every((value) => Number.isFinite(value) && value >= 0 && value <= 3)) return null;
  return { x: warmth / 3, y: tension / 3 };
}

/** A factual count chart, kept separate from any judgement of the exchange. */
export function messageBalance(stats, people) {
  if (!stats || people.length !== 2) return null;
  const counts = people.map((name) => stats.get(name)?.messages);
  if (counts.some((value) => !Number.isInteger(value) || value < 0)) return null;
  const total = counts[0] + counts[1];
  return total > 0 ? { counts, total, shares: counts.map((value) => value / total) } : null;
}

/** Supportive, fixed conversation ideas; never diagnose a person. */
export function conversationIdea(answers, raw = false, topics = []) {
  if (raw) return 'open';
  if (answers?.tension?.score >= 2) return 'pause';
  if (answers?.clarity?.score <= 1) return 'clarify';
  if (topics.includes('clarify')) return 'repair';
  if (answers?.warmth?.score >= 2 && answers?.reciprocity?.score >= 2) return 'appreciate';
  if (topics.includes('plans')) return 'plan';
  return 'open';
}
