import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { vibePoint, messageBalance, conversationIdea, VIBE_KEYS } from '../js/vibes.js';
import en from '../js/locales/en.js';
import de from '../js/locales/de.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';
const answers = (warmth, tension, reciprocity = 2, clarity = 2) => ({
  warmth: { score: warmth }, tension: { score: tension }, reciprocity: { score: reciprocity }, clarity: { score: clarity },
});
test('map uses the two displayed ordinal scores, not a personality probability', () => {
  assert.deepEqual(vibePoint(answers(3, 0)), { x: 1, y: 0 });
  assert.deepEqual(vibePoint(answers(0, 3)), { x: 0, y: 1 });
  assert.equal(vibePoint(answers(2, 1), true), null);
  assert.equal(vibePoint(answers(8, 1)), null);
});
test('message balance counts the two speakers without interpreting unequal lengths or frequency', () => {
  const stats = new Map([['Ana', { messages: 4, text: 'private' }], ['Ben', { messages: 6 }]]);
  assert.deepEqual(messageBalance(stats, ['Ana', 'Ben']), { counts: [4, 6], total: 10, shares: [0.4, 0.6] });
  assert.equal(messageBalance(stats, ['Ana', 'Ben', 'Cy']), null);
  assert.equal(messageBalance(null, ['Ana', 'Ben']), null);
  assert.equal(messageBalance(new Map([['Ana', { messages: 0 }], ['Ben', { messages: 0 }]]), ['Ana', 'Ben']), null);
});
test('small quests are supportive and raw excerpts avoid a false inferred relationship', () => {
  assert.equal(conversationIdea(answers(3, 0)), 'appreciate');
  assert.equal(conversationIdea(answers(1, 2)), 'pause');
  assert.equal(conversationIdea(answers(1, 0, 2, 0)), 'clarify');
  assert.equal(conversationIdea(answers(3, 0), true), 'open');
});
test('all four labels have original illustrations and all locales explain the map', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="vibe-map"[^>]*role="img"/);
  assert.match(html, /id="card-canvas"/);
  for (const label of VIBE_KEYS) {
    const svg = await readFile(new URL(`../img/vibes/${label}.svg`, import.meta.url), 'utf8');
    assert.match(svg, /<svg[^>]*viewBox=/);
    assert.doesNotMatch(svg, /<script|<image|<foreignObject|href=/i);
  }
  for (const locale of [en, de, fr, es]) {
    assert.match(locale.visual.methodIntro, /[.!]/);
    assert.ok(locale.visual.mapAccessible.includes('{warmth}') && locale.visual.mapAccessible.includes('{tension}'));
    assert.ok(locale.youthNotice && locale.ideas.pause && locale.visual.sample.includes('{n}'));
  }
});
