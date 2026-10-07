# FakeorFriend

FakeorFriend is an independent repository based on the JudgeYou prototype.
JudgeYou's repository is unaffected. The page examines **one chat between exactly
two people**. It does not guess whether they are a couple, friends or family,
diagnose anybody, or identify a person who is "at fault".

Paste a chat or open a WhatsApp (including ZIP), Telegram, Messenger, Instagram,
Discord, Slack, Teams, iMessage, IRC, LINE, KakaoTalk, CSV or plain transcript.
Existing import parsers remain in place. With a recognised format the browser
requires exactly two recognised speakers with at least three text messages each.
A 400-message, completely fictional sample chat is built in. Its two fictional
speakers talk across January–September 2026 about everyday plans, classes,
support, a clarified misunderstanding and ambiguous friendly jokes. Messages
use unambiguous day-first dates, varied lengths, gaps and quiet days; the
sample currently fits within the Jev state budget. The local preview intercepts
the Jev call and needs no API key. Forecasts are calculated independently:
never treat the sample as evidence that a real relationship can be predicted.
In the local preview, **only the exact fictional 400-message sample** receives
scripted demonstration scores (warmth 3, reciprocity 3, tension 0, clarity 2).
Any changed or user-supplied chat receives the generic mock scores of 1/3
instead: the preview cannot judge a real chat. Both variants label the model
as a simulation and make no Jev or OpenRouter call. For an actual structured
assessment outside the preview, the app needs a real provider response.
A three-person chat cannot be made eligible by hiding or excluding one person.
A long chat can be truncated to the newest messages that fit Jev's state
limit; if that excerpt has fewer than three messages from either speaker, no
request is made.

For an unrecognised format you can enter exactly two names manually, but the
browser **cannot verify** who spoke or how many people appear in the raw text.
The results explicitly lack a global label in this case; use a recognised
format for a verifiable two-person comparison.

## What the result means

One Jev Decisions request returns four structured scores from 0 to 3 for the
messages in the submitted excerpt: mutual warmth, back-and-forth, visible
tension, and clarity. Brief replies or long pauses alone do not imply tension.
The displayed levels translate the four ordinal score levels; they are not
personality probabilities. No Jev prose, suspect, personality animal type, Menace Index,
Green/Red percentage, or "toxic" diagnosis is produced.
The prominent duo text is a **playful, nonbinding reading of how this excerpt
sounds**, not a relationship type inferred from the messages. Warmth and
reciprocity can suggest familiarity but cannot distinguish friendship from
romance; ambiguity alone cannot establish distance or hidden feelings. The
four existing ordinal scores and exactly one request still drive the real
result. The share card uses a matching cautious, curated sentence.

For recognised chats, the overall *excerpt label* follows this rule, in order:

1. **Noticeable friction:** tension >= 2 and warmth <= 1.
2. **Mostly warm:** warmth >= 2, reciprocity >= 2 and tension <= 1.
3. Otherwise **mixed or everyday**.

If the scores are unavailable or the format is unrecognised, the label is
**not enough verifiable context**. These labels describe only the messages
that Jev sees, not a real relationship outside the excerpt. Jev's scores can
still be wrong and no passages or quotes are displayed as proof.

## Playful presentation and research basis

