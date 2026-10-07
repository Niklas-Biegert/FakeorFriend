import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { animalDuo, duoStory, ANIMALS } from '../js/animals.js';
import { parseChat } from '../js/parse.js';
import { SAMPLE_CHAT } from '../js/sample.js';
import { chatStats } from '../js/stats.js';
import de from '../js/locales/de.js';
import en from '../js/locales/en.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

const people = ['Mara', 'Leo'];
const stats = (wordsA, wordsB, startsA = 1, startsB = 1, of = 3) => new Map([
  ['Mara', { textLength: { medianWords: wordsA, n: 4 }, starts: { count: startsA, of } }],
  ['Leo', { textLength: { medianWords: wordsB, n: 4 }, starts: { count: startsB, of } }],
]);
const scores = (warmth, reciprocity, tension, clarity) => Object.fromEntries(
  Object.entries({ warmth, reciprocity, tension, clarity }).map(([key, score]) => [key, { score }]));

test('sticker rules need a valid sample; short, long and clear starter lead have distinct rules', () => {
  assert.deepEqual(animalDuo(stats(4, 18), people).map((a) => a.key), ['mouse', 'hedgehog']);
  assert.deepEqual(animalDuo(stats(9, 9), people).map((a) => a.key), ['cat', 'cat']);
  assert.deepEqual(animalDuo(stats(4, 18, 2, 1), people).map((a) => a.key), ['dog', 'hedgehog']);
  assert.deepEqual(animalDuo(stats(4, 18, 2, 2), people).map((a) => a.key), ['mouse', 'hedgehog']);
  assert.deepEqual(animalDuo(stats(4, 18, 2, 1, 2), people).map((a) => a.key), ['mouse', 'hedgehog']);
  const small = stats(4, 18); small.get('Leo').textLength.n = 2;
  assert.deepEqual(animalDuo(small, people).map((a) => a.key), ['neutral', 'neutral']);
  assert.deepEqual(animalDuo(stats(4, 18), people, { raw: true }).map((a) => a.key), ['neutral', 'neutral']);
});

test('duo text follows existing scores; raw, invalid and small samples stay neutral', () => {
  assert.equal(duoStory(scores(3, 3, 0, 3), { n: 40 }), 'warm');
  assert.equal(duoStory(scores(3, 2, 2, 3), { n: 40 }), 'friction');
  assert.equal(duoStory(scores(1, 1, 0, 0), { n: 40 }), 'clarify');
  assert.equal(duoStory(scores(1, 1, 1, 3), { n: 40 }), 'everyday');
  assert.equal(duoStory(scores(3, 3, 0, 3), { n: 40, raw: true }), 'uncertain');
  assert.equal(duoStory(scores(3, 3, 0, 3), { n: 5 }), 'uncertain');
  assert.equal(duoStory(scores(3, 3, 0, NaN), { n: 40 }), 'uncertain');
});

test('late written hours and reply gaps require sufficient local observations', () => {
  const both = stats(8, 8);
  both.get('Mara').clock = { late: 5, n: 10 };
  both.get('Mara').reply = { median: 2 * 60_000, n: 10 };
  both.get('Leo').reply = { median: 31 * 60_000, n: 5 };
  assert.deepEqual(animalDuo(both, people).map(({ key }) => key), ['owl', 'tortoise']);
  both.get('Mara').clock.n = 9;
  assert.equal(animalDuo(both, people)[0].key, 'rabbit');
  both.get('Mara').reply.n = 4;
  assert.equal(animalDuo(both, people)[0].key, 'cat');
  both.get('Leo').reply.median = 20 * 60_000;
  assert.equal(animalDuo(both, people)[1].key, 'cat');
  assert.deepEqual(animalDuo(stats(9, 9, 1, 1), people).map(({ key }) => key), ['cat', 'cat']);
});

test('fictional sample yields two stickers; every language explains every sticker', async () => {
  const stickers = animalDuo(chatStats(parseChat(SAMPLE_CHAT)), people);
  assert.equal(stickers.length, 2);
  assert.ok(stickers.every(({ key }) => key !== 'neutral'));
  for (const animal of ANIMALS) {
    const svg = await readFile(new URL(`../img/animals/${animal}.svg`, import.meta.url), 'utf8');
    assert.match(svg, /<svg[^>]*viewBox=/);
    assert.doesNotMatch(svg, /<script|<image|<foreignObject|href=/i);
    for (const locale of [de, en, fr, es]) {
      assert.ok(locale.animals[animal].name && locale.animals[animal].why);
    }
  }
  for (const locale of [de, en, fr, es]) for (const key of ['warm','friction','clarify','everyday','uncertain']) {
    assert.ok(locale.story[key].title && locale.story[key].body && locale.cardStory[key]);
  }
});
