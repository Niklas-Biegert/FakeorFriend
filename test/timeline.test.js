import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timelineOf } from '../js/timeline.js';
import { readStamps } from '../js/stamps.js';
import { parseChat } from '../js/parse.js';
import { SAMPLE_CHAT } from '../js/sample.js';
import en from '../js/locales/en.js';
import de from '../js/locales/de.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';
const DAY = 86_400_000;
const start = Date.UTC(2026, 8, 1);
const people = ['Mara', 'Leo'];
const message = (d, author, text = 'hey', time = 0) => ({ author, text, at: d === null ? null : start + d * DAY + time });

test('daily line includes zero days and stays on export calendar fields', () => {
  const result = timelineOf([message(0, 'Mara'), message(2, 'Leo'), message(2, 'Mara')], people);
  assert.equal(result.weekly, false);
  assert.deepEqual(result.points.map(({ counts }) => counts), [[1, 0], [0, 0], [1, 1]]);
  assert.equal(result.activeDays, 2);
  assert.equal(result.totalDays, 3);
  assert.equal(result.trend, null);
  assert.equal(result.cardFact, null);
  assert.deepEqual(result.finds, []);
});

test('missing or ambiguous stamps produce no invented timeline', () => {
  assert.equal(timelineOf([message(0, 'Mara'), message(null, 'Leo')], people).reason, 'missingDates');
  const [unknown] = readStamps(['03/04/26, 11:20']);
  assert.equal(unknown, null);
  assert.equal(timelineOf([message(0, 'Mara'), { author: 'Leo', text: 'Hi', at: unknown }], people).reason, 'missingDates');
  assert.equal(timelineOf([], people).reason, 'unavailable');
});

test('longer chats group consecutive seven-day blocks, including empty weeks', () => {
  const result = timelineOf([message(0, 'Mara'), message(47, 'Leo')], people);
  assert.equal(result.weekly, true);
  assert.equal(result.points.length, 7);
  assert.deepEqual(result.points.map(({ total }) => total), [1, 0, 0, 0, 0, 0, 1]);
  assert.equal(result.points.at(-1).days, 6);
  assert.equal(result.trend, null);
  assert.deepEqual(result.cardFact, null);
});

test('a regression requires activity across enough actual periods; zeros affect its slope', () => {
  const many = [];
  for (let d = 0; d < 14; d += 2) many.push(message(d, d % 4 ? 'Mara' : 'Leo'));
  const full = timelineOf(many, people);
  assert.equal(full.points.length, 13);
  assert.equal(full.trend, null);
  many.push(message(13, 'Mara'));
  const result = timelineOf(many, people);
  assert.equal(result.points.length, 14);
  assert.ok(result.trend);
  assert.equal(result.cardFact.activeDays, 8);
  assert.equal(result.cardFact.totalDays, 14);
});

test('an incomplete last week does not drag a weekly regression line', () => {
  const messages = Array.from({ length: 14 }, (_, i) => message(i * 7, i % 2 ? 'Leo' : 'Mara'));
  messages.push(...Array.from({ length: 30 }, () => message(98, 'Leo')));
  const chart = timelineOf(messages, people);
  assert.equal(chart.points.length, 15);
  assert.equal(chart.trend.periods, 14);
  assert.equal(chart.trend.slope, 0);
});

test('no correlation claim from very few days, constant counts, or a lone outlier', () => {
  const constant = Array.from({ length: 20 }, (_, d) => [message(d, 'Mara'), message(d, 'Leo')]).flat();
  assert.deepEqual(timelineOf(constant, people).finds, []);
  const loneOutlier = [...constant, ...Array.from({ length: 50 }, () => message(19, 'Mara'))];
  assert.deepEqual(timelineOf(loneOutlier, people).finds, []);
  assert.deepEqual(timelineOf(parseChat(SAMPLE_CHAT), people).finds, []);
});

test('rank pattern uses active days; length pattern compares days, not individual messages', () => {
  const co = [];
  for (let d = 0; d < 12; d++) for (const author of people)
    for (let k = 0; k <= d; k++) co.push(message(d, author));
  const find = timelineOf(co, people).finds;
  assert.equal(find.length, 1);
  assert.deepEqual(find[0], { key: 'together', direction: 'same', rho: 1, n: 12 });
  const lengths = [];
  for (let d = 0; d < 16; d++) for (let k = 0; k < 4 + d; k++)
    lengths.push(message(d, people[k % 2], 'x'.repeat(d < 8 ? 10 : 30)));
  const lengthFind = timelineOf(lengths, people).finds.find(({ key }) => key === 'length');
  assert.ok(lengthFind);
  assert.equal(lengthFind.n, 16);
  assert.equal(lengthFind.low, 10);
  assert.equal(lengthFind.high, 30);
  const skewed = [];
  for (let d = 0; d < 20; d++) {
    for (let i = 0; i < (d < 10 ? 2 : 12); i++) skewed.push(message(d, 'Mara', 'short'));
    for (let i = 0; i < (d < 10 ? 12 : 2); i++) skewed.push(message(d, 'Leo', 'x'.repeat(80)));
  }
  assert.ok(!timelineOf(skewed, people).finds.some(({ key }) => key === 'length'),
    'a changing writer mix with constant per-person length must not imply longer texts');
});

test('overly long calendar spans are explicit; locale text has corresponding fields', () => {
  assert.equal(timelineOf([message(0, 'Mara'), message(1900, 'Leo')], people).reason, 'tooLong');
  for (const locale of [de, en, fr, es]) {
    assert.ok(locale.timeline.empty.missingDates && locale.timeline.noPatterns && locale.timeline.method);
    assert.ok(locale.timeline.accessible.includes('{firstName}'));
    assert.ok(locale.timeline.cardFact.includes('{activeDays}') && locale.timeline.cardFact.includes('{totalDays}'));
  }
});
