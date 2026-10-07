import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timelineOf } from '../js/timeline.js';
import { completeWeeks, forecastWeeks, outlookOf } from '../js/outlook.js';
import { parseChat } from '../js/parse.js';
import { SAMPLE_CHAT } from '../js/sample.js';
import de from '../js/locales/de.js';
import en from '../js/locales/en.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

const DAY = 86_400_000;
const MONDAY = Date.UTC(2026, 0, 5);
const people = ['Mara', 'Leo'];
function messagesForWeeks(totals, { together = false } = {}) {
  const messages = [{ at: MONDAY, author: 'Mara', text: 'start' }];
  for (let week = 0; week < totals.length; week++) {
    const start = MONDAY + (week + 1) * 7 * DAY;
    for (let i = 0; i < totals[week]; i++) messages.push({ at: start + i % 5 * DAY + i * 1000,
      author: together ? people[i % 2] : 'Mara', text: 'hello' });
  }
  messages.push({ at: MONDAY + (totals.length + 1) * 7 * DAY, author: 'Leo', text: 'end' });
  return messages;
}
const timeline = (totals, options) => timelineOf(messagesForWeeks(totals, options), people);
const cues = { checked: 30, tone: [{ key: 'compliment', n: 3 }], topics: [{ key: 'plans', n: 4 }] };
const scores = { warmth: { score: 2 }, reciprocity: { score: 3 }, tension: { score: 0 } };

test('complete Monday–Sunday weeks include silent weeks but exclude uncertain edge weeks', () => {
  const chart = timeline([12, 0, 8, 0]);
  assert.deepEqual(completeWeeks(chart).map(({ total }) => total), [12, 0, 8, 0]);
  const incomplete = timelineOf([...messagesForWeeks([12, 0]), { at: null, author: 'Mara', text: 'unknown' }], people);
  assert.equal(incomplete.reason, 'missingDates');
  assert.equal(completeWeeks(incomplete).length, 0);
  assert.equal(outlookOf(incomplete, cues, scores).forecast.reason, 'missingDates');
});

test('short sample and ambiguous dates receive no pretend forecast', () => {
  const sample = outlookOf(timelineOf(parseChat(SAMPLE_CHAT).slice(0, 40), people), cues, scores, { judgedCount: 40 });
  assert.equal(sample.forecast.reason, 'short');
  assert.equal(sample.rhythm, null);
  assert.equal(sample.coactive, null);
  assert.equal(sample.nextMonday !== null, true);
});

test('rhythm uses robust medians of 3 and 6 complete weeks and coactivity uses 28-day windows', () => {
  const chart = timeline([12, 12, 12, 12, 12, 1000, 3, 3, 3], { together: true });
  const outlook = outlookOf(chart, cues, scores, { judgedCount: 40 });
  assert.equal(outlook.rhythm.direction, 'down');
  assert.equal(outlook.rhythm.oldMedian, 12);
  assert.equal(outlook.rhythm.newMedian, 3);
  assert.equal(outlook.coactive.days, 28);
  assert.equal(outlook.coactive.recent >= 0 && outlook.coactive.recent <= 28, true);
  assert.ok(outlook.scenes.some(({ key }) => key === 'quiet'));
  assert.equal(outlookOf(timeline([12, 12, 12, 12, 12, 12, 12, 12, 12]), cues, scores).rhythm, null);
});

test('future activity needs held-out accuracy better than baseline; quiet and outlier series cannot force a forecast', () => {
  const rising = outlookOf(timeline(Array.from({ length: 30 }, (_, i) => 10 + 2 * i)), cues, scores);
  assert.ok(Number.isInteger(rising.forecast.prediction));
  assert.equal(rising.forecast.diagnostics.folds, 8);
  assert.ok(rising.forecast.diagnostics.mae <= rising.forecast.diagnostics.baselineMae * 0.95);
  assert.ok(rising.forecast.lower <= rising.forecast.prediction && rising.forecast.upper >= rising.forecast.prediction);
  assert.equal(forecastWeeks(Array.from({ length: 28 }, (_, i) => ({ total: i % 2 ? 0 : 5 }))).reason, 'short');
  assert.equal(outlookOf(timeline(Array(30).fill(20)), cues, scores).forecast.reason, 'weak');
  const spike = Array(30).fill(20); spike[25] = 2000;
  assert.equal(outlookOf(timeline(spike), cues, scores).forecast.reason, 'weak');
});

test('speculative cards require corroborating cues and never label a person or raw transcript', () => {
  const warm = outlookOf(timeline(Array(9).fill(10)), cues, scores, { judgedCount: 30 });
  assert.deepEqual(warm.scenes.map(({ key }) => key), ['flirt', 'develop']);
  const conflict = outlookOf(timeline(Array(9).fill(10)), { ...cues, tone: [...cues.tone, { key: 'directInsult', n: 1 }] }, scores, { judgedCount: 30 });
  assert.deepEqual(conflict.scenes, []);
  assert.deepEqual(outlookOf(null, cues, scores, { raw: true, judgedCount: 30 }).scenes, []);
  assert.deepEqual(outlookOf(null, cues, scores, { judgedCount: 5 }).scenes, []);
});

test('each language labels measured forecast, uncertain scenes and method separately', () => {
  const keys = (value) => [...String(value).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const locale of [de, en, fr, es]) {
    assert.ok(locale.outlook.title && locale.outlook.disclaimer && locale.outlook.method.length > 200);
    for (const type of ['flirt', 'quiet', 'develop']) {
      assert.ok(locale.outlook.scenes[type].title && locale.outlook.scenes[type].body);
      assert.deepEqual(keys(locale.outlook.scenes[type].body), keys(en.outlook.scenes[type].body));
    }
    for (const path of ['ready', 'test', 'short', 'weak', 'empty']) {
      assert.ok(locale.outlook.forecast[path]);
      assert.deepEqual(keys(locale.outlook.forecast[path]), keys(en.outlook.forecast[path]));
    }
  }
});
