import { MIN_SAMPLE } from './stats.js';

/** Only numeric, locally counted observations enter the share image. */
export function shareHighlights(counts) {
  const highlights = [];
  if (counts?.reply?.n >= MIN_SAMPLE && Number.isFinite(counts.reply.median)) {
    highlights.push({ key: 'reply', median: counts.reply.median, n: counts.reply.n });
  }
  if (counts?.textLength?.n >= MIN_SAMPLE && Number.isFinite(counts.textLength.medianChars)) {
    highlights.push({ key: 'chars', median: counts.textLength.medianChars, n: counts.textLength.n });
  }
  return highlights;
}
