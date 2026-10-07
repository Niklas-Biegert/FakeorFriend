import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRequest, canJudgeSubjects, hasEnoughMessages, DIMENSIONS } from '../js/questions.js';
import { parseChat, participantsOf } from '../js/parse.js';
import en from '../js/locales/en.js';
import de from '../js/locales/de.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

const pair = ['Ana', 'Ben'];
const sample = ['Ana: Hi Ben!', 'Ben: Hey Ana.', 'Ana: How are you?', 'Ben: Good, thanks. You?', 'Ana: Great!', 'Ben: See you soon!'].join('\n');

test('exactly two speakers; excluding a third one is not enough', () => {
  const messages = parseChat(sample);
  assert.deepEqual(participantsOf(messages).map((p) => p.name).sort(), pair);
  assert.equal(canJudgeSubjects(2, 2), true);
  assert.equal(canJudgeSubjects(2, 3), false);
  assert.equal(canJudgeSubjects(1, 2), false);
  assert.equal(canJudgeSubjects(3, 3), false);
  assert.throws(() => buildRequest([...messages, { author: 'Cy', text: 'hello' }], pair), /Third speaker/);
  assert.throws(() => buildRequest(messages, ['Ana', 'Ana']), /two people/i);
});

test('too few messages and recent excerpts that exclude a speaker stay ineligible', () => {
  const messages = parseChat(sample);
  const whole = buildRequest(messages, pair);
  assert.equal(hasEnoughMessages(whole.body.state.messages, pair), true);
  const tail = buildRequest(messages, pair, 80);
  assert.equal(hasEnoughMessages(tail.body.state.messages, pair), false);
  assert.equal(hasEnoughMessages([{ from: 'Ana', text: 'hi' }], pair), false);
});

test('one set of four interaction questions with no forced culprit, types or personality probability', () => {
  const questions = buildRequest(parseChat(sample), pair).body.questions;
  assert.deepEqual(Object.keys(questions), DIMENSIONS);
  for (const question of Object.values(questions)) {
    assert.equal(question.type, 'score');
    assert.equal(question.criteria.length, 4);
  }
  assert.doesNotMatch(JSON.stringify(questions), /culprit|toxic|personality|diagnos/i);
});

test('raw text requires exactly two supplied names but cannot verify speakers', () => {
  const raw = 'Unrecognised format — Ana and Ben talked';
  assert.deepEqual(buildRequest(raw, pair).body.state, { participants: pair, transcript: raw });
  assert.throws(() => buildRequest(raw, ['Ana', 'Ben', 'Cy']), RangeError);
});

test('pair guidance and result copy exist in four languages; no mode selector or group hero', async () => {
  for (const [code, locale] of Object.entries({ en, de, fr, es })) {
    assert.ok(locale.pairHint && locale.connection.uncertain && locale.connection.rawNote, code);
    assert.equal(Object.keys(locale.traits).length, DIMENSIONS.length);
    assert.ok(locale.levels.warmth.length === 4, code);
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /id="chat-mode"|Prime suspect|group chat|id="suspect-name"/i);
  assert.match(html, /id="connection-label"/);
});
