import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shareHighlights } from '../js/card-data.js';
import { flagScores } from '../js/verdict.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { languages: ['de-DE'] } });
const { cardPreviewLines, defaultNames, shownCardName } = await import('../js/card.js');

test('share highlights include at most two numeric values with adequate samples', () => {
  const counts = {
    reply: { median: 12 * 60_000, n: 5 },
    textLength: { medianChars: 24, maxChars: 72, n: 8 },
    text: 'private chat message',
  };
  assert.deepEqual(shareHighlights(counts), [
    { key: 'reply', median: 12 * 60_000, n: 5 },
    { key: 'chars', median: 24, n: 8 },
  ]);
  assert.deepEqual(shareHighlights({ reply: { median: 42, n: 2 }, textLength: null }), []);
  assert.deepEqual(shareHighlights(null), []);
});

test('green and red play scores are bounded complements', () => {
  assert.deepEqual(flagScores(0), { red: 0, green: 100 });
  assert.deepEqual(flagScores(43), { red: 43, green: 57 });
  assert.deepEqual(flagScores(100), { red: 100, green: 0 });
  assert.deepEqual(flagScores(130), { red: 100, green: 0 });
});

test('preview keeps names editable and omits phone numbers, raw text and missing stats', () => {
  const number = '+49 151 12345678';
  const defaults = defaultNames(['Ana Very Long Family Name', number]);
  assert.deepEqual(defaults, ['Ana', 'Unbekannte Nummer 1']);
  const shown = new Map([['Ana Very Long Family Name', 'Ana'], [number, 'Unbekannte Nummer 1']]);
  const people = [
    { name: 'Ana Very Long Family Name', flags: flagScores(35), highlights: [
      { key: 'reply', median: 12 * 60_000, n: 5 }, { key: 'chars', median: 24, n: 8 },
    ] },
    { name: number, flags: flagScores(70), highlights: [] },
  ];
  const lines = cardPreviewLines({ people }, (name) => shownCardName(shown, name));
  assert.equal(lines.length, 2);
  assert.match(lines[0], /Ana.*12.*n = 5.*24.*n = 8/);
  assert.match(lines[1], /Unbekannte Nummer 1/);
  assert.doesNotMatch(lines.join(' '), /151|Family|private chat/);
  shown.set(number, '   ');
  assert.equal(shownCardName(shown, number), 'Anonym');
});

test('partner preview shows its context without changing group preview or exposing chat text', () => {
  const people = [{ name: 'Ana', flags: flagScores(40), highlights: [] },
    { name: 'Ben', flags: flagScores(60), highlights: [] }];
  const display = (name) => name;
  const group = cardPreviewLines({ people, mode: 'group' }, display);
  const partner = cardPreviewLines({ people, mode: 'partner' }, display);
  assert.equal(group.length, 2);
  assert.equal(partner.length, 3);
  assert.match(partner[0], /Partnerchat/);
  assert.deepEqual(partner.slice(1), group);
});
