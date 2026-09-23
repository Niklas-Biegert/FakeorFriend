import { test } from 'node:test';
import assert from 'node:assert/strict';

// i18n picks a language when imported, as it does in the browser.
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { languages: ['en-US'] } });
const { setLanguage } = await import('../js/i18n.js');
const { statisticNotes, textLengthPresentation } = await import('../js/presentation.js');

test('result text lengths show both values and the observed sample in every language', () => {
  const counts = { messages: 3, textLength: { medianChars: 12, maxChars: 42, n: 3 } };
  for (const code of ['en', 'de', 'fr', 'es']) {
    setLanguage(code);
    const display = textLengthPresentation(counts);
    assert.match(display.median, /12/);
    assert.match(display.longest, /42/);
    assert.match(display.sample, /n = 3/);
    assert.equal(display.note, null);
  }
});

test('short samples show no inferred length and explain why', () => {
  setLanguage('de');
  const display = textLengthPresentation({ messages: 2, textLength: null });
  assert.equal(display.median, '–');
  assert.equal(display.longest, '–');
  assert.match(display.sample, /n = 2/);
  assert.match(display.note, /Weniger als 3/);
});

test('statistic notes use only valid lengths and replies, and never chat text', () => {
  setLanguage('de');
  const stats = new Map([
    ['Ana', { textLength: { medianChars: 12, maxChars: 42, n: 4 }, reply: { median: 12 * 60_000, n: 3 } }],
    ['Ben', { textLength: { medianChars: 8, maxChars: 25, n: 3 }, reply: null }],
    ['Excluded', { textLength: { medianChars: 100, maxChars: 999, n: 6 }, reply: null }],
  ]);
  const ana = statisticNotes(stats, ['Ana', 'Ben'], 'Ana');
  assert.equal(ana.length, 3);
  assert.match(ana[1], /Ana.*42 Zeichen/);
  assert.match(ana[2], /12 Min|12 min/i);
  assert.match(ana[2], /n = 3/);
  assert.equal(statisticNotes(stats, ['Ana', 'Ben'], 'Ben').length, 2);
  assert.ok(!ana.join(' ').includes('999'));
});

test('ties, one contender and insufficient samples never award a comparison', () => {
  setLanguage('de');
  const stats = new Map([
    ['Ana', { textLength: { medianChars: 8, maxChars: 42, n: 4 }, reply: null }],
    ['Ben', { textLength: { medianChars: 7, maxChars: 42, n: 4 }, reply: null }],
    ['Cy', { textLength: null, reply: null }],
  ]);
  assert.match(statisticNotes(stats, ['Ana', 'Ben'], 'Ana')[1], /Die längste einzelne Nachricht/);
  assert.match(statisticNotes(stats, ['Ana'], 'Ana')[1], /Die längste einzelne Nachricht/);
  assert.deepEqual(statisticNotes(stats, ['Ana', 'Cy'], 'Cy'), []);
  assert.deepEqual(statisticNotes(null, ['Ana'], 'Ana'), []);
});
