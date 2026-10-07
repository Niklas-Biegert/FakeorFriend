// These four scores describe the submitted excerpt. No forced suspect, game
// percentage or inference about a real relationship/personality is produced.
export function interactionLabel(answers, { raw = false } = {}) {
  if (raw) return 'uncertain'; // We could not verify two authors in raw text.
  const valid = ['warmth', 'reciprocity', 'tension', 'clarity'].every((key) =>
    Number.isFinite(answers?.[key]?.score) && answers[key].score >= 0 && answers[key].score <= 3,
  );
  if (!valid) return 'uncertain';
  if (answers.tension.score >= 2 && answers.warmth.score <= 1) return 'strained';
  if (answers.warmth.score >= 2 && answers.reciprocity.score >= 2 && answers.tension.score <= 1) return 'friendly';
  return 'mixed';
}

export function normalisedScore(answer) {
  return Math.max(0, Math.min(1, answer.score / (Object.keys(answer.legend ?? {}).length - 1 || 3)));
}
