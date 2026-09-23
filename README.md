# FakeorFriend

This repository starts as a separate copy of the working JudgeYou prototype.
Its current interface and questions still say JudgeYou until the planned
two-person conversation redesign is implemented. The JudgeYou repository is
independent and remains untouched by changes made here.

A one-page field guide that judges the people in a group chat, pseudo-scientifically.
It sends the chat to [Jev](https://docs.typesafe.ai/), TypeSafe's decision model,
through OpenRouter's Decisions endpoint, and gets calibrated probabilities back
instead of prose. Each person is classified as one of twelve types, each with an
engraved mascot. Everything runs in the browser; there is no backend.

Chats can be pasted, dropped or opened as exports from WhatsApp (also the ZIP
"with media"), Telegram (JSON, HTML, copy-paste), Messenger and Instagram,
Discord, Slack, Teams, iMessage exporters, IRC, LINE, KakaoTalk, CSV, or plain
`Name: message` text. If the format isn't recognised, the page asks who is in
the chat and Jev reads the raw text.

Next to Jev's verdicts, the page shows numbers it counts itself, without any
request: messages, median words per message and median reply time. A reply is
the gap between someone else's last message and a person's next one; after 6
hours of silence the next message starts a new conversation instead. Medians
need at least 3 observations, and a record ("Slowest thumbs") needs a clear
winner.

`js/stats.js` also computes `textLength` for each person when there are at least
3 text messages: median and maximum word count, median and maximum character
count, and the number of messages (`n`). Characters mean Unicode code points;
spaces and line breaks count. Only numeric lengths are retained by this
statistic, never the longest message's contents. The older `medianWords` field
remains available for the existing results page. Untimed messages at the end
of a sender's block cannot be used to time the next person's reply.

The results can be shared as an image. It shows names, types and counts, never
chat text; names default to first names, phone numbers are hidden, and all of
them can be edited first.

The card also shows up to two locally counted numbers per person: median reply
time (at least 3 measured replies) and median text length in Unicode code
points (at least 3 text messages). Each number shows its sample size. The
preview lists the displayed names and values before sharing. Empty edited
names become "Anonymous" rather than revealing the original name.

The Green/Red percentages are **play scores**, not probabilities of real
personality traits. Red is the rounded Menace Index: 35% normalized passive
aggression score + 30% normalized drama score + 25% normalized main-character
score + 10% "started it" value. Green = 100 − Red. Other themes such as
cat/dog or fluffy/thorny are deferred until each has a distinct explainable
rule; no chat text or media is sent to make the image.

The page speaks English, German, French and Spanish, picked from the browser's
language and switchable in the header.

## Chat context

The default **Group chat** mode uses the original Jev questions unchanged.
**Partner chat** is a first experiment for a conversation between two people:
both speakers must be recognised and selected. Merely picking two people in a
larger group does not qualify, since the request would still include everyone
else's messages. For an unrecognised transcript the user supplies exactly two
names, but the page cannot verify whether the raw text contains other people.
The selected mode is kept with the verdict in memory so changing the dropdown
or language does not relabel an older verdict. It is shown on the result and
the partner share card. The same local statistics, share flow, answer keys and
Menace Index apply; no mode is sent as extra chat data. Exactly one Jev
request is made per judgment. A rare token-limit error now displays an error
instead of retrying with less chat text.

The twelve playful Jev type keys stay the same. Partner criteria replace group
examples with two-person evidence:

| Type | Partner criterion focuses on |
| --- | --- |
| Giga Chad | unusually blunt, self-assured replies to the other person |
| Golden Retriever | repeated warmth and encouragement |
| Cat | selective distance and unanswered direct questions |
| Chaos Goblin | recurring abrupt jokes and tangents |
| Dragon | controlling the exchange or the other person's decisions |
| Owl | repeated correction and unsolicited explanations |
| Sloth | little participation, leaving the other person to carry the chat |
| Mother Hen | excessive check-ins, reminders or planning for one person |
| Troll | baiting the other person rather than shared joking |
| Drama Llama | escalating small misunderstandings and guilt trips |
| Mosquito | repeated indirect digs at the other person |
| NPC | repeated empty agreement or filler |

The culprit choice asks about tension *in the messages shown*. Personal type,
passive aggression, effort and drama questions likewise name the exchange,
while "started it" and "secretly right" require an actual disagreement;
"dodges questions" does not infer read receipts from elapsed time. The
main-character scale uses a two-person legend on both the request and the
results. Other score levels and the score formula remain the same. Partner
results use a neutral type note instead of group-oriented comic biographies.

Jev still has to pick one person for the culprit and one type per person, even
in a friendly chat with no disagreement. A partner-mode verdict is not an
assessment of the relationship or anyone's real personality. Friends and
family modes have not been added.

## Data flow and public use

- Before judging, an imported file or pasted transcript is read into the page
  and parsed in the browser. Counts, lengths, records and reply times are
  calculated there. The raw transcript and parsed messages remain in memory
  while the page is open; the app does not write them to browser storage.
- Clicking "Judge them" uses one OpenRouter Decisions request for Jev by
  TypeSafe. For recognised formats, `js/questions.js` sends the newest
  messages that fit the limit as `{ from, text }`; parsed timestamps and local
  statistics are excluded from the request state. Selected names also occur
  in the questions. If fewer than two speakers are recognised (including an
  unrecognised format), it sends the selected names and
  the newest fitting excerpt of the *raw transcript*, which may include
  timestamps or other details present in that raw text.
- `js/jev.js` sends the OpenRouter key as an Authorization header. A personal
  key entered in the form is saved in this browser's `localStorage`; the
  "Delete saved personal key" button removes only that saved key. If present,
  `js/key.js` still supplies a key after deletion. The selected language is
  also saved in `localStorage`. The app has no backend and does not log chat
  content, but these statements do not describe retention by OpenRouter,
  TypeSafe, browser extensions or the device.
- The share card is drawn locally from verdicts, names and numeric highlights.
  No chat text is passed to its drawing code. The preview shows the names and
  numbers before PNG download or Web Share; a share action can hand the image
  to the device's share destination. Neither action uploads the card to this
  site's server.

For public operation, determine how chat participants are informed, the
applicable lawful basis and provider retention/processing terms, the safety of
handling third-party messages, and who can use or spend the API key. The
current Pages workflow publishes a configured `OPENROUTER_KEY` in readable
`js/key.js`, even when it is set as a deployment secret; a credit cap alone is
not access control. These questions need review before a public launch; this
README does not claim legal clearance.

## Run locally

```sh
echo "export const OPENROUTER_KEY = 'sk-or-…';" > js/key.js   # git-ignored
npm start        # serves http://localhost:8000
npm test
```

Without `js/key.js`, the page asks for a key and keeps it in `localStorage`.

## Local browser preview without an API key

From the repo folder, run `node scripts/preview-server.mjs` and open the
`http://127.0.0.1:...` address it prints in Edge or Chrome. This separate
preview replaces `js/jev.js` only in the response with deterministic test
answers. It does not read or save an API key, and its Content Security Policy
blocks outgoing browser connections. It listens only on the loopback interface
and uses a random port; stop it with Ctrl+C. The yellowish banner counts
simulated verdict calls. Use made-up chats: the results are fixtures, not real
Jev judgments. Remote fonts do not load in this preview, so inspect fine
typography later in the normal app. A downloaded PNG stays on your device;
choose a share destination only if you intend to share the test image.

## Deploy

Pushing to `main` deploys to GitHub Pages (Settings → Pages → Source: GitHub Actions).
If the repository has an `OPENROUTER_KEY` secret, the workflow bakes it into the
deployed `js/key.js`. Anyone can read it from there, so use a separate key with a
low credit limit.

## Where things live

- `js/parse.js`, `js/parse-structured.js`: chat formats. `js/stamps.js`: their timestamps.
- `js/files.js`: opening files, including WhatsApp ZIPs.
- `js/stats.js`: the counted numbers and records.
- `js/card.js`: the share image.
- `js/questions.js`: what Jev is asked. One request judges everyone at once.
- `js/verdict.js`: how answers combine into the Menace Index (weights are ours).
- `js/presentation.js`: the twelve types, mascots (`img/types/`) and number formats.
- `js/locales/`: every visible string, one file per language; `js/i18n.js` picks one.
- `css/theme.css`: every raw color value.
