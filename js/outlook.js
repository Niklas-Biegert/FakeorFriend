// All dates are the written calendar fields encoded by stamps.js. The UTC
// arithmetic below is calendar arithmetic, not a time-zone conversion.
const DAY = 86_400_000;
const WEEK = 7 * DAY;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const monday = (at) => at - ((new Date(at).getUTCDay() + 6) % 7) * DAY;

/** Discard both edge weeks, whose first/last days may be partial exports. */
export function completeWeeks(timeline) {
  const daily = timeline?.daily;
  if (!Array.isArray(daily) || daily.length < 15) return [];
  const byDay = new Map(daily.map((row) => [row.at, row]));
  const weeks = [];
  for (let at = monday(daily[0].at) + WEEK; at < monday(daily.at(-1).at); at += WEEK) {
    const days = Array.from({ length: 7 }, (_, i) => byDay.get(at + i * DAY));
    if (days.some((day) => !day)) return [];
    weeks.push({ at, total: days.reduce((sum, day) => sum + day.total, 0),
      together: days.filter((day) => day.counts[0] > 0 && day.counts[1] > 0).length });
  }
  return weeks;
}

// Bounded past observations prevent one imported burst from setting the
// entire forecast. Alpha is selected using only training weeks.
function model(history, alpha) {
  const cap = Math.max(4, median(history.slice(-8)) * 3);
  const values = history.slice(-8).map((n) => Math.min(n, cap));
  return values.slice(1).reduce((level, value) => alpha * value + (1 - alpha) * level, values[0]);
}
const baseline = (history) => median(history.slice(-4));
const mean = (values) => values.reduce((sum, n) => sum + n, 0) / values.length;

/** Two-week horizon: current partial week is unknown; target is the next one. */
export function forecastWeeks(weeks) {
  if (weeks.length < 26 || weeks.filter((week) => week.total > 0).length < 16)
    return { reason: 'short' };
  const totals = weeks.map(({ total }) => total);
  // The first 18 weeks select a fixed smoothing coefficient. Backtesting
  // uses the following eight weeks, with each target two weeks ahead.
  const alphas = [0.2, 0.4, 0.6, 0.8];
  const fitError = (alpha) => mean(Array.from({ length: 10 }, (_, i) => {
    const target = 8 + i;
    return Math.abs(model(totals.slice(0, target - 1), alpha) - totals[target]);
  }));
  const alpha = alphas.reduce((best, next) => fitError(next) < fitError(best) ? next : best);
  const errors = [];
  const baselineErrors = [];
  for (let target = totals.length - 8; target < totals.length; target++) {
    const past = totals.slice(0, target - 1); // exclude unknown intermediate week
    errors.push(Math.abs(model(past, alpha) - totals[target]));
    baselineErrors.push(Math.abs(baseline(past) - totals[target]));
  }
  const mae = mean(errors);
  const baselineMae = mean(baselineErrors);
  const diagnostics = { mae: Math.round(mae * 10) / 10, baselineMae: Math.round(baselineMae * 10) / 10,
    folds: errors.length, alpha };
  if (!baselineMae || mae > baselineMae * 0.95 || mae > Math.max(3, median(totals.slice(-8)) * 0.6))
    return { reason: 'weak', diagnostics };
  const prediction = model(totals, alpha);
  // Seven of the last eight held-out errors did not exceed this distance.
  // An empirical error band is not a calibrated coverage probability.
  const error = Math.ceil([...errors].sort((a, b) => a - b)[6]);
  return { lower: Math.max(0, Math.floor(prediction - error)), upper: Math.ceil(prediction + error),
    prediction: Math.round(prediction), error, diagnostics };
}

export function outlookOf(timeline, cues, answers, { raw = false, judgedCount = 0 } = {}) {
  const weeks = raw ? [] : completeWeeks(timeline);
  const newest = weeks.slice(-3), older = weeks.slice(-9, -3);
  let rhythm = null;
  if (older.length === 6 && older.filter((week) => week.total > 0).length >= 3) {
    const oldMedian = median(older.map((week) => week.total));
    const newMedian = median(newest.map((week) => week.total));
    if (oldMedian >= 4 && Math.abs(newMedian - oldMedian) >= 4) {
      const direction = newMedian <= oldMedian * 0.65 ? 'down' : newMedian >= oldMedian * 1.5 ? 'up' : null;
      if (direction) rhythm = { direction, oldMedian, newMedian, oldWeeks: 6, newWeeks: 3 };
    }
  }
  const recent = weeks.slice(-4), previous = weeks.slice(-8, -4);
  const coactive = recent.length === 4 ? { recent: recent.reduce((sum, week) => sum + week.together, 0), days: 28,
    previous: previous.length === 4 ? previous.reduce((sum, week) => sum + week.together, 0) : null } : null;
  const forecast = raw || !timeline?.daily ? { reason: timeline?.reason ?? 'unavailable' } : forecastWeeks(weeks);
  const nextMonday = timeline?.daily?.length ? monday(timeline.daily.at(-1).at) + WEEK : null;
  const safe = !raw && judgedCount >= 12 && Number.isInteger(cues?.checked) && answers &&
    ['warmth', 'reciprocity', 'tension'].every((key) => Number.isInteger(answers[key]?.score));
  const noConflict = safe && answers.tension.score <= 1 && !cues.tone.some(({ key }) => key === 'directInsult');
  const scenes = [];
  if (noConflict && answers.warmth.score >= 2 && (cues.tone.find(({ key }) => key === 'compliment')?.n ?? 0) >= 2)
    scenes.push({ key: 'flirt', evidence: { n: cues.tone.find(({ key }) => key === 'compliment').n, total: cues.checked } });
  if (rhythm?.direction === 'down') scenes.push({ key: 'quiet', evidence: rhythm });
  if (noConflict && answers.warmth.score >= 2 && answers.reciprocity.score >= 2 &&
      cues.topics.some(({ key }) => key === 'plans' || key === 'support'))
    scenes.push({ key: 'develop', evidence: { warmth: answers.warmth.score,
      reciprocity: answers.reciprocity.score, n: judgedCount } });
  return { weeks, rhythm, coactive, forecast, nextMonday, scenes };
}
