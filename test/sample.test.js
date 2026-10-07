import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_CHAT } from '../js/sample.js';
import { parseChat, participantsOf } from '../js/parse.js';
import { chatStats } from '../js/stats.js';
import { buildRequest, hasEnoughMessages, STATE_TOKEN_BUDGET } from '../js/questions.js';
import { messageBalance } from '../js/vibes.js';
import en from '../js/locales/en.js';
import de from '../js/locales/de.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

test('fictional sample is an eligible two-person chat with local length and reply statistics', () => {
  const messages = parseChat(SAMPLE_CHAT);
  const people = participantsOf(messages).map(({ name }) => name);
  assert.equal(messages.length, 400);
  assert.equal(new Set(messages.map(({ text }) => text)).size, 400);
  assert.deepEqual(people.sort(), ['Leo', 'Mara']);
  assert.ok(messages.every(({ at }) => at !== null));
  assert.ok(messages.every((message, i) => i === 0 || message.at >= messages[i - 1].at));
  const stats = chatStats(messages);
  for (const person of people) {
    assert.ok(stats.get(person).messages >= 150);
    assert.ok(stats.get(person).textLength?.n >= 3);
    assert.ok(stats.get(person).reply?.n >= 3);
  }
  assert.equal(messageBalance(stats, people).total, 400);
  const { body, judgedCount, truncated } = buildRequest(messages, people, STATE_TOKEN_BUDGET);
  assert.ok(hasEnoughMessages(body.state.messages, people));
  assert.equal(judgedCount, body.state.messages.length);
  assert.equal(judgedCount, 400, 'this sample fits; importing a longer chat may still truncate');
  assert.equal(truncated, false);
  assert.ok(messages.at(-1).at - messages[0].at > 200 * 24 * 60 * 60 * 1000);
  assert.doesNotMatch(SAMPLE_CHAT, /\+\d{8,}|@\w+\.\w+/);
});

test('longer chats retain only the newest portion for Jev; local stats still see every message', () => {
  const original = parseChat(SAMPLE_CHAT);
  const long = [...original, ...original.map((entry, i) => ({ ...entry, text: `${entry.text} Ergänzung ${i}` }))];
  const { body, judgedCount, truncated } = buildRequest(long, ['Mara', 'Leo'], STATE_TOKEN_BUDGET);
  assert.equal(truncated, true);
  assert.ok(judgedCount < long.length);
  assert.deepEqual(body.state.messages.at(-1), { from: long.at(-1).author, text: long.at(-1).text });
  assert.equal(chatStats(long).get('Mara').messages + chatStats(long).get('Leo').messages, 800);
  assert.deepEqual(Object.keys(body.state), ['messages']);
});

test('all languages explain the visual stages and four scales without suggesting a diagnosis', () => {
  for (const locale of [de, en, fr, es]) {
    for (const step of ['stageInput', 'stageResult', 'stageShare']) assert.ok(locale[step].trim());
    assert.match(locale.scaleAccessible, /\{trait\}.*\{score\}.*\{level\}/);
    for (const dimension of ['warmth', 'reciprocity', 'tension', 'clarity']) {
      assert.ok(locale.traitExplainers[dimension].length > 20);
    }
  }
});
