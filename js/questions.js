import en from './locales/en.js';

export const MODEL = '~typesafe/jev-latest';

// Jev allows 32k tokens for the state plus the longest question. Measured on
// English, German-with-emoji and Japanese chats, one token is ~2.06 UTF-8
// bytes of JSON state, so bytes / 2 slightly overestimates tokens. The budget
// leaves room for the longest question.
export const STATE_TOKEN_BUDGET = 29_000;
const BYTES_PER_TOKEN = 2;
const utf8 = new TextEncoder();

function estimateTokens(value) {
  return utf8.encode(JSON.stringify(value)).length / BYTES_PER_TOKEN;
}

// Each extra person only adds questions, which Jev answers in parallel for
// almost no extra time; the cap keeps the results page readable.
export const MAX_SUBJECTS = 8;
export const CHAT_MODES = Object.freeze({ GROUP: 'group', PARTNER: 'partner' });

/** Partner questions only make sense with exactly two selected speakers. */
export function canJudgeSubjects(mode, count, total = count) {
  return count >= 2 && (mode !== CHAT_MODES.PARTNER || (count === 2 && total === 2));
}

// Option keys match TYPES in presentation.js; the descriptions are what Jev
// actually judges against. Each names a defining excess rather than a common
// behaviour: everyday chats are mostly logistics, and with softer wording
// ("makes plans", "short messages") almost everyone became a Mother Hen or a
// Giga Chad.
const TYPE_CRITERIA = {
  giga_chad: 'Supremely confident and unbothered; blunt one-liners; never explains, apologises or seeks approval',
  golden_retriever: 'Overflowing enthusiasm and affection; exclamation marks and hearts; cheers everyone on',
  cat: 'Aloof and selective; ignores questions they do not feel like answering; replies on their own terms, with sass',
  chaos_goblin: 'Random and unhinged; memes, absurd tangents, derails serious topics',
  dragon: 'Domineering; makes everything about themselves, demands attention, lashes out when challenged',
  owl: 'Know-it-all; corrects people, lectures, adds facts nobody asked for',
  sloth: 'Barely participates; one-word answers and emoji reactions; has to be chased for a reply',
  mother_hen: 'Fusses over everyone far beyond what is needed; nagging reminders, checks on how people are, keeps lists, collects money',
  troll: 'Provokes on purpose; hot takes, bait, mocks others for fun',
  drama_llama: 'Turns small things into a crisis about their feelings; guilt trips, self-pity, "it\'s fine" when it is not',
  mosquito: 'Passive-aggressive; small snide jabs, sarcastic smileys, backhanded compliments',
  npc: 'No opinions of their own; agrees with whoever spoke last; generic filler like "same", "lol", "haha"',
};

// The partner mode keeps the same twelve answer keys and score definitions,
// but gives Jev examples grounded in a two-person conversation. No claim about
// the actual relationship or a person's character can be inferred from these.
const PARTNER_TYPE_CRITERIA = {
  giga_chad: 'Unusually self-assured in this exchange; blunt one-liners; rarely explains or checks how the other person reads them',
  golden_retriever: 'Repeatedly enthusiastic and encouraging toward the other person; excited greetings and warm reactions beyond ordinary politeness',
  cat: 'Noticeably selective and distant in this exchange; answers on their own terms, sometimes with sass; skips direct questions',
  chaos_goblin: 'Frequently throws the two-person conversation off course with surreal jokes, memes or abrupt tangents',
  dragon: 'Tries to dominate the exchange or the other person’s decisions; demands attention and reacts sharply to pushback',
  owl: 'Habitually corrects the other person, lectures or adds unasked-for facts in this exchange',
  sloth: 'Contributes very little in this exchange; repeatedly responds with one-word answers or reactions that leave the other person carrying the conversation',
  mother_hen: 'Repeatedly checks on and manages the other person beyond what the exchange needs; nagging reminders or unsolicited planning',
  troll: 'Repeatedly provokes the other person for a reaction; teasing bait, hot takes or mockery rather than a shared joke',
  drama_llama: 'Turns small two-person misunderstandings into crises about their feelings; guilt trips, self-pity or pointed "it’s fine"',
  mosquito: 'Repeated small passive-aggressive jabs at the other person; sarcastic smileys and backhanded compliments',
  npc: 'Repeatedly echoes the other person without adding a view; generic agreement or filler rather than engagement',
};

// Score levels are shared with the English UI, so the wording Jev judges
// against is the wording people read. Other languages translate by position.
const PERSONAL_QUESTIONS = {
  type: (name) => ({
    type: 'choice',
    instructions: `Which type best captures what makes ${name} stand out compared with the other people in this chat? Judge ${name}'s own messages.`,
    criteria: TYPE_CRITERIA,
  }),
  passive_aggression: (name) => ({
    type: 'score',
    instructions: `How passive-aggressive is ${name}?`,
    criteria: en.levels.passive_aggression,
  }),
  main_character: (name) => ({
    type: 'score',
    instructions: `How much does ${name} make the conversation about themselves?`,
    criteria: en.levels.main_character,
  }),
  effort: (name) => ({
    type: 'score',
    instructions: `How much effort does ${name} put into their messages?`,
    criteria: en.levels.effort,
  }),
  drama: (name) => ({
    type: 'score',
    instructions: `How much drama does ${name} generate?`,
    criteria: en.levels.drama,
  }),
  started_it: (name) => ({
    type: 'noul',
    instructions: `${name} started the main disagreement or tension in this chat.`,
  }),
  leaves_on_read: (name) => ({
    type: 'noul',
    instructions: `${name} ignores or dodges direct questions from others.`,
  }),
  secretly_right: (name) => ({
    type: 'noul',
    instructions: `${name} holds the most reasonable position in this chat.`,
  }),
};

