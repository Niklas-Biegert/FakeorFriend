export const MODEL = '~typesafe/jev-latest';
// State only contains sender and text; timestamps and locally calculated
// statistics never enter Jev's request. Allow room for the longest question.
export const STATE_TOKEN_BUDGET = 29_000;
const utf8 = new TextEncoder();
const estimateTokens = (value) => utf8.encode(JSON.stringify(value)).length / 2;
export const MIN_MESSAGES_PER_PERSON = 3;

/** Every recognised participant must be one of the two being analysed. */
export function canJudgeSubjects(selected, total) {
  return selected === 2 && total === 2;
}

/** Enough evidence for the two people in the part actually sent to Jev. */
export function hasEnoughMessages(messages, subjects) {
  return subjects.length === 2 && subjects.every((name) =>
    messages.filter((message) => message.from === name && typeof message.text === 'string' && message.text.trim()).length >= MIN_MESSAGES_PER_PERSON,
  );
}

// Jev returns structured scores only. The UI derives a cautious interaction
// label from these values. The questions describe this excerpt, not a person's
// character or the nature of the relationship outside the messages.
export const DIMENSIONS = ['warmth', 'reciprocity', 'tension', 'clarity'];
const QUESTIONS = {
  warmth: {
    type: 'score',
    instructions: 'How much mutual kindness and supportive language appears in these two people’s messages? Assess the exchange shown only. Brief practical messages are neutral, not hostile.',
    criteria: ['No clear warmth in this excerpt', 'Occasional friendly words', 'Repeated mutual friendliness', 'Strong, sustained mutual support'],
  },
  reciprocity: {
    type: 'score',
    instructions: 'How often do both people respond to each other’s ideas and questions in the messages shown? Short relevant answers count as engagement; unequal message lengths alone do not mean one person cares less.',
    criteria: ['Little observable back-and-forth', 'Some exchange but often one-sided', 'Regular back-and-forth', 'Both repeatedly build on each other'],
  },
  tension: {
    type: 'score',
    instructions: 'How much explicit tension or recurring friction appears between these two people in the messages shown? Neutral planning, delays and jokes without an argument are not signs of conflict.',
    criteria: ['No visible tension', 'A single mild disagreement', 'Repeated friction', 'Repeated, clearly hostile exchanges'],
  },
  clarity: {
    type: 'score',
    instructions: 'How clearly do the two people communicate their requests and responses in this excerpt? Do not treat brevity or colloquial language as a defect.',
    criteria: ['Repeated unclear exchanges', 'Some ambiguity', 'Mostly understandable', 'Consistently clear to each other'],
  },
};

function newestWithinBudget(messages, budget) {
  const kept = [];
  let tokens = estimateTokens({ messages: [] });
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = { from: messages[i].author, text: messages[i].text };
    tokens += estimateTokens(message) + 1;
    if (tokens > budget) break;
    kept.unshift(message);
  }
  return kept;
}

function tailWithinBudget(transcript, participants, budget) {
  let tail = transcript;
  let tokens = estimateTokens({ participants, transcript: tail });
  while (tokens > budget) {
    if (!tail) throw new RangeError('Transcript cannot fit the state budget');
    tail = tail.slice(Math.ceil(tail.length * (1 - (0.98 * budget) / tokens)));
    tokens = estimateTokens({ participants, transcript: tail });
  }
  return tail;
}

/** Exactly one Jev request for a two-person exchange, with bounded state. */
export function buildRequest(chat, subjects, budget = STATE_TOKEN_BUDGET) {
  if (subjects.length !== 2 || new Set(subjects).size !== 2) throw new RangeError('Exactly two people required');
  if (typeof chat === 'string') {
    const transcript = tailWithinBudget(chat, subjects, budget);
    return {
      judgedCount: null,
      truncated: transcript.length < chat.length,
      body: { model: MODEL, state: { participants: subjects, transcript }, questions: QUESTIONS },
    };
  }
  if (chat.some((message) => !subjects.includes(message.author))) throw new RangeError('Third speaker in chat');
  const messages = newestWithinBudget(chat, budget);
  return {
    judgedCount: messages.length,
    truncated: messages.length < chat.length,
    body: { model: MODEL, state: { messages }, questions: QUESTIONS },
  };
}

export function readVerdicts(answers) {
  if (!answers || DIMENSIONS.some((key) => !Number.isFinite(answers[key]?.score)
    || answers[key].score < 0 || answers[key].score > 3)) {
    throw new Error('Jev returned incomplete interaction scores');
  }
  return Object.fromEntries(DIMENSIONS.map((key) => [key, answers[key]]));
}
