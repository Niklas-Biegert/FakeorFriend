import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { languages: ['de-DE'] } });
const { cardCopy, cardPreviewLines, defaultNames, shownCardName, drawCard } = await import('../js/card.js');

function painted(verdict, name) {
  const lines = [];
  const ctx = new Proxy({
    createLinearGradient: () => ({ addColorStop() {} }),
    measureText: (value) => ({ width: [...value].length * 11 }),
    fillText: (value) => lines.push(value),
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  drawCard({ getContext: () => ctx }, verdict, name);
  return lines.join(' ');
}

test('phone numbers and unedited family names do not enter a minimal share preview', () => {
  const names = ['Ana Very Long Family Name', '+49 151 12345678'];
  const defaults = defaultNames(names);
  assert.deepEqual(defaults, ['Ana', 'Unbekannte Nummer 1']);
  const shown = new Map(names.map((name, i) => [name, defaults[i]]));
  const verdict = { story: 'uncertain', people: names.map((name) => ({ name,
    highlights: [{ key: 'chars', median: 900, n: 12 }] })), transcript: 'private chat quote' };
  const name = (original) => shownCardName(shown, original);
  const lines = cardPreviewLines(verdict, name);
  assert.equal(lines.length, 3);
  assert.match(lines[1], /Ana.*Überraschungssticker/);
  assert.match(lines[2], /Unbekannte Nummer 1/);
  assert.doesNotMatch(lines.join(' '), /151|Family|private chat|900/);
  assert.doesNotMatch(painted(verdict, name), /151|Family|private chat|900/);
  shown.set(names[1], '   ');
  assert.equal(shownCardName(shown, names[1]), 'Anonym');
});

test('card shares two animals, an edited-name vibe and exactly one local moment', () => {
  const names = ['A Very Long Original Name', '+49 151 12345678'];
  const shown = new Map([[names[0], 'Mara'], [names[1], 'Geheimer Igel']]);
  const verdict = { story: 'warm', animals: [{ key: 'mouse', value: 4, n: 20 }, { key: 'mouse', value: 5, n: 24 }],
    moment: { key: 'starter', winner: names[0], count: 7, of: 10 },
    people: names.map((name) => ({ name, highlights: [{ key: 'chars', median: 999, n: 20 }] })),
    timeFact: { activeDays: 8, totalDays: 14 }, storyVars: { warmth: 3, reciprocity: 2, n: 44 },
    transcript: '[01.09.2026] private conversation' };
  const name = (original) => shownCardName(shown, original);
  const copy = cardCopy(verdict, name);
  const preview = cardPreviewLines(verdict, name);
  assert.equal(copy.people.length, 2);
  assert.equal(preview.length, 4);
  assert.match(preview[0], /freundlich/);
  assert.match(preview[1], /Mara.*Maus.*4.*20/);
  assert.match(preview[2], /Geheimer Igel.*Maus.*5.*24/);
  assert.match(preview[3], /Mara.*7.*10/);
  const png = painted(verdict, name);
  for (const text of ['Mara', 'Geheimer Igel', 'Maus', '4', '20', '5', '24', '7', '10', 'freundlich'])
    assert.ok(preview.join(' ').includes(text) && png.includes(text), text);
  assert.doesNotMatch(preview.join(' ') + png, /151|Original|private conversation|01\.09|999|8.*14|3\/3/);
  shown.set(names[0], 'Neuer Spitzname');
  assert.match(cardPreviewLines(verdict, name)[3], /Neuer Spitzname/);
  assert.match(painted(verdict, name), /Neuer Spitzname/);
});

test('edited long display names wrap on PNG without replacing their full text', () => {
  const edited = 'Alexandra Sonnenschein Wunderbar';
  const verdict = { story: 'everyday', people: [{ name: 'Original', highlights: [] }, { name: 'Friend', highlights: [] }] };
  const name = (original) => original === 'Original' ? edited : original;
  const copy = cardCopy(verdict, name);
  assert.equal(copy.people[0].name, edited);
  assert.match(cardPreviewLines(verdict, name)[1], /Alexandra Sonnenschein Wunderbar/);
  const png = painted(verdict, name);
  for (const word of edited.split(' ')) assert.match(png, new RegExp(word));
});

test('only a chosen reply comparison appears; no raw dates, extra statistics or speculative future card', () => {
  const verdict = { story: 'uncertain', scope: { judged: 210, total: 800 },
    people: [{ name: 'Mara', highlights: [] }, { name: 'Leo', highlights: [] }],
    moment: { key: 'reply', winner: 'Mara', median: 4 * 60_000, n: 7, otherMedian: 14 * 60_000, otherN: 8 },
    timeFact: { activeDays: 8, totalDays: 14 }, transcript: '[01.09.2026] private chat' };
  const preview = cardPreviewLines(verdict, (name) => name);
  const png = painted(verdict, (name) => name);
  assert.equal(preview.length, 5);
  assert.match(preview[3], /Mara.*4.*7.*14.*8/);
  assert.match(preview[4], /210.*800/);
  assert.match(png, /210.*800/);
  for (const text of ['Mara', '4 Min.', '14 Min.']) assert.ok(preview.join(' ').includes(text) && png.includes(text));
  assert.doesNotMatch(preview.join(' ') + png, /01\.09|private chat|Aktiv an 8|forecast|Zukunft/);
});

test('decoded local animal artwork can be drawn into PNG instead of substitute glyphs', async () => {
  const verdict = { story: 'warm', people: [{ name: 'Mara' }, { name: 'Leo' }],
    animals: [{ key: 'mouse', value: 4, n: 10 }, { key: 'mouse', value: 4, n: 10 }] };
  const pictures = [{ naturalWidth: 240 }, { naturalWidth: 240 }];
  const drawn = [];
  const ctx = new Proxy({ createLinearGradient: () => ({ addColorStop() {} }),
    measureText: (value) => ({ width: value.length * 10 }), drawImage: (...values) => drawn.push(values),
    fillText() {} }, { get: (obj, property) => property in obj ? obj[property] : () => {} });
  drawCard({ getContext: () => ctx }, verdict, (name) => name, pictures);
  assert.equal(drawn.length, 2);
  assert.equal(drawn[0][0], pictures[0]);
  assert.equal(drawn[1][0], pictures[1]);
  const svg = await readFile(new URL('../img/animals/mouse.svg', import.meta.url), 'utf8');
  assert.match(svg, /viewBox="0 0 240 240"/);
});