The first result view has three parts: two large animal stickers with counted
reasons, a short duo vibe from Jev's existing four scores, and one optional
local comparison. The share action follows them. Personal readings, themes,
mini-mission, scales, charts, outlook, numeric records, methods and data flow
remain in three keyboard-accessible native `<details>` sections. Visual inspiration came from
the short check-ins on [Paired](https://www.paired.com/), the two-person
presentation and stickers on [Between](https://between.us/), and the light
conversation prompts on [Couply](https://www.couply.io/). All text, rules,
artwork and layout here are original; those products are visual references,
not research that validates this analysis. Display headings use Fraunces
(Georgia offline fallback); the body uses IBM Plex Sans (system sans offline).

`js/reading.js` builds personal reading descriptors from `stickerStats`, the
**same parsed excerpt sent to Jev**, and never handles message text or
timestamps. It needs at least three text messages per person, or supplies a
neutral reading for both; raw transcripts also remain neutral. A start lead
needs at least five recognisable conversations, comparable denominators and
a strict lead. Truncated excerpts cannot produce start comparisons because
their first message may cut into a conversation. A word-length lead needs a
strict advantage of at least three median words and 25% over the other
person, with at least three messages from each. Without a lead, each person
gets their own median word and character count. Reply times require three
valid timed turns; pauses of six hours already start new conversations in
`stats.js`. Each sentence includes its own observation count. With five
messages per person, the duo adds one observation on message counts: similar
when the larger is at most 1.25 times the smaller, different when it is at
least twice as large, otherwise varied. It explicitly does not equate counts
or reply speed with feelings. The ordinal Jev scores remain pair-level only;
they are never assigned to either person's character. The only remote call
still contains the original four Jev questions and the same sender/text state.

`js/moment.js` selects at most one comparison from the same submitted parsed
excerpt as the stickers. A starter lead requires five recognised conversations,
both counts summing to that total, at least two more starts than the other
speaker and a share of at least 60%. Truncated excerpts cannot claim a starter
lead. Otherwise both speakers need at least five valid reply blocks; medians
must differ by five minutes and a factor of 1.5 for a faster-reply comparison.
Ties and thin samples get a neutral message. Neither rule measures interest.

The PNG and preview use the same curated model: edited names, sticker names
and counted reasons, a short cautious duo vibe, at most one chosen moment and
the excerpt scope. Longer readings, ordinal scores, forecasts and timeline
facts remain on the page; chat quotes never enter the card.

### What stands out: recurring written cues

`js/highlights.js` examines **only recognised `{from,text}` messages in the
single submitted Jev excerpt**, locally. It returns category identifiers,
message counts and the total checked; it returns no chat text, quotes,
match lists, sender names or dates. Raw transcripts cannot verify their
speakers and therefore receive no topic or tone counts. Multiple topics can
match one message. Five small language-independent word/emoji dictionaries
cover planning, daily life, help/thanks, laughter and clarifying/apologising.
For a recurring topic to appear, the excerpt needs 12 messages; at least three
different messages must match, both people must write at least one of those,
and the first and last matches must be at least four messages apart. The
three most frequent eligible topic cues appear. A phrase in one message is
never described as a recurring topic.

The local **tone phrase counts** cover only messages containing a defined
thank-you phrase, a narrow direct-address insult phrase, or a mild compliment
phrase in German, English, French or Spanish. Repeating a word in the same
message counts once. For example, "blöd gelaufen" is not the same literal
pattern as "du bist blöd"; the latter can still be a joke or quotation. Thus
even a matched insult is a **written cue, never proof of hostility**. Cute
compliments may sound flirty but do not establish attraction or intent.
Teasing, sarcasm, coercion, explicit sexual content and a "toxic message"
count have no reliable rule here and receive no invented total. Zero matches
does not mean zero kindness, discomfort or risk. The separate four Jev scores
are broad pair-level judgments over the entire excerpt, never per-message
counts. No new Jev questions, state fields, API calls, tokens or provider cost
are added. One existing conversation idea may pick up recurring planning or
clarifying words, while visible tension and low clarity retain priority.
No new cue data enters the share card or logs. The approach deliberately
misses indirect language and unfamiliar dialects; it is neither a validated
topic classifier nor a psychological assessment.

The mobile-first interface presents three stages: choose a chat, explore the
excerpt, then preview a share card. Its dark plum surfaces, pale blue panels
and lime actions use text labels alongside color. Each of the four ordinal
scales has a short explanation and a spoken label with its 0–3 level. The
original card flow exports one 1080×1350 PNG; edited names, animal reasons
and the chosen moment remain visible in its preview before sharing. This presentation
does not change the four Jev questions or their scoring rules.

`css/polish.css` adds the visual layer: a compact stage indicator,
three result spotlights, large stickers and a horizontally scrollable timeline
on narrow screens with its accessible data table still available below. The
four loading steps follow the actual request and local calculations; the
moving signal is *not* a percentage and there is no minimum display delay.
CSS removes ornamental movement when the user prefers reduced motion. Editing
the chat while a result or request is visible
clears the old result; a response for that superseded text is not displayed.
No extra request, storage, or chat metadata is introduced by this styling.

Each person gets one of seven **original animal stickers for a counted pattern**,
using only the part of a parsed chat submitted to Jev. Both people need at least
three text messages, otherwise both receive a neutral sticker. Rules run in
this order (the first qualifying rule wins): **dog** starts strictly more of at
least three observed conversations than the other person (ties receive no dog);
**owl** writes at least 5 of 10 timestamped messages between 22:00 and 05:59
*as written in the export* (no timezone is assumed); **rabbit** has at least
five valid reply blocks with median response time at most three minutes;
**tortoise** has at least five valid reply blocks with median response time at
least 30 minutes; **hedgehog** has median text length at least 15 words over at
least three messages; **mouse** has median length at most six words over at least
three messages; otherwise **cat** represents a median between seven and fourteen
words. A six-hour pause begins a new conversation and is excluded from reply
gaps. Each sticker displays the observation and sample size. Two people may
receive the same animal. The rules describe chat roles, never personalities.
Raw formats get neutral stickers because speakers cannot be verified. For
truncated chats the sticker uses only the submitted excerpt; separate local
statistics and the time graph use the whole recognised chat. Result and share
card explicitly state the two scopes.

The analysis button optionally plays one quiet, locally synthesized two-note
cue (Web Audio API); the nearby button mutes it without saving a preference.
The loading animation shows an open-ended active state, not a percentage or
timed result. Its text stages follow the actual request and local calculations.
Reduced-motion settings disable its moving elements. A fast request is shown
immediately, without a minimum animation delay.

The shared duo story uses only the four existing ordinal scores, in order:
tension >= 2 gives a friction story; otherwise clarity <= 1 gives a clarifying
story; otherwise warmth and reciprocity >= 2 give a warm story; otherwise it
describes an everyday excerpt. Raw or invalid scores, or fewer than six sent
messages, give a neutral story. Relevant scores and the observed message count
are shown; future-sounding lines are explicitly speculative. The mission uses
the existing `conversationIdea` rules. A short CSS reveal animates the sticker
duo without delaying results; reduced-motion settings remove the animation.

The result shows an original two-chat-bubble illustration for each of the
four possible labels, a two-axis map of Jev's **warmth** (horizontal, 0–3)
and **visible tension** (vertical, 0–3), and a local bar chart of each
speaker's message count. The dot is placed by dividing each ordinal level by
3; this makes the picture readable, **not** statistically continuous. The
count bars are shares of messages, not measures of affection or effort.
Raw transcripts receive no map or count comparison because speakers cannot
be verified. A short fixed conversation idea offers a supportive next step;
there is no point system, ranking of people, or pressure to upload more chats.

The topics come from the [OpenStax developmental psychology textbook, chapter
10.4](https://openstax.org/books/lifespan-development/pages/10-4-social-contexts-in-adolescence),
which describes listening, sharing, social support and constructive handling
of disagreements in adolescent relationships. [OpenStax Psychology 2e,
chapter 12.7](https://openstax.org/books/psychology-2e/pages/12-7-prosocial-behavior)
discusses empathy and prosocial support. An [original study of 1,713
adolescents aged 11–19](https://pubmed.ncbi.nlm.nih.gov/36834137/) reported
an association between positive feedback and friendship quality on social
network sites. These publications provide *ideas for conversation topics*;
they did not validate our questions, thresholds, score map, game labels or
inferences about individuals from exported chats. In particular, 10-year-olds
and 21-year-olds are not interchangeable research populations.

Locally calculated counts remain per person: number of messages, median words
and characters, length of the longest message and median reply time. A reply
starts when the other person's previous message block ends. Silences over six
hours start a new conversation. Length and reply medians need at least three
valid observations. The optional share moment includes its sample size.
Records are awarded only on a clear lead with enough data.

## Chat over time (local)

`js/timeline.js` groups parsed text messages by the calendar fields represented
by `at`; `stamps.js` encodes the export's written wall-clock date using UTC
fields solely for comparison. No time zone is inferred or converted. Every
calendar day between the first and last dated message appears, including
zero-message days. If *any* message has a missing/ambiguous timestamp, the
graph and pattern cards are omitted rather than showing a partial curve. Raw
transcripts also have no timeline. Spans above 1,827 days show an explicit
limit message. Chats up to 42 calendar days show daily counts; longer ones show
consecutive seven-day blocks from the first observed date (the final block
can be shorter). Labelled lines also differ in dash and marker shape, and an
accessible table lists every displayed period.

A faint ordinary least-squares line fits the **combined** message count across
displayed periods, including zeros. An incomplete final week is excluded
from the fit because it is shorter than the others. It needs at least 14
complete periods and
7 active periods. It is a display aid, not a prediction. Two predefined,
exploratory patterns are eligible, with at most two cards:

- Co-activity uses Spearman rank correlation of the two daily message counts
  on days when either person writes. It needs at least 10 such days, five
  active days for each person, variance in both series, and |r| >= 0.65.
  Ranks limit one spike's influence; all-zero days remain in the graph but
  are excluded from this comparison to avoid correlated inactivity.
- Length by activity requires two messages from **each person** per day. A
  day's length is the average of the two personal median character lengths,
  giving each speaker equal weight despite unequal message counts. It needs
  16 comparable days and a strict count difference
  between the four busiest and four quietest days (no tie at the boundary).
  The medians of those four daily medians must differ by eight characters
  **and** 30%. Days, not individual messages, are the observations.

These selected descriptive patterns have no significance tests or causal
claim. No card appears if conditions fail. All calculations remain in browser
memory. Timeline facts stay in the expanded result view, not on the compact
share card. No local measures enter Jev's
state or add a second request.

## What might happen next? (local, experimental)

`js/outlook.js` reuses the existing daily calendar counts. Calendar weeks
are **Monday through Sunday in the date as written in the export**, not the
display's seven-day blocks anchored to the first message. The weeks containing
the first and last observed messages are excluded because an export can start
or end partway through either day. All intervening silent days and weeks count
as zero. A missing or ambiguous timestamp suppresses all temporal summaries.
Raw transcripts also receive no temporal summaries. No device time zone is
used to reinterpret the export date.

The rhythm card compares the median weekly message count in the latest three
complete weeks with the six immediately before them. It needs at least three
active weeks among the six, an earlier median of at least four, a difference
of at least four messages per week, and either a fall of at least 35% or a
rise of at least 50%. Medians limit the effect of a single unusually active
week. The shared-day card counts days when both people wrote, comparing two
equal windows of four complete weeks (28 days each) when both exist; it makes
no claim that their activity is caused by each other.

The **two-week-ahead** forecast targets the full week *after* the currently
observed, potentially partial week. This is the week after the last week
visible in an imported export, which could be historical if an old export was
loaded. The current partial week's counts are not used. At least 26 complete
weeks (16 with messages) are needed. Exponential smoothing uses a coefficient
selected from 0.2, 0.4, 0.6 and 0.8 with targets in the initial 18 weeks;
an observation is capped at three times the median of the last eight weeks
(minimum four) when forecasting so one isolated spike does not dominate.
The final eight weeks are held out from coefficient selection and are tested
at the same two-week horizon. The reference is the median of the four latest
weeks available at each origin. The model's mean absolute error must beat
that reference by at least 5% **and** be no higher than the larger of three
messages and 60% of the median weekly count in the latest eight weeks.
Otherwise the page shows no forecast. The displayed span surrounds the model
prediction by the seventh-smallest absolute error from its eight holdout
predictions: seven of eight *historical* errors were no larger, but there is
no statistical guarantee for a future week. This model has **not** been
validated on independent real chats; for one user's short example it should
show no prediction. Neither the forecast nor its fit describes interest,
affection or relationship quality.

The separate playful cards require 12 verified submitted messages, ordinal
pair scores and corroborating cues. A flirt reading requires warmth at least
two and two matches to a narrow compliment phrase; a developing-conversation
reading additionally requires reciprocity at least two and a recurring plans
or support topic. Both are suppressed when tension is at least two or a
direct-address insult phrase is detected. A quieter-chat card appears only
when the measured rhythm falls under the rules above. Every card includes a
plausible alternate explanation and is explicitly labelled an imaginative
reading of the excerpt. No probability of love, ghosting or future romance is
computed. Raw transcripts and small or contradictory samples have no such
cards. None of these interpretations, raw messages or forecast features is
sent to Jev or included automatically on the PNG/share card.

## Data and sharing

Parsed chat text and imported files are held in page memory, not stored by the
app. For recognised formats the **single** Jev request sends the newest
messages that fit the limit as `{ from, text }` via OpenRouter to TypeSafe;
local timestamps, local statistics and media files are excluded. For an
unrecognised format it sends a recent raw text excerpt and the two manually
entered names instead; the raw excerpt can include dates and other details.
The notice above the button explains both cases before any request is made.
This app does not log the chat, but cannot promise what external providers,
browser extensions or the device store.

The image card uses only its short duo vibe, sticker IDs and counted reasons,
at most one well-supported chat moment and the excerpt scope. By default phone
numbers are replaced and full names shortened to their first word. The visible
preview lists the card contents before download or Web Share. The page does not
upload the card to its own server. The chosen language and a key you enter may
be kept in browser `localStorage`; FakeorFriend uses its own storage keys
separate from JudgeYou. The delete button removes only your stored key. An
optional `js/key.js` provided by a deployment would still be available.

No public deployment is configured in this new repository. The 10–18 audience
includes children. For now, younger users should try only invented chats in
the local test preview, which makes no provider request. Before any public
launch, plan a child-appropriate experience, establish an appropriate basis
for handling the data of *both* chat participants, assess provider processing,
retention and age-related consent requirements, and keep API keys on a server
rather than publishing them in readable `js/key.js`. The UK Information
Commissioner's [Children's Code on profiling](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/12-profiling/)
recommends child profiling be off by default unless there is a compelling
best-interests reason. This is design guidance, not a conclusion that the
prototype is legally cleared in Germany or elsewhere.

## Local preview (no API key)

On Windows, from the FakeorFriend folder:

```powershell
npm.cmd test
node .\scripts\preview-server.mjs
```

Open the printed `http://127.0.0.1:...` URL in Edge or Chrome. This localhost
preview serves deterministic mock answers and blocks outgoing browser network
connections. It does not read a real key or send a Jev request. Use invented
chats. Stop it with Ctrl+C. Fonts are local fallbacks in this preview.

The normal page instead requires an OpenRouter key. Publishing this project
needs a separate deployment decision and a review of its data flow.

## Code

- `js/parse.js`, `js/parse-structured.js`, `js/stamps.js`, `js/files.js`: imports.
- `js/stats.js`: locally counted statistics.
- `js/questions.js`: bounded state and four Jev questions.
- `js/verdict.js`: excerpt label rule.
- `js/vibes.js`: map position, factual count shares and conversation idea.
- `js/animals.js`: local sticker selection and bounded story from existing scores.
- `js/moment.js`: one measured comparison with minimum observations and tie handling.
- `js/reading.js`, `js/highlights.js`: excerpt-specific personal readings and narrow local written-cue counts.
- `js/timeline.js`, `js/timeline-view.js`: local date buckets, cautious comparisons and accessible chart.
- `js/app.js`: input and result flow.
- `js/card.js`: the single image preview, download and Web Share flow.
- `js/locales/`: English, German, French and Spanish strings.
