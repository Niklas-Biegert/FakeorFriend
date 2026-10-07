import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chatMoment, momentVars } from '../js/moment.js';

const people = ['Mara', 'Leo'];
const pair = (a, b) => new Map(people.map((name, i) => [name, i ? b : a]));
const data = (starts, of, median, n = 7) => ({ starts: { count: starts, of }, reply: { median, n } });
const min = 60_000;

test('one clear starter lead wins; tied and tiny conversations do not', () => {
  assert.deepEqual(chatMoment(pair(data(7, 10, 5 * min), data(3, 10, 5 * min)), people),
    { key: 'starter', winner: 'Mara', count: 7, of: 10 });
  assert.equal(chatMoment(pair(data(3, 6, 5 * min), data(3, 6, 5 * min)), people), null);
  assert.equal(chatMoment(pair(data(3, 4, 5 * min), data(1, 4, 5 * min)), people), null);
  assert.equal(chatMoment(pair(data(3, 5, 5 * min), data(2, 5, 5 * min)), people), null);
  assert.equal(chatMoment(pair(data(7, 10, 5 * min), data(3, 10, 5 * min)), people, { truncated: true }), null);
});

test('replies require five valid blocks for each person and a substantial gap', () => {
  const stats = pair(data(3, 6, 4 * min), data(3, 6, 14 * min));
  assert.deepEqual(chatMoment(stats, people), { key: 'reply', winner: 'Mara', median: 4 * min, n: 7,
    otherMedian: 14 * min, otherN: 7 });
  stats.get('Leo').reply.n = 4;
  assert.equal(chatMoment(stats, people), null);
  stats.get('Leo').reply.n = 7;
  stats.get('Leo').reply.median = 8 * min;
  assert.equal(chatMoment(stats, people), null);
  assert.equal(chatMoment(stats, people, { raw: true }), null);
  assert.equal(chatMoment(null, people), null);
  assert.deepEqual(momentVars({ key: 'starter', winner: 'Mara', count: 7, of: 10 },
    (name) => `Edited ${name}`, String), { name: 'Edited Mara', count: 7, of: 10 });
});
