const DAY = 86_400_000;
const MAX_DAYS = 1827;
const safeDate = (at) => typeof at === 'number' && Number.isSafeInteger(at) && Number.isFinite(new Date(at).getTime());
const dayOf = (at) => Math.floor(at / DAY) * DAY;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
};
const ranks = (values) => {
  const sorted = values.map((value, i) => [value, i]).sort((a, b) => a[0] - b[0]);
  const output = Array(values.length);
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j][0] === sorted[i][0]) j++;
    for (let k = i; k < j; k++) output[sorted[k][1]] = (i + j - 1) / 2;
    i = j;
  }
  return output;
};
function spearman(x, y) {
  const a = ranks(x), b = ranks(y);
  const av = a.reduce((sum, value) => sum + value, 0) / a.length;
  const bv = b.reduce((sum, value) => sum + value, 0) / b.length;
  const numerator = a.reduce((sum, value, i) => sum + (value - av) * (b[i] - bv), 0);
  const aa = a.reduce((sum, value) => sum + (value - av) ** 2, 0);
  const bb = b.reduce((sum, value) => sum + (value - bv) ** 2, 0);
  return aa && bb ? numerator / Math.sqrt(aa * bb) : null;
}

// OLS line through equally spaced calendar periods, including zero periods.
function trendOf(points) {
  if (points.filter((point) => point.total > 0).length < 7 || points.length < 14) return null;
  const mean = points.reduce((sum, item) => sum + item.total, 0) / points.length;
  const center = (points.length - 1) / 2;
  const denominator = points.reduce((sum, _, i) => sum + (i - center) ** 2, 0);
  const slope = points.reduce((sum, item, i) => sum + (i - center) * (item.total - mean), 0) / denominator;
  return { start: mean - slope * center, end: mean + slope * center, slope, periods: points.length };
}

/** No time zone conversion: UTC fields reflect the wall-clock fields kept by stamps.js. */
export function timelineOf(messages, people) {
  if (!Array.isArray(messages) || people?.length !== 2 || !messages.length ||
      messages.some(({ author }) => !people.includes(author))) return { reason: 'unavailable' };
  const valid = messages.filter(({ at }) => safeDate(at));
  if (valid.length !== messages.length) return { reason: 'missingDates' };
  const first = valid.reduce((min, { at }) => Math.min(min, dayOf(at)), Infinity);
  const last = valid.reduce((max, { at }) => Math.max(max, dayOf(at)), -Infinity);
  const days = Math.round((last - first) / DAY) + 1;
  if (days > MAX_DAYS) return { reason: 'tooLong' };
  const byDay = new Map();
  for (let at = first; at <= last; at += DAY) byDay.set(at, { at, counts: [0, 0], lengths: [[], []] });
  for (const { author, text, at } of valid) {
    const row = byDay.get(dayOf(at));
    const person = people.indexOf(author);
    row.counts[person]++;
    row.lengths[person].push(Array.from(text).length);
  }
  const daily = [...byDay.values()].map((row) => ({ ...row, total: row.counts[0] + row.counts[1] }));
  const weekly = days > 42;
  const points = weekly ? Array.from({ length: Math.ceil(days / 7) }, (_, i) => {
    const rows = daily.slice(i * 7, i * 7 + 7);
    return { at: rows[0].at, counts: [0, 1].map((p) => rows.reduce((sum, row) => sum + row.counts[p], 0)),
      total: rows.reduce((sum, row) => sum + row.total, 0), days: rows.length };
  }) : daily.map(({ at, counts, total }) => ({ at, counts, total, days: 1 }));
  const finds = [];
  const active = daily.filter((row) => row.total > 0);
  if (active.length >= 10 && [0, 1].every((i) => active.filter((row) => row.counts[i] > 0).length >= 5)) {
    const rho = spearman(active.map((row) => row.counts[0]), active.map((row) => row.counts[1]));
    if (rho !== null && Math.abs(rho) >= 0.65) finds.push({ key: 'together', direction: rho > 0 ? 'same' : 'opposite', rho: Math.round(rho * 100) / 100, n: active.length });
  }
  // Equal weight per person avoids a change in writer mix looking like a
  // change in text length. Each participant must supply two messages that day.
  const lengths = active.filter((row) => row.counts.every((count) => count >= 2))
    .map((row) => ({ total: row.total, chars: (median(row.lengths[0]) + median(row.lengths[1])) / 2 }))
    .sort((a, b) => a.total - b.total);
  if (lengths.length >= 16 && lengths[3].total < lengths.at(-4).total) {
    const low = median(lengths.slice(0, 4).map((row) => row.chars));
    const high = median(lengths.slice(-4).map((row) => row.chars));
    if (Math.abs(high - low) >= 8 && Math.max(high, low) / Math.max(1, Math.min(high, low)) >= 1.3) {
      finds.push({ key: 'length', direction: high > low ? 'longer' : 'shorter', low, high, n: lengths.length, perGroup: 4 });
    }
  }
  return { people: [...people], daily, points, weekly,
    trend: trendOf(weekly && points.at(-1).days < 7 ? points.slice(0, -1) : points), finds,
    activeDays: active.length, totalDays: days,
    cardFact: days >= 7 && active.length >= 3 ? { activeDays: active.length, totalDays: days } : null };
}
