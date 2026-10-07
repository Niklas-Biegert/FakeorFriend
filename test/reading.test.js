import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { duoDetail, personReadings } from '../js/reading.js';
import { parseChat } from '../js/parse.js';
import { chatStats } from '../js/stats.js';
import { SAMPLE_CHAT } from '../js/sample.js';
import de from '../js/locales/de.js';
import en from '../js/locales/en.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

const people = ['Mara', 'Leo'];
function sample({ first = 12, second = 6, starts = [3, 2], of = 5, replies = 4 } = {}) {
  const make = (messages, wordCount, startCount) => ({
    messages, textLength: { medianWords: wordCount, medianChars: wordCount * 7, n: messages },
    starts: { count: startCount, of }, reply: replies >= 3 ? { median: 120000, n: replies } : null,
    text: 'sensitive message that should not enter the reading',
  });
  return new Map([['Mara', make(20, first, starts[0])], ['Leo', make(16, second, starts[1])]]);
}

test('clear starts and length lead yield a contextual, counted reading without chat text', () => {
  const [a, b] = personReadings(sample(), people);
  assert.equal(a.title, 'starter');
  assert.deepEqual(a.lines.map(({ key }) => key), ['startsLead', 'lengthLead', 'reply', 'limits']);
  assert.equal(b.lines[0].key, 'starts');
  assert.equal(a.lines[1].vars.n, 20);
  assert.doesNotMatch(JSON.stringify([a, b]), /sensitive message/);
  assert.deepEqual(duoDetail(sample(), people), { key: 'similar', vars: { first: 20, second: 16 } });
});

test('tied starts, near ties in words, and too few replies cannot imply a winner', () => {
  const [a, b] = personReadings(sample({ first: 9, second: 8, starts: [2, 2], replies: 2 }), people);
  assert.ok([a, b].every((reading) => reading.lines[0].key === 'starts'));
  assert.ok([a, b].every((reading) => !reading.lines.some((line) => line.key === 'lengthLead' || line.key === 'reply')));
  assert.equal(a.title, 'exchange');
  const short = sample({ of: 2 });
  assert.ok(personReadings(short, people).every((reading) => reading.lines[0].key === 'startsUnknown'));
  assert.ok(personReadings(sample(), people, { truncated: true }).every((reading) => reading.lines[0].key === 'startsTruncated' && reading.title !== 'starter'));
});

test('missing speakers, insufficient messages and raw text remain neutral', () => {
  const stats = sample(); stats.get('Mara').textLength.n = 2;
  assert.ok(personReadings(stats, people).every((reading) => reading.title === 'unknown'));
  assert.equal(duoDetail(stats, people, { raw: true }), null);
  assert.ok(personReadings(sample(), people, { raw: true }).every((reading) => reading.title === 'unknown'));
  assert.deepEqual(personReadings(null, people).map((reading) => reading.title), ['unknown', 'unknown']);
  assert.equal(duoDetail(stats, people), null);
});

test('real fictional sample supports two readings; translations and visible reading section are complete', async () => {
  const readings = personReadings(chatStats(parseChat(SAMPLE_CHAT)), people);
  assert.equal(readings.length, 2);
  assert.ok(readings.every((reading) => reading.lines.length >= 3));
  for (const locale of [de, en, fr, es]) {
    assert.ok(locale.reading.title && locale.reading.subtitle && locale.reading.scalesTitle);
    for (const key of ['starter', 'detailed', 'brief', 'exchange', 'unknown']) assert.ok(locale.reading.headings[key]);
    for (const key of ['startsLead', 'starts', 'startsUnknown', 'startsTruncated', 'lengthLead', 'length', 'reply', 'limits', 'unknown']) assert.ok(locale.reading.lines[key]);
    for (const key of ['similar', 'different', 'varied']) assert.ok(locale.reading.duo[key]);
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('id="animal-duo"') < html.indexOf('id="person-readings"'));
  assert.ok(html.indexOf('id="person-readings"') < html.indexOf('id="connection-scales"'));
  assert.ok(html.indexOf('id="connection-scales"') < html.indexOf('id="timeline-content"'));
});