const PARTNER_QUESTIONS = {
  type: (name) => ({
    type: 'choice',
    instructions: `Which playful communication type best describes ${name}'s own messages in this two-person exchange? Compare the two people only using this chat, without assuming a relationship dynamic outside it.`,
    criteria: PARTNER_TYPE_CRITERIA,
  }),
  passive_aggression: (name) => ({
    type: 'score',
    instructions: `How often does ${name} use indirect or pointed remarks toward the other person in this exchange? Judge only the messages shown.`,
    criteria: en.levels.passive_aggression,
  }),
  main_character: (name) => ({
    type: 'score',
    instructions: `How much does ${name} bring the two-person conversation back to themselves instead of engaging with the other person?`,
    criteria: en.partnerLevels.main_character,
  }),
  effort: (name) => ({
    type: 'score',
    instructions: `How much effort does ${name} put into responding to the other person in the messages shown?`,
    criteria: en.levels.effort,
  }),
  drama: (name) => ({
    type: 'score',
    instructions: `How often does ${name} escalate minor issues in this two-person exchange? Do not assume there is conflict if none appears.`,
    criteria: en.levels.drama,
  }),
  started_it: (name) => ({
    type: 'noul',
    instructions: `When there is a disagreement in the messages shown, ${name} initiates the tension. If there is no disagreement, the claim has no support.`,
  }),
  leaves_on_read: (name) => ({
    type: 'noul',
    instructions: `${name} repeatedly ignores or dodges direct questions from the other person in the messages shown. The timing alone does not show that a message was read.`,
  }),
  secretly_right: (name) => ({
    type: 'noul',
    instructions: `When the two disagree in the messages shown, ${name}'s position is better supported by the conversation. If there is no disagreement, the claim has no support.`,
  }),
};

const CULPRIT = 'culprit';

/** The newest messages whose state fits the token budget, oldest first. */
function newestWithinBudget(messages, budget) {
  const kept = [];
  let tokens = estimateTokens({ messages: [] });
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = { from: messages[i].author, text: messages[i].text };
    tokens += estimateTokens(message) + 1; // +1 for the separating comma
    if (tokens > budget) break;
    kept.unshift(message);
  }
  return kept;
}

/** The end of a raw transcript, cut so its state fits the token budget. */
function tailWithinBudget(transcript, participants, budget) {
  let tail = transcript;
  let tokens = estimateTokens({ participants, transcript: tail });
  while (tokens > budget) {
    tail = tail.slice(Math.ceil(tail.length * (1 - (0.98 * budget) / tokens)));
    tokens = estimateTokens({ participants, transcript: tail });
  }
  return tail;
}

/**
 * Builds one Jev request that judges every subject at once. `chat` is either
 * parsed messages or, when the format wasn't recognised, the raw text; either
 * way only the newest part that fits `budget` tokens is sent. Question keys
 * are namespaced by subject index (`p0_drama`) so `readVerdicts` can split the
 * answers back out.
 */
export function buildRequest(chat, subjects, budget = STATE_TOKEN_BUDGET, mode = CHAT_MODES.GROUP) {
  if (mode !== CHAT_MODES.GROUP && mode !== CHAT_MODES.PARTNER) throw new RangeError('Unknown chat mode');
  if (mode === CHAT_MODES.PARTNER && subjects.length !== 2) throw new RangeError('Partner chat needs two subjects');
  const partner = mode === CHAT_MODES.PARTNER;
  const questions = {
    [CULPRIT]: {
      type: 'choice',
      instructions: partner
        ? 'Which of the two more often contributes to tension in the messages shown, if any? Choose from the two people; do not assume the chat contains an argument.'
        : 'Who is most responsible for the tension or drama in this chat?',
      criteria: Object.fromEntries(subjects.map((name) => [name, null])),
    },
  };

  subjects.forEach((name, i) => {
    for (const [key, question] of Object.entries(partner ? PARTNER_QUESTIONS : PERSONAL_QUESTIONS)) {
      questions[`p${i}_${key}`] = question(name);
    }
  });

  if (typeof chat === 'string') {
    const transcript = tailWithinBudget(chat, subjects, budget);
    return {
      judgedCount: null,
      truncated: transcript.length < chat.length,
      body: { model: MODEL, state: { participants: subjects, transcript }, questions },
    };
  }

  const messages = newestWithinBudget(chat, budget);
  return {
    judgedCount: messages.length,
    truncated: messages.length < chat.length,
    body: { model: MODEL, state: { messages }, questions },
  };
}

export function readVerdicts(answers, subjects) {
  return {
    culprit: answers[CULPRIT],
    people: subjects.map((name, i) => ({
      name,
      answers: Object.fromEntries(
        Object.keys(PERSONAL_QUESTIONS).map((key) => [key, answers[`p${i}_${key}`]]),
      ),
    })),
  };
}
