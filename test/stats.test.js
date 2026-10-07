import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chatStats, recordsOf } from '../js/stats.js';
import { parseChat } from '../js/parse.js';

const MIN = 60_000;
const HOUR = 60 * MIN;
const say = (author, minute, text = 'ok') => ({ author, text, at: minute === null ? null : minute * MIN });

test('a reply is timed from the end of the other person’s block to the start of the next', () => {
  const stats = chatStats([
    say('Ana', 0), say('Ana', 5), say('Ben', 7), // Ben: 2 min after Ana's last message
    say('Ana', 8), say('Ben', 18), // 10 min
    say('Ana', 20), say('Ben', 24), // 4 min
  ]);
  assert.deepEqual(stats.get('Ben').reply, { median: 4 * MIN, n: 3 });
  assert.equal(stats.get('Ana').reply, null, 'two replies are too few for a median');
});

test('a night’s silence starts a new conversation instead of counting as a slow reply', () => {
  const stats = chatStats([say('Ana', 0), say('Ben', 1), say('Ben', 9 * 60), say('Ana', 9 * 60 + 1)]);
  assert.deepEqual(stats.get('Ben').starts, { count: 1, of: 2 });
  assert.deepEqual(stats.get('Ana').starts, { count: 1, of: 2 });
  assert.ok(!chatStats([say('Ana', 0), say('Ben', 7 * 60)]).get('Ben').reply);
});

test('without timestamps only counts are known, never times', () => {
  const stats = chatStats([say('Ana', null, 'one two three'), say('Ben', null), say('Ana', null, 'x')]);
  assert.deepEqual(stats.get('Ana'), { messages: 2, medianWords: 2, textLength: null, reply: null, starts: null, clock: null });
});

test('text length counts Unicode code points and includes whitespace, without storing text', () => {
  const stats = chatStats([
    say('Ana', null, 'a b'),    // 2 words, 3 code points
    say('Ana', null, '🙂\nx'),   // 2 words, 3 code points (emoji and newline count once each)
    say('Ana', null, 'hello!'), // 1 word, 6 code points
  ]);
  assert.deepEqual(stats.get('Ana').textLength, {
    medianWords: 2, medianChars: 3, maxWords: 2, maxChars: 6, n: 3,
  });
  assert.equal(stats.get('Ana').medianWords, 2, 'existing field retains its value');
  assert.ok(!JSON.stringify(stats.get('Ana')).includes('hello!'), 'no raw message retained');
  assert.deepEqual(chatStats([]), new Map());
});

test('short samples stay unranked, and parsed media and system lines are not counted', () => {
  const messages = parseChat([
    '19.09.26, 10:00 - Mara: hi',
    '19.09.26, 10:01 - Mara: <Media omitted>',
    '19.09.26, 10:02 - Mara added Ben',
    '19.09.26, 10:03 - Ben: ok',
  ].join('\n'));
  const stats = chatStats(messages);
  assert.equal(stats.get('Mara').messages, 1);
  assert.equal(stats.get('Mara').textLength, null);
  assert.equal(stats.get('Ben').messages, 1);
});

test('missing timestamp at the end of a group of messages cannot imply reply time', () => {
  const messages = [say('Ana', 0), say('Ana', null), say('Ben', 5)];
  assert.equal(chatStats(messages).get('Ben').reply, null);
  assert.deepEqual(chatStats(messages).get('Ben').starts, { count: 0, of: 1 });
});

test('records need two contenders and a clear winner', () => {
  const chat = [];
  // One conversation, so nobody can hold the starter record.
  // Each round: Ana replies to Cy after 4 min, Ben to Ana after 1, Cy to Ben after 10.
  for (let i = 0; i < 4; i++) chat.push(say('Ana', i * 15, 'a b c d'), say('Ben', i * 15 + 1, 'a b'), say('Cy', i * 15 + 11, 'a b'));
  const stats = chatStats(chat);
  const holders = (names) => Object.fromEntries(recordsOf(stats, names).map((r) => [r.key, r.name]));

  assert.deepEqual(holders(['Ana', 'Ben', 'Cy']), { slowest: 'Cy', fastest: 'Ben', wordiest: 'Ana' });
  assert.ok(!('wordiest' in holders(['Ben', 'Cy'])), 'Ben and Cy tie, so neither is wordier');
  assert.deepEqual(holders(['Ana']), {});
});
