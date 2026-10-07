import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSound } from '../js/sound.js';

test('mute prevents context creation; one enabled click plays a quiet bounded cue', () => {
  let created = 0;
  const values = [];
  class FakeContext {
    constructor() { created++; this.currentTime = 10; this.destination = {}; }
    createOscillator() { return { frequency: {}, connect() {}, start(at) { values.push(['start', at]); }, stop(at) { values.push(['stop', at]); } }; }
    createGain() { return { gain: { setValueAtTime(value) { values.push(['gain', value]); }, linearRampToValueAtTime(value) { values.push(['gain', value]); }, exponentialRampToValueAtTime(value) { values.push(['gain', value]); } }, connect() {} }; }
  }
  const sound = createSound({ AudioContextClass: FakeContext });
  assert.equal(sound.toggle(), false);
  assert.equal(sound.play(), false);
  assert.equal(created, 0);
  assert.equal(sound.toggle(), true);
  assert.equal(sound.play(), true);
  assert.equal(created, 1);
  assert.equal(values.filter(([type]) => type === 'start').length, 2);
  assert.ok(values.filter(([type]) => type === 'gain').every(([, value]) => value <= .035));
  assert.ok(values.filter(([type]) => type === 'stop').every(([, time]) => time <= 10.24));
  assert.equal(sound.play(), true);
  assert.equal(created, 1);
});
