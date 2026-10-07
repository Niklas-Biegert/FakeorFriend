import { MIN_SAMPLE } from './stats.js';

// A reading describes the counted, submitted excerpt. It never sees message
// text, and the four Jev scores describe the pair rather than either person.
// Each returned key has a fixed, reviewed translation in every language.
export function personReadings(stats, people, { raw = false, truncated = false } = {}) {
  if (people.length !== 2) return [];
  const [a, b] = people.map((name) => stats?.get(name));
  if (raw || !a || !b || ![a, b].every((s) => s.textLength?.n >= MIN_SAMPLE)) {
    return people.map((name) => ({ name, title: 'unknown', lines: [{ key: 'unknown', vars: {} }] }));
  }
  return people.map((name, index) => {
    const own = index ? b : a;
    const other = index ? a : b;
    const lines = [];
    // Starts are only compared across the same conversations. A tie or fewer
    // than five conversations cannot produce a leader.
    const starts = own.starts;
    const leads = !truncated && starts?.of >= 5 && other.starts?.of === starts.of && starts.count > other.starts.count;
    if (truncated) lines.push({ key: 'startsTruncated', vars: {} });
    else if (leads) lines.push({ key: 'startsLead', vars: { count: starts.count, of: starts.of } });
    else if (starts?.of >= 5) lines.push({ key: 'starts', vars: { count: starts.count, of: starts.of } });
    else lines.push({ key: 'startsUnknown', vars: {} });

    const words = own.textLength.medianWords;
    const othersWords = other.textLength.medianWords;
    // Ignore small differences that can be described as a "winner" by luck.
    const wordLead = words > othersWords && words - othersWords >= 3 && words >= othersWords * 1.25;
    const title = leads ? 'starter' : wordLead ? 'detailed' : words <= 6 ? 'brief' : 'exchange';
    lines.push({ key: wordLead ? 'lengthLead' : 'length', vars: {
      words, chars: own.textLength.medianChars, n: own.textLength.n,
    } });
    if (own.reply?.n >= MIN_SAMPLE) {
      lines.push({ key: 'reply', vars: { duration: own.reply.median, n: own.reply.n } });
    }
    lines.push({ key: 'limits', vars: {} });
    return { name, title, lines };
  });
}

/** Count balance is an observation, not a measure of investment or affection. */
export function duoDetail(stats, people, { raw = false } = {}) {
  if (raw || people.length !== 2) return null;
  if (!people.every((name) => stats?.get(name)?.textLength?.n >= MIN_SAMPLE)) return null;
  const counts = people.map((name) => stats?.get(name)?.messages);
  if (!counts.every((n) => Number.isInteger(n) && n >= 5)) return null;
  const [low, high] = [...counts].sort((a, b) => a - b);
  const key = high <= low * 1.25 ? 'similar' : high >= low * 2 ? 'different' : 'varied';
  return { key, vars: { first: counts[0], second: counts[1] } };
}
