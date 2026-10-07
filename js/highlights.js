// Tiny, intentionally narrow dictionaries. A match is evidence of a written
// cue, not a semantic classification of the message or its author. No quote,
// snippet, matched word or message is returned to the UI or share card.
const word = (alternatives) => new RegExp(`(?:^|[^\\p{L}])(?:${alternatives})(?!\\p{L})`, 'iu');
const TOPICS = [
  { key: 'plans', signal: word('zusammen|samstag|morgen|mitbringen|einkaufen|treffen|\\d{1,2}\\s*uhr|weekend|tomorrow|together|bring|meet|shopping|demain|ensemble|samedi|apporter|quedar|mañana|juntos|sábado|llevar') },
  { key: 'support', signal: word('danke|geholfen|helfen|kein\\s+druck|kein\\s+stress|alles\\s+gut|freut\\s+mich|thanks|thank\\s+you|help|no\\s+pressure|proud\\s+of\\s+you|merci|aider|pas\\s+de\\s+pression|gracias|ayuda|sin\\s+presión') },
  { key: 'clarify', signal: word('verwirrt|missverstanden|ich\\s+meinte|sorry|entschuldigung|nachfragen|wie\\s+meinst\\s+du|confused|i\\s+meant|sorry|what\\s+did\\s+you\\s+mean|désolé|pardon|je\\s+voulais\\s+dire|perdón|lo\\s+siento|quise\\s+decir') },
  { key: 'daily', signal: word('referat|training|lernen|schule|arbeit|prüfung|homework|school|work|class|practice|exam|cours|travail|examen|école|escuela|trabajo|clase|examen') },
  { key: 'humor', signal: /(?:^|[^\p{L}])(?:haha+|hehe+|lol|witzig|lustig|joking|funny|drôle|blague|broma|😂|😄|🤣)(?!\p{L})/iu },
];

// The three numeric tone labels are literal cue counts only. For example,
// "blöd gelaufen" does not match a direct insult. Irony, friendly teasing,
// coercion and actual intentions have no safe deterministic count.
const TONE = [
  { key: 'thanks', signal: word('danke|dankeschön|thanks|thank\\s+you|merci|gracias') },
  { key: 'directInsult', signal: /(?:^|[^\p{L}])(?:du bist (?:echt |so )?(?:ein(?:e)? )?(?:idiot(?:in)?|dumm|blöd)|you(?: are|'re) (?:such an? |so )?(?:idiot|stupid)|tu es (?:un |une )?(?:idiot(?:e)?|stupide)|eres (?:un |una )?(?:idiota|estúpido|estúpida))(?!\p{L})/iu },
  { key: 'compliment', signal: word('du\\s+bist\\s+süß|du\\s+bist\\s+super|you\\s+are\\s+cute|you.re\\s+cute|tu\\s+es\\s+mignon(?:ne)?|tu\\s+es\\s+adorable|eres\\s+adorable|eres\\s+muy\\s+lindo|eres\\s+muy\\s+linda') },
];

export const TOPIC_KEYS = Object.freeze(TOPICS.map(({ key }) => key));
export const TONE_KEYS = Object.freeze(TONE.map(({ key }) => key));

/** Only the already submitted, recognised `{from,text}` messages are scanned. */
export function highlightCues(messages, people, { raw = false } = {}) {
  if (raw || !Array.isArray(messages) || people.length !== 2 || new Set(people).size !== 2 ||
      !messages.every((message) => people.includes(message.from) && typeof message.text === 'string')) {
    return { topics: [], tone: [], checked: null };
  }
  const topics = TOPICS.map(({ key, signal }) => {
    const matches = messages.flatMap((message, index) => signal.test(message.text) ? [{ index, from: message.from }] : []);
    return { key, n: matches.length, spread: matches.at(-1)?.index - matches[0]?.index,
      speakers: new Set(matches.map(({ from }) => from)).size };
  }).filter(({ n, spread, speakers }) => messages.length >= 12 && n >= 3 && spread >= 4 && speakers === 2)
    .sort((a, b) => b.n - a.n || TOPIC_KEYS.indexOf(a.key) - TOPIC_KEYS.indexOf(b.key))
    .slice(0, 3).map(({ key, n }) => ({ key, n }));
  const tone = TONE.map(({ key, signal }) => ({ key,
    n: messages.filter(({ text }) => signal.test(text)).length,
  })).filter(({ n }) => n > 0);
  return { topics, tone, checked: messages.length };
}
