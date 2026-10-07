import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SAMPLE_CHAT } from '../js/sample.js';
import { parseChat } from '../js/parse.js';
import { chatStats } from '../js/stats.js';
import { chatMoment } from '../js/moment.js';
import de from '../js/locales/de.js';
import en from '../js/locales/en.js';
import fr from '../js/locales/fr.js';
import es from '../js/locales/es.js';

test('three top-level result highlights precede three closed, labelled native details panels', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const first = html.slice(html.indexOf('<section id="results"'), html.indexOf('<div class="explore-details"'));
  const markers = ['id="animal-duo"', 'id="story-body"', 'id="moment-detail"', 'id="share"'];
  for (let i = 1; i < markers.length; i++) assert.ok(first.indexOf(markers[i - 1]) < first.indexOf(markers[i]));
  assert.doesNotMatch(first, /id="connection-scales"|id="timeline-content"|id="person-readings"/);
  for (const id of ['detail-reading', 'detail-charts', 'detail-numbers']) {
    const opening = html.match(new RegExp(`<details[^>]+id="${id}"[^>]*>`))?.[0];
    assert.ok(opening && !/\bopen\b/.test(opening), `${id} starts closed`);
    assert.match(html.slice(html.indexOf(opening), html.indexOf(opening) + 130), /<summary data-i18n="spotlight\./);
  }
  assert.match(html, /id="scope-note"/);
  assert.match(html, /id="card-preview-details"/);
  assert.match(first, /data-i18n="spotlight\.disclaimer"/);
});

test('every language explains the moment, no-data fallback and curated card without identity claims', () => {
  for (const locale of [de, en, fr, es]) {
    for (const key of ['animals', 'vibe', 'moment', 'moreReading', 'moreCharts', 'moreNumbers'])
      assert.ok(locale.spotlight[key]?.trim());
    assert.ok(locale.spotlight.disclaimer?.trim());
    assert.ok(locale.story.warm.body.includes('{warmth}') && locale.story.warm.body.includes('{reciprocity}'));
    for (const key of ['starter', 'reply']) {
      assert.match(locale.moment[key].detail, /\{name\}/);
      assert.match(locale.moment[key].card, /\{name\}/);
    }
    assert.ok(locale.moment.empty.detail.length > 35);
    for (const key of ['warm', 'friction', 'clarify', 'everyday', 'uncertain'])
      assert.ok(locale.cardVibe[key]?.trim());
    assert.doesNotMatch(JSON.stringify(locale.spotlight), /fotzig|toxisch|toxic|sexual/i);
  }
});

test('400-message fictional sample produces a counted single moment from locally parsed data', () => {
  const parsed = parseChat(SAMPLE_CHAT);
  assert.equal(parsed.length, 400);
  assert.deepEqual(chatMoment(chatStats(parsed), ['Mara', 'Leo']),
    { key: 'starter', winner: 'Leo', count: 13, of: 20 });
});

test('main flow retains exactly one Jev call and CSS keeps keyboard and reduced-motion rules', async () => {
  const app = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../css/polish.css', import.meta.url), 'utf8');
  assert.equal([...app.matchAll(/\baskJev\(/g)].length, 1);
  assert.match(css, /\.explore-panel > summary:focus-visible/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
