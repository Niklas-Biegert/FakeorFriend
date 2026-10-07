import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interactionLabel } from '../js/verdict.js';
const sample = (warmth, reciprocity, tension, clarity = 2) => Object.fromEntries(
  Object.entries({ warmth, reciprocity, tension, clarity }).map(([key, score]) => [key, { score }]),
);
test('peaceful chat gets no forced suspect or conflict', () => {
  assert.equal(interactionLabel(sample(3, 3, 0)), 'friendly');
  assert.equal(interactionLabel(sample(0, 2, 0)), 'mixed');
});
test('explicit repeated friction may be described in this excerpt only', () => {
  assert.equal(interactionLabel(sample(1, 1, 2)), 'strained');
  assert.equal(interactionLabel(sample(2, 2, 2)), 'mixed');
});
test('raw transcripts and missing scores receive no overall label', () => {
  assert.equal(interactionLabel(sample(3, 3, 0), { raw: true }), 'uncertain');
  assert.equal(interactionLabel({ warmth: { score: 3 } }), 'uncertain');
});
