import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewServer } from '../scripts/preview-server.mjs';
import { askJev, findApiKey } from '../scripts/mock-jev.js';
import { buildRequest, CHAT_MODES, STATE_TOKEN_BUDGET } from '../js/questions.js';

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
    assert.equal((await fetch(`${base}/../README.md`)).status, 404);
    assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('mock verdict supports both modes and needs no real key or network call', async () => {
  const network = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('No network in preview mock'); };
  try {
    assert.equal(await findApiKey(), 'sk-or-preview-only');
    for (const mode of [CHAT_MODES.GROUP, CHAT_MODES.PARTNER]) {
      const request = buildRequest([{ author: 'Ana', text: 'hello' }, { author: 'Ben', text: 'hi' }], ['Ana', 'Ben'], STATE_TOKEN_BUDGET, mode);
      const result = await askJev('sk-or-preview-only', request.body);
      assert.equal(result.answers.culprit.choice, 'Ana');
      assert.ok(result.answers.p1_type.probabilities);
      assert.equal(result.answers.p0_main_character.legend[3], '');
      assert.equal(result.answers.p0_started_it.noul, 0.4);
    }
  } finally {
    globalThis.fetch = network;
  }
});
