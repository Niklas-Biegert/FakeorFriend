import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewServer } from '../scripts/preview-server.mjs';
import { askJev, findApiKey } from '../scripts/mock-jev.js';
import { buildRequest, STATE_TOKEN_BUDGET } from '../js/questions.js';
import { parseChat } from '../js/parse.js';
import { SAMPLE_CHAT } from '../js/sample.js';
import { duoStory } from '../js/animals.js';

test('browser preview serves mock Jev, blocks deployment key and external connections', async () => {
  const server = createPreviewServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base);
    const html = await page.text();
    assert.match(page.headers.get('content-security-policy'), /connect-src 'none'/);
    assert.match(html, /simulierte Jev-Antworten/);
    assert.doesNotMatch(html, /https:\/\/fonts\.googleapis\.com/);
    const mock = await (await fetch(`${base}/js/jev.js`)).text();
    assert.match(mock, /sk-or-preview-only/);
    assert.doesNotMatch(mock, /fetch\(|openrouter\.ai/);
    assert.equal((await fetch(`${base}/js/key.js`)).status, 404);
    const illustration = await fetch(`${base}/img/vibes/friendly.svg`);
    assert.equal(illustration.status, 200);
    assert.match(illustration.headers.get('content-type'), /image\/svg\+xml/);
    assert.equal((await fetch(`${base}/../README.md`)).status, 404);
    assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('mock verdict answers every interaction question without using a key or network', async () => {
  const network = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('No network in preview mock'); };
  try {
    assert.equal(await findApiKey(), 'sk-or-preview-only');
    const request = buildRequest([{ author: 'Ana', text: 'hello' }, { author: 'Ben', text: 'hi' }], ['Ana', 'Ben'], STATE_TOKEN_BUDGET);
    const result = await askJev('sk-or-preview-only', request.body);
    assert.deepEqual(Object.keys(result.answers), Object.keys(request.body.questions));
    assert.equal(result.answers.reciprocity.score, 1);
    assert.equal(result.answers.tension.legend[3], '');
  } finally { globalThis.fetch = network; }
});

test('only the exact fictional example receives scripted demo scores; no other chat is evaluated by the mock', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('No network in preview mock'); };
  try {
    const chat = parseChat(SAMPLE_CHAT);
    const request = buildRequest(chat, ['Mara', 'Leo']);
    assert.equal(request.judgedCount, 400);
    const demo = await askJev('sk-or-preview-only', request.body);
    assert.deepEqual(Object.fromEntries(Object.entries(demo.answers).map(([key, value]) => [key, value.score])),
      { warmth: 3, reciprocity: 3, tension: 0, clarity: 2 });
    assert.equal(duoStory(demo.answers, { n: request.judgedCount }), 'warm');
    assert.match(demo.model, /scripted fictional sample/);
    const other = buildRequest(chat.map((message, index) => index === 50
      ? { ...message, text: 'Different invented message' } : message), ['Mara', 'Leo']);
    const generic = await askJev('sk-or-preview-only', other.body);
    assert.equal(generic.answers.warmth.score, 1);
    assert.match(generic.model, /generic mock/);
  } finally { globalThis.fetch = original; }
});
