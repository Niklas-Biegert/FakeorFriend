import { MIN_SAMPLE } from './stats.js';

export const ANIMALS = Object.freeze(['mouse', 'cat', 'dog', 'hedgehog', 'owl', 'rabbit', 'tortoise', 'neutral']);

// Stickers describe only counted behaviour in the submitted excerpt. They do
// not classify people or extrapolate beyond the messages that Jev saw.
export function animalDuo(stats, people, { raw = false } = {}) {
  if (raw || !stats || people.length !== 2) return people.map(() => ({ key: 'neutral' }));
  const [first, second] = people.map((name) => stats.get(name));
  if (![first, second].every((s) => s?.textLength?.n >= MIN_SAMPLE)) return people.map(() => ({ key: 'neutral' }));
  return [first, second].map((s, index) => {
    const other = index === 0 ? second : first;
    if (s.starts?.of >= MIN_SAMPLE && other.starts?.of >= MIN_SAMPLE && s.starts.count > other.starts.count)
      return { key: 'dog', count: s.starts.count, of: s.starts.of };
    if (s.clock?.n >= 10 && s.clock.late * 2 >= s.clock.n)
      return { key: 'owl', count: s.clock.late, n: s.clock.n };
    if (s.reply?.n >= 5 && s.reply.median <= 3 * 60_000)
      return { key: 'rabbit', value: Math.round(s.reply.median / 60_000), n: s.reply.n };
    if (s.reply?.n >= 5 && s.reply.median >= 30 * 60_000)
      return { key: 'tortoise', value: Math.round(s.reply.median / 60_000), n: s.reply.n };
    if (s.textLength.medianWords >= 15)
      return { key: 'hedgehog', value: s.textLength.medianWords, n: s.textLength.n };
    if (s.textLength.medianWords <= 6)
      return { key: 'mouse', value: s.textLength.medianWords, n: s.textLength.n };
    return { key: 'cat', value: s.textLength.medianWords, n: s.textLength.n };
  });
}

// Pair copy uses only the existing four ordinal scores. Raw/unverified inputs
// cannot acquire a relationship claim or pair story.
export function duoStory(answers, { raw = false, n = 0 } = {}) {
  if (raw || !Number.isInteger(n) || n < 6 || ['warmth', 'reciprocity', 'tension', 'clarity']
    .some((k) => !Number.isInteger(answers?.[k]?.score) || answers[k].score < 0 || answers[k].score > 3)) return 'uncertain';
  if (answers.tension.score >= 2) return 'friction';
  if (answers.clarity.score <= 1) return 'clarify';
  if (answers.warmth.score >= 2 && answers.reciprocity.score >= 2) return 'warm';
  return 'everyday';
}
