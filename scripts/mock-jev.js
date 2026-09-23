// Served in place of js/jev.js only by scripts/preview-server.mjs.
// Never used by the normal site. No fetch, key storage or external request.
export function isApiKey(value) {
  return /^sk-or-[\w-]+$/.test(value);
}

export async function findApiKey() {
  return 'sk-or-preview-only';
}

export function rememberApiKey() {}
export function forgetApiKey() {}

export async function askJev(_key, body) {
  const counter = typeof document === 'undefined' ? null : document.getElementById('preview-requests');
  if (counter) counter.textContent = String(Number(counter.textContent) + 1);

  const answers = {};
  for (const [id, question] of Object.entries(body.questions)) {
    if (question.type === 'choice') {
      const options = Object.keys(question.criteria);
      const subjectIndex = Number(id.match(/^p(\d+)_type$/)?.[1] ?? 0);
      const choice = options[subjectIndex % options.length];
      answers[id] = {
        choice,
        confidence: 0.8,
        probabilities: Object.fromEntries(options.map((value) => [value, value === choice ? 0.8 : 0.2 / (options.length - 1)])),
      };
    } else if (question.type === 'score') {
      answers[id] = { score: 1, confidence: 0.8, legend: { 0: '', 1: '', 2: '', 3: '' } };
    } else if (question.type === 'noul') {
      answers[id] = { noul: 0.4 };
    } else {
      throw new Error(`Unknown local test question type: ${question.type}`);
    }
  }
  return { answers, model: 'Local preview (no Jev)', usage: { cost: 0 } };
}
