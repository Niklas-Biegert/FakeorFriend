// Served in place of js/jev.js only by scripts/preview-server.mjs.
// Never used by the normal site. No fetch, key storage or external request.
import { SAMPLE_CHAT } from '../js/sample.js';
import { parseChat } from '../js/parse.js';

const sampleMessages = parseChat(SAMPLE_CHAT).map(({ author, text }) => ({ from: author, text }));
function isExactSample(state) {
  const messages = state?.messages;
  return Array.isArray(messages) && messages.length === sampleMessages.length
    && messages.every((message, index) => message.from === sampleMessages[index].from
      && message.text === sampleMessages[index].text);
}

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

  // These are explicitly scripted demonstration scores for our own fictional
  // sample, never a model's assessment. Other chats stay on the neutral mock.
  const demo = isExactSample(body.state);
  const demoScores = { warmth: 3, reciprocity: 3, tension: 0, clarity: 2 };
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
      answers[id] = { score: demo ? demoScores[id] ?? 1 : 1,
        legend: { 0: '', 1: '', 2: '', 3: '' } };
    } else if (question.type === 'noul') {
      answers[id] = { noul: 0.4 };
    } else {
      throw new Error(`Unknown local test question type: ${question.type}`);
    }
  }
  return { answers, model: demo ? 'Local preview · scripted fictional sample (no Jev)' : 'Local preview · generic mock (no Jev)', usage: { cost: 0 } };
}
