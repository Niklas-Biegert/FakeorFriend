export default {
  "spotlight": {
    "heading": "Your chat at a glance",
    "first": "01 / Your sticker duo",
    "animals": "Which chat animals are you?",
    "second": "02 / Your vibe",
    "vibe": "Your vibe",
    "disclaimer": "A playful reading of this chat excerpt · no guarantees. It cannot judge your relationship beyond the messages.",
    "third": "03 / One real chat fact",
    "moment": "The chat moment",
    "guide": "Curious? Open the numbers and explanations below.",
    "moreReading": "More about your exchange & mini-mission",
    "moreCharts": "Four scales, timeline & outlook",
    "moreNumbers": "Local numbers, methods & data flow"
  },
  "moment": {
    "starter": {
      "title": "Who sends the first ping? ✦",
      "detail": "{name} starts {count} of {of} recognised conversations. That only shows who starts more often in this chat.",
      "card": "{name} starts {count} of {of} recognised conversations."
    },
    "reply": {
      "title": "Reply pace, side by side ↗",
      "detail": "{name} replies after a median of {time} (n = {n}); the other person after {otherTime} (n = {otherN}). After six hours of silence, a new conversation begins.",
      "card": "{name}: median reply {time} (n = {n}); other person {otherTime} (n = {otherN})."
    },
    "empty": {
      "title": "No clear lead yet",
      "detail": "There is no well-supported difference in who starts or how fast replies arrive here. A tie is a result, too."
    }
  },
  "cardVibe": {
    "warm": "Your exchange feels friendly and familiar here; friendship or anything else remains open.",
    "friction": "Your exchange feels tense at times here. What that means for your relationship remains open.",
    "clarify": "Your connection is hard to read here: ambiguous messages cannot reveal what someone really means.",
    "everyday": "Your contact feels fairly everyday here; this excerpt cannot identify your relationship.",
    "uncertain": "There is not enough verifiable chat data for a joint reading."
  },
  "title": "FakeorFriend · How is your connection?",
  "tagline": "A closer look at a two-person chat",
  "volume": "Vol. I · 2026",
  "language": "Language",
  "heroOverline": "Two people. One chat. One sticker duo.",
  "flowLabel": "How the vibe check works",
  "flowInput": "Pick a chat",
  "flowAnalyse": "Vibe check",
  "flowResult": "Results",
  "soundOn": "Sound on",
  "soundOff": "Sound off",
  "scopeFull": "Jev, stickers, the chat moment and local numbers cover all {total} messages.",
  "scopePartial": "Jev, stickers and the chat moment use the newest {n} of {total} messages; timeline and local numbers use all {total}.",
  "scopeRaw": "Jev sees a raw text excerpt; local numbers cannot be verified.",
  "cardScopePartial": "Stickers and chat moment from the newest {n} of {total} messages.",
  "cardScopeFull": "Stickers and chat moment from all {total} messages.",
  "labTitle": "Your vibe is on its way ✦",
  "labIntro": "We count chat patterns locally and ask Jev once for four impressions of the exchange. Your card is then made in the browser.",
  "hero": "Meet your <em>chat animals</em>",
  "lede": "Two animals, one shared vibe and a real chat fact. Take a quick look; open the details when you want more.",
  "stageInput": "01 / Pick a chat",
  "stageResult": "Your result",
  "stageShare": "03 / Preview & share your card",
  "duoTitle": "Your sticker duo",
  "reading": {
    "duoEyebrow": "Two voices · one excerpt",
    "eyebrow": "Two perspectives",
    "title": "How each writes here",
    "subtitle": "Counted roles in this excerpt. Thoughts and life outside the chat are unknown.",
    "scalesTitle": "Four angles on your exchange",
    "duo": {"similar": "Both write at a similar rate in the checked excerpt ({first} versus {second} messages). That counts participation here, not how much the connection matters to either person.", "different": "The message counts differ here ({first} versus {second}). Who asked questions, planned things or had time could explain that without any difference in feelings.", "varied": "This excerpt has {first} and {second} messages from the two sides. A ratio alone cannot tell us who feels closer."},
    "headings": {
      "starter": "The first ping",
      "detailed": "Room for more words",
      "brief": "Few words, a clear rhythm",
      "exchange": "Their writing rhythm",
      "unknown": "An open question"
    },
    "lines": {
      "startsLead": "Starts {count} of {of} conversations in this excerpt, with an unambiguous lead. That might look like initiative; it could also reflect whose day made the first ping easier.",
      "starts": "Starts {count} of {of} observed conversations; there is no sole leader here.",
      "startsUnknown": "There are fewer than five identifiable conversations, so a fair comparison of who starts them is not possible.",
      "startsTruncated": "The excerpt begins partway through a chat, so who starts conversations cannot be compared fairly.",
      "lengthLead": "Writes a median of {words} words and {chars} characters per message (n = {n}), clearly longer in words than the other person. Extra words might be explanation or planning, not necessarily greater closeness.",
      "length": "Writes a median of {words} words and {chars} characters per message (n = {n}). Message length alone cannot tell us how much a message means.",
      "reply": "Replies after the other person in a median of {time} (n = {n} valid turns). Sleep, school and plans are invisible here; this is not a measure of interest.",
      "limits": "This describes these messages, not a lasting trait or a window into anyone’s thoughts.",
      "unknown": "The speakers or at least three text messages from each cannot be verified here. There is no personal reading."
    }
  },
  "outlook": {
    "eyebrow": "A look ahead · calculated locally",
    "title": "What might happen next?",
    "intro": "First, measurable weekly patterns. Then a few explicitly playful readings. A chat chart cannot see feelings.",
    "rhythmTitle": "Plot twist in your chat rhythm",
    "rhythm": {
      "up": "Median {recent} messages per week over the last 3 complete weeks, versus {old} over the previous 6. This excerpt has been busier lately.",
      "down": "Median {recent} messages per week over the last 3 complete weeks, versus {old} over the previous 6. This excerpt has been quieter lately.",
      "empty": "No clear shift across 3 versus 6 complete weeks, or not enough history yet."
    },
    "coactiveTitle": "Same days, both here?",
    "coactive": {
      "first": "Both wrote on {recent} of {days} days in the last 4 complete weeks.",
      "compare": "Both wrote on {recent} of {days} recent days, versus {previous} of {days} days in the 4 weeks before. This counts shared chat days, not closeness.",
      "empty": "Four complete calendar weeks are needed to compare shared days."
    },
    "forecastTitle": "Next full week in the timeline",
    "forecast": {
      "ready": "For the week starting {date}, the local forecast is about {first}–{last} messages. In 7 of 8 previous checks, the error was within ±{error} messages. No guarantee for the next week.",
      "test": "Eight retrospective checks: average model error {model} messages; simple baseline error {baseline}.",
      "short": "A forecast needs at least 26 complete weeks, including 16 active weeks. The example chat is too short.",
      "weak": "The model did not clearly outperform a simple baseline or was still too inaccurate. No forecast is shown.",
      "empty": "Without complete, unambiguous calendar dates, there is no fair weekly forecast."
    },
    "barTitle": "Recent complete weeks; bars count messages including zero-message weeks.",
    "barLabel": "Week starting {date}: {n} messages.",
    "scenesTitle": "And now: what if?",
    "disclaimer": "Figures without guarantee. Only the weekly outlook is a checked numerical forecast; the cards below are playful readings of this excerpt, not predictions of feelings, intentions or a relationship.",
    "scenes": {
      "flirt": {
        "title": "Flirting or just your humour? ✦",
        "body": "A narrow compliment phrase appeared in {n} of {total} checked messages, and Jev saw recurring warmth. This could feel playful; perhaps it is simply how you talk as friends. Intent cannot be read from this."
      },
      "quiet": {
        "title": "Getting quieter lately? ↘",
        "body": "The recent median is {newMedian} messages a week versus {oldMedian} before (3 versus 6 complete weeks). Schedules or topics may have changed; this chat cannot explain why or prove ghosting."
      },
      "develop": {
        "title": "Could something grow here? ✧",
        "body": "Warmth {warmth}/3 and back-and-forth {reciprocity}/3 across {n} checked messages, with recurring planning or support words. This may feel like a good thread to pick up—or simply a comfortable friendship."
      },
      "empty": "A future storyline would be a guess here. There are not enough clear, recurring signals in the checked excerpt."
    },
    "methodTitle": "How are the numbers and readings made?",
    "method": "Calendar weeks run Monday to Sunday as written in the export; no time zone is invented. The first and last observed weeks are dropped as possibly incomplete. Silent days and weeks count as zero. Rhythm compares the median of the latest 3 complete weeks with the previous 6: at least 3 active comparison weeks, earlier median ≥ 4, absolute difference ≥ 4, and at least a 35% fall or 50% rise. Shared days count days on which both wrote across equal 28-day windows. The forecast requires 26 complete and 16 active weeks; an exponentially smoothed model selects its parameter on the first 18 weeks and caps outliers. Eight later two-week-ahead checks are compared with the median of the last four available weeks. A range appears only if mean error is at least 5% lower and remains moderate relative to typical weekly activity. The range uses the error of 7 of 8 previous checks; it has no guaranteed statistical coverage. Playful cards use existing Jev scores and narrow word cues only. Compliments and quieter weeks do not establish intent or feelings."
  },
  "timeline": {
    "title": "Your chat over time ↗", "intro": "When was it busy, when was it quiet? Counted locally, without measuring feelings.",
    "scope": "{n} active out of {total} calendar days in the recognised chat.",
    "daily": "Solid = first person (circles); dashed = second (squares). Daily counts include zero days.",
    "weekly": "Seven-day blocks starting with the chat's first day; the last may be shorter. Solid = first person, dashed = second.",
    "trend": "The faint line is a linear trend in combined message counts per period, including zeros; an incomplete final week is excluded. It predicts nothing about your relationship.",
    "noTrend": "A trend line needs at least 7 active and 14 observed periods.",
    "accessible": "Message activity from {first} to {last} for {firstName} and {secondName}; values are available in the table.",
    "tableTitle": "All values as a table", "period": "Period start", "methodTitle": "How is this calculated?",
    "method": "Daily counts include both people and all zero days. After 42 days, consecutive seven-day blocks are shown. The faint line is ordinary linear regression of the combined period counts. Patterns are exploratory: Spearman rank correlation needs 10 active days, at least 5 days active per person and |r| ≥ 0.65; length comparison needs 16 days with at least 2 messages per person; each daily value averages both personal medians, comparing median character counts of the four busiest and four quietest days with a minimum difference of 30% and 8 characters. No significance tests or causal claims. Dates use the written export fields; no time zone is inferred.",
    "empty": { "unavailable": "This format has no verifiable daily timeline.", "missingDates": "Some timestamps are missing or ambiguous. We won't draw a misleading timeline.", "tooLong": "This chat spans over five years. That is too long for a readable timeline here." },
    "noPatterns": "No clear pattern yet: too few or too mixed observations for a fair comparison.",
    "cardFact": "Active on {activeDays} of {totalDays} days in the recognised chat",
    "pattern": {
      "together": { "same": "Busy at the same time ✦", "opposite": "Different activity rhythms ↗", "detail": "Across {n} active days, the rank correlation of both message counts was r = {rho}. This describes an association, not a cause." },
      "length": { "longer": "Busier days, longer texts ✦", "shorter": "Busier days, shorter texts ↗", "detail": "Median text length on four quiet days: {low} characters; on four busy days: {high} characters (n = {n} comparable days). This compares days, not effects." }
    }
  },
  "cues": {
    "eyebrow": "Your chat, without mind-reading",
    "title": "What stands out here",
    "intro": "Recurring written cues in the checked excerpt, not an automatic summary of everything you discussed. Each number counts messages with a defined phrase.",
    "topicsTitle": "Topic cues",
    "toneTitle": "Tone check · written cues",
    "noTopics": "No recurring topic cue appears in at least three messages from both sides yet.",
    "noTone": "No match for these narrowly defined tone phrases. That says nothing about the overall kindness of the chat.",
    "raw": "Raw text has no verifiable speakers, so topic and tone counts stay hidden.",
    "coarse": "Jev gives a broad reading of the whole excerpt: warmth {warmth}/3, visible tension {tension}/3 (n = {n} messages). These scores do not count individual messages.",
    "limits": "Irony, friendly teasing, attraction and pressure cannot be reliably counted from isolated phrases. Even direct words might be a joke. No one is labelled “toxic”.",
    "methodTitle": "How are these cards made?",
    "method": "Only recognised text messages in the same excerpt sent to Jev are checked locally. A topic cue needs at least 12 messages overall, three matching messages, both speakers and four messages between the first and last match. Up to three topics appear. Tone counts cover only predefined expressions, never all kind, flirtatious or rude messages. Topics may overlap within one message. Raw text is excluded. No quotes, timestamps or match lists are stored or shared.",
    "topics": {
      "plans": {
        "title": "Plans taking shape",
        "detail": "Planning words appear in {n} of {total} messages. They recur on both sides of this excerpt; the chat cannot show what happened next."
      },
      "daily": {
        "title": "Daily life in the mix",
        "detail": "School, work or training words appear in {n} of {total} messages. Daily life comes up more than once here."
      },
      "support": {
        "title": "Support in words",
        "detail": "Thanks or help words appear in {n} of {total} messages. These are written signals, not measured feelings."
      },
      "humor": {
        "title": "A few laughs",
        "detail": "Laugh words or emojis appear in {n} of {total} messages. Whether the joke landed the same way for both is unknown."
      },
      "clarify": {
        "title": "A second look",
        "detail": "Clarifying or apology words appear in {n} of {total} messages. The exchange readjusts more than once."
      }
    },
    "tone": {
      "thanks": {
        "title": "Thank-you phrases",
        "detail": "{n} of {total} messages contain a recognised thank-you phrase. This counts words, not every kind message."
      },
      "directInsult": {
        "title": "Directly disparaging phrasing",
        "detail": "{n} of {total} messages match a narrow direct-address phrase. Context could change its meaning; this is no verdict on a person."
      },
      "compliment": {
        "title": "Compliment wording",
        "detail": "{n} of {total} messages contain one of the counted compliments. It may sound playful or mildly flirty, but cannot prove intent."
      }
    }
  },
  "statsTitle": "Numbers, no mind-reading",
  "cardStory": { "warm": "Warmth {warmth}/3 · back-and-forth {reciprocity}/3 · n = {n}", "friction": "Visible tension {tension}/3 · n = {n} messages", "clarify": "Clarity {clarity}/3 · n = {n} messages", "everyday": "Warmth {warmth}/3 · back-and-forth {reciprocity}/3 · n = {n}", "uncertain": "Speakers or sample cannot be verified" },
  "technicalTitle": "Technical excerpt details",
  "animalMeaning": "Stickers show counted patterns in this excerpt only, not personality traits.",
  "animals": {
    "mouse": { "name": "Mouse", "why": "You keep it short here: median {value} words per message (n = {n})." },
    "cat": { "name": "Cat", "why": "You land at a median of {value} words per message here (n = {n})." },
    "dog": { "name": "Dog", "why": "You start {count} of {of} recognised conversations, more than the other person." },
    "hedgehog": { "name": "Hedgehog", "why": "Your messages run longer here: median {value} words (n = {n})." },
    "owl": { "name": "Owl", "why": "You write {count} of {n} messages between 10 pm and 6 am, using the export clock." },
    "rabbit": { "name": "Rabbit", "why": "You reply after a median of {value} minutes to the previous chat block (n = {n})." },
    "tortoise": { "name": "Tortoise", "why": "Your reply blocks are a median of {value} minutes apart (n = {n})." },
    "neutral": { "name": "Mystery sticker", "why": "Not enough verifiable messages for a chat-animal role yet." }
  },
  "story": {
    "warm": { "title": "You two have a rhythm ✦", "body": "Warmth {warmth}/3 and back-and-forth {reciprocity}/3: in these {n} messages your exchange feels friendly and in sync. That could suggest familiarity; it could just as easily be two people who enjoy an easy conversation." },
    "friction": { "title": "A little tension between you ⚡", "body": "Visible tension {tension}/3: these {n} messages show some friction in your exchange. It might be an unresolved issue, or just one awkward moment that has already passed." },
    "clarify": { "title": "Your connection: hard to read ↗", "body": "Clarity {clarity}/3: parts of these {n} messages leave room for different readings. Maybe a question remains unspoken; maybe text simply loses the tone of voice. The chat cannot settle your relationship." },
    "everyday": { "title": "What connects you is still open ✦", "body": "These {n} messages mix ordinary updates and conversation (warmth {warmth}/3, back-and-forth {reciprocity}/3). That could fit friendship, getting to know each other, or simply an everyday chat; the excerpt does not decide." },
    "uncertain": { "title": "No story to invent yet ✦", "body": "Speakers cannot be verified or there are too few messages for a duo. The four scales cover the submitted text only, not your relationship beyond it." }
  },
  "scaleAccessible": "{trait}: level {score} out of 3 – {level}.",
  "traitExplainers": { "warmth": "Do both people respond with friendliness or support?", "reciprocity": "Do both build on what the other person says?", "tension": "Is there visible friction in this excerpt?", "clarity": "Is it clear from the text what each person means?" },
  "exhibit": "Your chat",
  "evidence": "Two people",
  "chatLabel": "Chat transcript",
  "chatPlaceholder": "Paste a chat, or open an export: WhatsApp (also as ZIP), Telegram, Discord, Slack, Messenger, iMessage, CSV…\n\nOr just write it out:\nAna: are you coming tonight?\nBen: k",
  "openFile": "Open an export",
  "sample": "Try a fictional chat",
  "judge": "Start vibe check",
  "pairHint": "Use a chat with exactly two people and at least 3 text messages each. Group chats cannot be analysed, even if you select only two.",
  "namesLabel": "Couldn’t recognise the speakers. Enter exactly two names:",
  "namesPlaceholder": "Two names, separated by a comma",
  "namesSubmit": "Use these names",
  "keyPlaceholder": "Your OpenRouter key (sk-or-…), kept in this browser only",
  "keyLabel": "OpenRouter API key",
  "keySubmit": "Save key and explore",
  "fineprint": "Message counts and reply times are calculated in your browser. For Jev’s reading, the newest recognised messages (sender and text) are sent to OpenRouter and TypeSafe. Timestamps and local statistics are not included.",
  "rawNotice": "Format not recognised: with two manually entered names, a recent raw text excerpt is sent to OpenRouter and TypeSafe. It may include dates and other details; the speakers and sample size cannot be verified.",
  "keyStorage": "A key you enter and your chosen language can be saved in this browser. A key built into the deployment in js/key.js can also be used.",
  "clearKey": "Delete saved personal key",
  "keyCleared": "Saved personal key removed from this browser. A deployment key in js/key.js remains available if configured.",
  "summaryTitle": "Your chat at a glance",
  "share": "Preview & share card",
  "colophon": "An exploratory reading of the submitted chat excerpt by Jev (TypeSafe) via OpenRouter. No diagnosis or relationship verdict.",
  "cardNames": "Names on the card",
  "cardShare": "Share",
  "cardDownload": "Download image",
  "cardClose": "Close",
  "cardShareText": "Our chat excerpt, viewed with FakeorFriend",
  "cardAnonymous": "Anonymous",
  "cardRenderError": "Image preview unavailable. Try opening the card again.",
  "cardPreviewHeading": "Visible on the image before sharing",
  "cardPrivacyNote": "Check the preview and names. No chat quotes, audio or phone numbers are added automatically.",
  "cardScoreNote": "The label describes this chat excerpt, not the people or the relationship outside it. No personality percentages.",
  "cardFooter": "Chat excerpt only · no diagnosis",
  "cardReplyHighlight": "Reply median {time} · n = {n}",
  "cardCharsHighlight": "Text median {chars} chars · n = {n}",
  "unknownNumber": "Unknown number {n}",
  "lab": [
    "Chat excerpt prepared",
    "One Jev request in progress…",
    "Computing local numbers…",
    "Result is ready"
  ],  "errors": {
    "badKey": "That doesn’t look like an OpenRouter key. It should start with “sk-or-”.",
    "jev": "Jev refused to testify ({status}): {reason}",
    "tooBig": "That file is too big. Chats up to 50 MB of text are fine.",
    "noChatInZip": "No chat found in that ZIP. WhatsApp exports hold it as a .txt file.",
    "encryptedZip": "That ZIP is password-protected.",
    "unreadableZip": "That ZIP can’t be read. Try exporting the chat without media.",
    "tooFew": "At least 3 text messages per person are needed in the part sent to Jev."
  },
  "connection": {
    "friendly": "Mostly warm exchange",
    "mixed": "Your connection: still open",
    "strained": "Noticeable friction in this excerpt",
    "uncertain": "Not enough verifiable context",
    "note": "An impression of the messages shown, not a measure of your real relationship. Silence and brief replies do not prove hostility.",
    "rawNote": "Speakers cannot be verified from this format. The scores describe only the raw excerpt; no overall relationship label is assigned.",
    "cardNote": "Only this excerpt · not a relationship diagnosis"
  },
  "evidenceRaw": "raw transcript",
  "evidenceRawTruncated": "newest part of the raw transcript",
  "evidenceTruncated": "newest {n} of {total} messages (older ones exceed Jev’s limit)",
  "evidenceAll": "n = {n} messages",
  "counted": {
    "messages": "Messages",
    "words": "Words per message",
    "medianChars": "Median message length",
    "longest": "Longest message",
    "charValue": "{count} characters",
    "sample": "n = {n} messages",
    "tooFew": "Fewer than 3 text messages: no reliable length comparison yet.",
    "medianCharsDefinition": "Median length of text messages in Unicode code points; spaces and line breaks count.",
    "longestDefinition": "Length of the longest text message in Unicode code points; only the number is shown.",
    "reply": "Reply time",
    "wordsDefinition": "Median words per message",
    "replyDefinition": "Median time until they write after someone else. Silences over 6 hours start a new conversation instead. n = replies measured."
  },
  "statNotes": {
    "median": "The character tally: a median of {chars} characters per message (n = {n}).",
    "maximum": "The longest single message runs to {chars} characters (n = {n}).",
    "leader": "{name} has the longest single message among those judged: {chars} characters (n = {n}).",
    "reply": "A reply follows someone else’s message after a median of {time} (n = {n})."
  },
  "records": {
    "slowest": {
      "title": "Slowest thumbs",
      "detail": "median reply {time} · n = {n}"
    },
    "fastest": {
      "title": "Fastest thumbs",
      "detail": "median reply {time} · n = {n}"
    },
    "wordiest": {
      "title": "Longest-winded",
      "detail": "median {words} words per message · n = {n}"
    },
    "starter": {
      "title": "Breaks the silence",
      "detail": "started {count} of {of} conversations"
    }
  },
  "traits": {
    "warmth": "Mutual warmth",
    "reciprocity": "Back-and-forth",
    "tension": "Visible tension",
    "clarity": "Clarity"
  },
  "levels": {
    "warmth": [
      "No clear warmth",
      "Occasional friendliness",
      "Repeated friendliness",
      "Sustained support"
    ],
    "reciprocity": [
      "Little exchange",
      "Some exchange",
      "Regular back-and-forth",
      "Both build on each other"
    ],
    "tension": [
      "No visible tension",
      "Mild disagreement",
      "Repeated friction",
      "Repeated hostile exchanges"
    ],
    "clarity": [
      "Repeated ambiguity",
      "Some ambiguity",
      "Mostly clear",
      "Consistently clear"
    ]
  },
  "youthNotice": "Under 18? Use invented chats in the test preview. The normal AI analysis sends text to external providers; do not upload other people’s private chats.",
  "visual": {
    "mapTitle": "Vibe map",
    "mapIntro": "The dot shows only Jev’s warmth and visible-tension levels (0–3 each). It does not measure a relationship.",
    "moreTension": "more tension",
    "lessTension": "less tension",
    "lessWarmth": "less warmth",
    "moreWarmth": "more warmth",
    "mapAccessible": "Vibe map: warmth {warmth} of 3; visible tension {tension} of 3.",
    "balanceTitle": "Who sends how many?",
    "balanceIntro": "Share of counted text messages. Writing more does not mean caring more.",
    "messages": "{count} messages",
    "balanceAccessible": "{name}: {count} of {total} messages.",
    "ideaTitle": "A tiny quest for you two",
    "methodTitle": "Where did these ideas come from?",
    "methodIntro": "Inspired by research and textbooks on listening, support and handling disagreements constructively. These four Jev scales and this graphic are our own unvalidated game rules. A chat cannot diagnose a relationship.",
    "bookLink": "Textbook: OpenStax, Lifespan Development, section 10.4",
    "studyLink": "Study: Liu et al. (2023) on positive feedback and adolescent friendship",
    "sample": "Jev saw n = {n} messages.",
    "bookLink2": "Textbook: OpenStax, Psychology 2e, section 12.7"
  },
  "ideas": {
    "repair": "Ask about a detail you read differently: “What exactly did you mean?” Clarifying words come up repeatedly, so an open question fits without placing blame.",
    "plan": "Ask: “Which of these should we actually do together?” Plans come up repeatedly here; a concrete question can help you coordinate.",
    "pause": "Take a breath, then ask: “What mattered most to you about that?” When this excerpt shows friction, an open question may do more than another comeback.",
    "clarify": "Ask: “What did you mean by that?” Text has no tone of voice; one question might clear up a strange reading.",
    "appreciate": "Name one small thing you like about talking together. If you already respond warmly, this makes it visible without demanding anything back.",
    "open": "Ask what has been on the other person’s mind. It opens a conversation without requiring an answer."
  }
};
