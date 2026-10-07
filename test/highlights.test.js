import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { highlightCues, TONE_KEYS, TOPIC_KEYS } from '../js/highlights.js';
import { conversationIdea } from '../js/vibes.js';
import { buildRequest } from '../js/questions.js';
import { parseChat } from '../js/parse.js';
import { SAMPLE_CHAT } from '../js/sample.js';
import de from '../js/locales/de.js';
import en from '../js/locales/en.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

const people = ['Mara', 'Leo'];
const m = (from, text) => ({ from, text });

test('fictional sample finds only recurring local cues, without revealing any chat text', () => {
  const messages = parseChat(SAMPLE_CHAT).map(({ author, text }) => m(author, text));
  const result = highlightCues(messages, people);
  assert.equal(result.checked, 400);
  assert.deepEqual(result.topics.map(({ key }) => key).sort(), ['humor', 'plans', 'support']);
  assert.ok(result.topics.every(({ n }) => n >= 3));
  assert.deepEqual(result.tone.map(({ key }) => key), ['thanks']);
  assert.ok(result.tone[0].n >= 3);
  assert.doesNotMatch(JSON.stringify(result), /Tomaten|Basilikum|Mara|Leo/);
  assert.ok(conversationIdea({ tension: { score: 0 }, clarity: { score: 3 }, warmth: { score: 1 } }, false, result.topics.map(({ key }) => key)));
});

test('one-off topic, one speaker and tiny samples cannot make a recurring theme', () => {
  const many = Array.from({ length: 16 }, (_, i) => m(people[i % 2], i === 0 ? 'Samstag treffen?' : 'okay'));
  assert.deepEqual(highlightCues(many, people).topics, []);
  for (const i of [0, 3, 10]) many[i] = m('Mara', 'Samstag treffen?');
  assert.deepEqual(highlightCues(many, people).topics, []);
  many[10] = m('Leo', 'Samstag treffen?');
  assert.deepEqual(highlightCues(many, people).topics, [{ key: 'plans', n: 3 }]);
  assert.deepEqual(highlightCues(many.slice(0, 8), people).topics, []);
});

test('literal tone cues are counted per message; sarcasm, short replies and hints of pressure are not classed as toxicity', () => {
  const messages = [m('Mara', 'Danke. Danke!'), m('Leo', 'Danke!'), m('Mara', 'Du bist blöd'),
    m('Leo', 'wäre blöd gelaufen'), m('Mara', 'Du bist süß'), m('Leo', 'lol du Quatschkopf'),
    m('Mara', 'wenn du nicht antwortest ...'), m('Leo', 'k'), m('Mara', 'Ich liebe dich')];
  const result = highlightCues(messages, people);
  assert.deepEqual(result.tone, [
    { key: 'thanks', n: 2 }, { key: 'directInsult', n: 1 }, { key: 'compliment', n: 1 },
  ]);
  assert.deepEqual(result.topics, []);
  assert.ok(!['toxic', 'flirty', 'pressure'].some((key) => TONE_KEYS.includes(key)));
  assert.deepEqual(highlightCues([m('Mara', '“Du bist blöd” war ein Zitat')], people).tone,
    [{ key: 'directInsult', n: 1 }]); // Even literal cues need human context.
});

test('unrecognised raw formats and third speakers cannot receive counts', () => {
  const data = [m('Mara', 'Danke'), m('Leo', 'Danke')];
  assert.deepEqual(highlightCues(null, people, { raw: true }), { topics: [], tone: [], checked: null });
  assert.equal(highlightCues(data, people, { raw: true }).checked, null);
  assert.equal(highlightCues([...data, m('Dritte', 'Danke')], people).checked, null);
});

test('defined English, French and Spanish phrases are counted without interpreting intent', () => {
  const data = [m('Mara', 'Thank you! You are cute'), m('Leo', 'Merci, tu es adorable'),
    m('Mara', 'Gracias, eres adorable'), m('Leo', 'you are stupid'),
    m('Mara', 'tu es stupide'), m('Leo', 'eres idiota')];
  assert.deepEqual(highlightCues(data, people).tone, [
    { key: 'thanks', n: 3 }, { key: 'directInsult', n: 3 }, { key: 'compliment', n: 3 },
  ]);
  assert.deepEqual(highlightCues([m('Leo', 'du bist nicht dumm')], people).tone, []);
});

test('four languages and the visible result flow have the complete cautions', async () => {
  for (const locale of [de, en, fr, es]) {
    assert.ok(locale.cues.title && locale.cues.noTopics && locale.cues.raw && locale.cues.method);
    assert.ok(locale.cues.coarse.includes('{warmth}') && locale.cues.coarse.includes('{tension}'));
    for (const key of TOPIC_KEYS) assert.ok(locale.cues.topics[key].title && locale.cues.topics[key].detail.includes('{n}'));
    for (const key of TONE_KEYS) assert.ok(locale.cues.tone[key].title && locale.cues.tone[key].detail.includes('{total}'));
    assert.ok(locale.ideas.repair && locale.ideas.plan);
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const source = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.ok(html.indexOf('id="person-readings"') < html.indexOf('id="topic-cards"'));
  assert.ok(html.indexOf('id="topic-cards"') < html.indexOf('id="connection-scales"'));
  assert.ok(source.includes('request.body.state.messages'));
  assert.doesNotMatch(source.slice(source.indexOf("$('share').onclick")), /cues\.topics|cues\.tone/);
});

test('new local cues do not add Jev questions or state metadata', () => {
  const { body } = buildRequest([m('Mara', 'Danke'), m('Leo', 'Sure')].map(({ from, text }) => ({ author: from, text })), people);
  assert.deepEqual(Object.keys(body.questions), ['warmth', 'reciprocity', 'tension', 'clarity']);
  assert.deepEqual(Object.keys(body.state.messages[0]), ['from', 'text']);
  assert.equal(conversationIdea({ tension: { score: 2 }, clarity: { score: 3 } }, false, ['clarify']), 'pause');
  assert.equal(conversationIdea({ tension: { score: 0 }, clarity: { score: 3 }, warmth: { score: 0 } }, false, ['plans']), 'plan');
  assert.equal(conversationIdea({}, true, ['plans']), 'open');
});
