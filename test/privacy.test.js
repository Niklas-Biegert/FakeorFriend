import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRequest } from '../js/questions.js';
import { findApiKey, forgetApiKey, rememberApiKey } from '../js/jev.js';

test('parsed verdict requests contain message text and sender, without local metadata', () => {
  const request = buildRequest([
    { author: 'Ana', text: 'first', timestamp: 1, privateNote: 'local only' },
    { author: 'Ben', text: 'second', timestamp: 2, privateNote: 'also local' },
  ], ['Ana', 'Ben']);
  assert.deepEqual(request.body.state, { messages: [
    { from: 'Ana', text: 'first' }, { from: 'Ben', text: 'second' },
  ] });
  assert.doesNotMatch(JSON.stringify(request.body), /local only|also local|timestamp/);
});

test('unrecognised transcripts send the raw excerpt with names, including raw dates', () => {
  const raw = '22.09.2026, 22:30 - Ana: private text';
  const request = buildRequest(raw, ['Ana', 'Ben']);
  assert.deepEqual(request.body.state, { participants: ['Ana', 'Ben'], transcript: raw });
  assert.equal(request.judgedCount, null);
  const long = buildRequest('old private details '.repeat(100) + raw, ['Ana', 'Ben'], 110);
  assert.equal(long.truncated, true);
  assert.ok(long.body.state.transcript.endsWith(raw));
});

test('delete personal key removes only its browser storage entry', async () => {
  const values = new Map([['judgeyou.language', 'de']]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  rememberApiKey('sk-or-personal');
  assert.equal(await findApiKey(), 'sk-or-personal');
  forgetApiKey();
  assert.equal(values.has('judgeyou.openrouterKey'), false);
  assert.equal(values.get('judgeyou.language'), 'de');
});

test('the raw disclosure and personal key deletion are visible around the judge action', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('id="raw-notice"') < html.indexOf('id="judge"'));
  assert.match(html, /id="raw-notice"[^>]*hidden/);
  assert.match(html, /id="clear-key"[^>]*data-i18n="clearKey"/);
  assert.ok(html.indexOf('id="clear-key"') > html.indexOf('</form>', html.indexOf('id="key-form"')));
});
