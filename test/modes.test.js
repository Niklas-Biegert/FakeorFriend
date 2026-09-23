import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRequest, canJudgeSubjects, CHAT_MODES, STATE_TOKEN_BUDGET } from '../js/questions.js';
import en from '../js/locales/en.js';
import de from '../js/locales/de.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

const names = ['Ana', 'Ben'];
const chat = [{ author: 'Ana', text: 'hello', at: 1000 }, { author: 'Ben', text: 'hi', at: 2000 }];

test('switching group → partner → group preserves the original group request', () => {
  const original = buildRequest(chat, names);
  const partner = buildRequest(chat, names, STATE_TOKEN_BUDGET, CHAT_MODES.PARTNER);
  const restored = buildRequest(chat, names, STATE_TOKEN_BUDGET, CHAT_MODES.GROUP);

  assert.deepEqual(restored, original);
  assert.equal(original.body.questions.culprit.instructions, 'Who is most responsible for the tension or drama in this chat?');
  assert.match(original.body.questions.p0_type.criteria.mother_hen, /collects money/);
  assert.equal(Object.keys(original.body.questions).length, 17);
  assert.deepEqual(partner.body.state, original.body.state);
  assert.deepEqual(Object.keys(partner.body.questions), Object.keys(original.body.questions));
  assert.notDeepEqual(partner.body.questions, original.body.questions);
});

test('partner questions cover all twelve types and all eight questions with two-person wording', () => {
  const group = buildRequest(chat, names).body.questions;
  const partner = buildRequest(chat, names, STATE_TOKEN_BUDGET, CHAT_MODES.PARTNER).body.questions;
  assert.equal(Object.keys(partner.p0_type.criteria).length, 12);
  assert.deepEqual(Object.keys(partner.p0_type.criteria), Object.keys(group.p0_type.criteria));
  for (const type of Object.keys(group.p0_type.criteria)) {
    assert.notEqual(partner.p0_type.criteria[type], group.p0_type.criteria[type], type);
  }
  for (const key of ['type', 'passive_aggression', 'main_character', 'effort', 'drama', 'started_it', 'leaves_on_read', 'secretly_right']) {
    assert.notEqual(partner[`p0_${key}`].instructions, group[`p0_${key}`].instructions, key);
    assert.match(partner[`p0_${key}`].instructions, /Ana/);
  }
  assert.deepEqual(partner.p0_main_character.criteria, en.partnerLevels.main_character);
  assert.deepEqual(partner.p0_passive_aggression.criteria, en.levels.passive_aggression);
  assert.match(partner.p0_started_it.instructions, /no disagreement/);
  assert.match(partner.p0_leaves_on_read.instructions, /does not show.*read/);
});

test('partner mode requires the entire chat to have exactly two selected speakers', () => {
  assert.equal(canJudgeSubjects(CHAT_MODES.GROUP, 2, 5), true);
  assert.equal(canJudgeSubjects(CHAT_MODES.PARTNER, 2, 2), true);
  assert.equal(canJudgeSubjects(CHAT_MODES.PARTNER, 1, 2), false);
  assert.equal(canJudgeSubjects(CHAT_MODES.PARTNER, 2, 3), false);
  assert.equal(canJudgeSubjects(CHAT_MODES.PARTNER, 3, 3), false);
  assert.throws(() => buildRequest(chat, ['Ana'], STATE_TOKEN_BUDGET, CHAT_MODES.PARTNER), RangeError);
  assert.throws(() => buildRequest(chat, names, STATE_TOKEN_BUDGET, 'invalid'), RangeError);
});

test('partner mode also works with raw transcripts, with no extra state fields', () => {
  const raw = '22.09.2026 - Ana: hi\n22.09.2026 - Ben: hi';
  const group = buildRequest(raw, names).body.state;
  const partner = buildRequest(raw, names, STATE_TOKEN_BUDGET, CHAT_MODES.PARTNER).body.state;
  assert.deepEqual(partner, group);
  assert.deepEqual(Object.keys(partner), ['participants', 'transcript']);
});

test('mode labels and partner scale exist in all languages; mode is visible before and after judging', async () => {
  for (const [code, locale] of Object.entries({ en, de, fr, es })) {
    assert.ok(locale.chatModes.group && locale.chatModes.partner, code);
    assert.equal(locale.partnerLevels.main_character.length, en.partnerLevels.main_character.length, code);
    assert.ok(locale.partnerCaveat && locale.suspectPartner && locale.guiltyPartner, code);
  }
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('id="chat-mode"') < html.indexOf('id="judge"'));
  assert.ok(html.indexOf('id="result-mode"') > html.indexOf('id="results"'));
});
