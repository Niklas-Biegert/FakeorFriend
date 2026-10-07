import { parseChat, participantsOf } from './parse.js';
import { buildRequest, canJudgeSubjects, hasEnoughMessages, readVerdicts, DIMENSIONS, STATE_TOKEN_BUDGET } from './questions.js';
import { askJev, findApiKey, forgetApiKey, isApiKey, rememberApiKey } from './jev.js';
import { interactionLabel, normalisedScore } from './verdict.js';
import { chatStats, recordsOf } from './stats.js';
import { FileError, readChatFile } from './files.js';
import { openCard } from './card.js';
import { LANGUAGES, lang, setLanguage, t, translatePage } from './i18n.js';
import { formatDuration, formatNumber, percent, recordDetail, statisticNotes, textLengthPresentation } from './presentation.js';
import { SAMPLE_CHAT } from './sample.js';
import { vibePoint, messageBalance, conversationIdea } from './vibes.js';
import { animalDuo, duoStory } from './animals.js';
import { timelineOf } from './timeline.js';
import { renderTimeline } from './timeline-view.js';
import { duoDetail, personReadings } from './reading.js';
import { highlightCues } from './highlights.js';
import { outlookOf } from './outlook.js';
import { renderOutlook } from './outlook-view.js';
import { createSound } from './sound.js';
import { chatMoment, momentVars } from './moment.js';

const $ = (id) => document.getElementById(id);
const chat = $('chat');
const judgeButton = $('judge');
const namesForm = $('names-form');
const keyForm = $('key-form');
const errorBox = $('error');
const lab = $('lab');
const results = $('results');
const sound = createSound();
let messages = [];
let detected = [];
let typedNames = [];
let lastVerdict = null;
let judging = false;
let chatRevision = 0;
const fromTemplate = (id) => $(id).content.firstElementChild.cloneNode(true);
const isRawMode = () => detected.length < 2;
const candidates = () => isRawMode() ? typedNames : detected;
function setStage(stage) {
  for (const step of document.querySelectorAll('.journey-step')) {
    const selected = step.dataset.stage === stage;
    step.classList.toggle('is-current', selected);
    if (selected) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  }
}

function renderLanguagePicker() {
  const picker = $('language');
  picker.replaceChildren(...Object.entries(LANGUAGES).map(([code, name]) => new Option(name, code, false, code === lang)));
  picker.addEventListener('change', () => {
    setLanguage(picker.value);
    translatePage();
    if (!lab.hidden) {
      [...$('lab-log').children].forEach((item, index) => { item.textContent = t('lab')[index]; });
      const active = $('lab-log').querySelector('.is-active');
      if (active) $('lab-phase').textContent = active.textContent;
    }
    renderSubjects();
    if (lastVerdict) renderResults(lastVerdict, { scroll: false });
    renderSound();
  });
}
function renderSound() {
  const toggle = $('sound-toggle');
  toggle.setAttribute('aria-pressed', String(sound.enabled));
  toggle.textContent = `${sound.enabled ? '♪' : '♩'} ${t(sound.enabled ? 'soundOn' : 'soundOff')}`;
}
function renderSubjects() {
  const people = candidates();
  const box = $('subjects');
  box.replaceChildren(...people.map((name) => Object.assign(document.createElement('span'), { className: 'chip', textContent: name })));
  $('pair-hint').hidden = people.length === 2 && (isRawMode() || hasEnoughMessages(messages.map(({ author, text }) => ({ from: author, text })), people));
  judgeButton.disabled = judging || !canJudgeSubjects(people.length, people.length) || (!isRawMode() && !hasEnoughMessages(messages.map(({ author, text }) => ({ from: author, text })), people));
}
function onChatChanged() {
  chatRevision++;
  lastVerdict = null;
  results.hidden = true;
  setStage('input');
  messages = parseChat(chat.value);
  detected = participantsOf(messages).map((p) => p.name);
  typedNames = [];
  namesForm.hidden = !chat.value.trim() || !isRawMode();
  $('raw-notice').hidden = !chat.value.trim() || !isRawMode();
  renderSubjects();
}
function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}
async function loadFile(file) {
  errorBox.hidden = true;
  try {
    chat.value = await readChatFile(file);
    onChatChanged();
  } catch (error) {
    showError(error instanceof FileError ? t(`errors.${error.message}`) : error.message);
  }
}
function runLab() {
  const log = $('lab-log');
  log.replaceChildren(...t('lab').map((label) => Object.assign(document.createElement('li'), { textContent: label })));
  lab.hidden = false;
  setStage('analyse');
  let current = -1;
  const advance = () => {
    if (current >= log.children.length - 1) return;
    if (current >= 0) log.children[current].classList.replace('is-active', 'is-done');
    log.children[++current].classList.add('is-active');
    $('lab-phase').textContent = log.children[current].textContent;
  };
  advance(); advance(); // The request is about to begin; this is not a percentage.
  return { next: advance, stop: () => { lab.hidden = true; } };
}
async function judgeChat() {
  if (judging || judgeButton.disabled) return;
  // Start audio in the user's click task; an awaited key lookup may lose
  // browser audio activation, especially for a dynamically imported key.
  sound.play();
  judging = true;
  renderSubjects();
  errorBox.hidden = true;
  try {
    const apiKey = await findApiKey();
    if (!apiKey) { keyForm.hidden = false; $('key').focus(); return; }
    // Freeze the chat and speakers after the asynchronous key lookup.
    const people = candidates().slice();
    const rawMode = isRawMode();
    const evidence = rawMode ? chat.value : messages.slice();
    if (!canJudgeSubjects(people.length, people.length)) return;
    const request = buildRequest(evidence, people, STATE_TOKEN_BUDGET);
    if (!rawMode && !hasEnoughMessages(request.body.state.messages, people)) {
      showError(t('errors.tooFew')); return;
    }
    const judgedRevision = chatRevision;
    keyForm.hidden = true;
    lastVerdict = null;
    results.hidden = true;
    const labState = runLab();
    try {
      const started = performance.now();
      const response = await askJev(apiKey, request.body);
      if (judgedRevision !== chatRevision) return;
      labState.next();
      lastVerdict = {
        people,
        answers: readVerdicts(response.answers),
        rawMode,
        stats: rawMode ? null : chatStats(evidence),
        stickerStats: rawMode ? null : chatStats(evidence.slice(-request.judgedCount)),
        cues: highlightCues(rawMode ? null : request.body.state.messages, people, { raw: rawMode }),
        timeline: rawMode ? null : timelineOf(evidence, people),
        meta: { judgedCount: request.judgedCount, totalCount: rawMode ? null : evidence.length,
          truncated: request.truncated, ms: Math.round(performance.now() - started), model: response.model, cost: response.usage?.cost },
      };
      renderResults(lastVerdict);
      labState.next();
      setStage('result');
    } catch (error) {
      if (error.status === 401) { forgetApiKey(); keyForm.hidden = false; }
      showError(error.status ? t('errors.jev', { status: error.status, reason: error.reason }) : error.message);
    } finally { labState.stop(); }
  } finally { judging = false; if (!lastVerdict) setStage('input'); renderSubjects(); }
}
function fact(label, value, definition, detail) {
  const item = fromTemplate('finding');
  item.querySelector('dt').textContent = label;
  item.querySelector('dd').textContent = value;
  if (definition) item.title = definition;
  if (detail) item.prepend(Object.assign(document.createElement('small'), { textContent: detail }));
  return item;
}
function scale(key, answer) {
  const levels = t(`levels.${key}`);
  const meter = fromTemplate('scale');
  meter.style.setProperty('--segments', levels.length - 1);
  meter.querySelector('.scale-name').textContent = t(`traits.${key}`);
  meter.querySelector('.scale-confidence').textContent = '';
  meter.querySelector('.fill').dataset.width = percent(normalisedScore(answer));
  meter.querySelector('.scale-level').textContent = levels[Math.max(0, Math.min(3, Math.round(answer.score)))];
  const track = meter.querySelector('.track');
  track.setAttribute('role', 'img');
  track.setAttribute('aria-label', t('scaleAccessible', { trait: t(`traits.${key}`), score: answer.score, level: meter.querySelector('.scale-level').textContent }));
  meter.append(Object.assign(document.createElement('p'), { className: 'scale-explainer', textContent: t(`traitExplainers.${key}`) }));
  return meter;
}
function plate(name, stats, people) {
  const card = fromTemplate('plate');
  card.querySelector('.plate-name').textContent = name;
  const notes = statisticNotes(stats, people, name);
  const caption = card.querySelector('.stats-caption');
  if (notes.length) {
    caption.replaceChildren(...notes.map((text) => Object.assign(document.createElement('p'), { textContent: text })));
    caption.hidden = false;
  }
  const counts = stats?.get(name);
  const counted = card.querySelector('.counted');
  if (counts) {
    const length = textLengthPresentation(counts);
    counted.append(
      fact(t('counted.messages'), formatNumber(counts.messages)),
      fact(t('counted.words'), formatNumber(counts.medianWords), t('counted.wordsDefinition')),
      fact(t('counted.medianChars'), length.median, t('counted.medianCharsDefinition'), length.sample),
      fact(t('counted.longest'), length.longest, t('counted.longestDefinition')),
      fact(t('counted.reply'), counts.reply ? formatDuration(counts.reply.median) : '–',
        `${t('counted.replyDefinition')}${counts.reply ? ` (n = ${counts.reply.n})` : ''}`),
    );
    if (length.note) counted.after(Object.assign(document.createElement('p'), { className: 'counted-note', textContent: length.note }));
  } else counted.remove();
  return card;
}
function record(entry) {
  const box = document.createElement('div');
  box.className = 'record';
  box.append(
    Object.assign(document.createElement('span'), { textContent: t(`records.${entry.key}.title`) }),
    Object.assign(document.createElement('strong'), { textContent: entry.name }),
    Object.assign(document.createElement('small'), { textContent: recordDetail(entry) }),
  );
  return box;
}
function renderResults({ people, answers, rawMode, stats, stickerStats, timeline, cues, meta }, { scroll = true } = {}) {
  const label = interactionLabel(answers, { raw: rawMode });
  const story = duoStory(answers, { raw: rawMode, n: meta.judgedCount });
  const animals = animalDuo(stickerStats, people, { raw: rawMode || story === 'uncertain' });
  const storyVars = Object.fromEntries(DIMENSIONS.map((key) => [key, answers[key].score]));
  storyVars.n = meta.judgedCount;
  $('connection-label').textContent = t(`connection.${label}`);
  $('connection-note').textContent = t(rawMode ? 'connection.rawNote' : 'connection.note');
  $('story-title').textContent = t(`story.${story}.title`);
  $('story-body').textContent = t(`story.${story}.body`, storyVars);
  const extra = story !== 'uncertain' && duoDetail(stickerStats, people, { raw: rawMode });
  $('duo-extra').textContent = extra ? t(`reading.duo.${extra.key}`, extra.vars) : '';
  $('duo-extra').hidden = !extra;
  const moment = chatMoment(stickerStats, people, { raw: rawMode, truncated: meta.truncated });
  $('moment-title').textContent = t(`moment.${moment?.key ?? 'empty'}.title`);
  $('moment-detail').textContent = t(`moment.${moment?.key ?? 'empty'}.detail`,
    momentVars(moment, (name) => name, formatDuration));
  $('person-readings').replaceChildren(...personReadings(stickerStats, people, { raw: rawMode, truncated: meta.truncated }).map((reading) => {
    const article = document.createElement('article');
    article.className = 'reading-card';
    const name = document.createElement('p'); name.className = 'reading-name'; name.textContent = reading.name;
    const heading = document.createElement('h4'); heading.textContent = t(`reading.headings.${reading.title}`);
    const body = document.createElement('p');
    body.textContent = reading.lines.map(({ key, vars }) => t(`reading.lines.${key}`, {
      ...vars,
      ...(key === 'reply' ? { time: formatDuration(vars.duration) } : {}),
    })).join(' ');
    article.append(name, heading, body);
    return article;
  }));
  const cueCard = (section, item) => {
    const card = document.createElement('article'); card.className = 'cue-card';
    const heading = document.createElement('h4'); heading.textContent = t(`cues.${section}.${item.key}.title`);
    const body = document.createElement('p');
    body.textContent = t(`cues.${section}.${item.key}.detail`, { n: formatNumber(item.n), total: formatNumber(cues.checked) });
    card.append(heading, body); return card;
  };
  $('topic-cards').replaceChildren(...cues.topics.map((item) => cueCard('topics', item)));
  $('topic-empty').hidden = cues.topics.length > 0;
  $('topic-empty').textContent = t(cues.checked === null ? 'cues.raw' : 'cues.noTopics');
  $('tone-cards').replaceChildren(...cues.tone.map((item) => cueCard('tone', item)));
  $('tone-empty').hidden = cues.tone.length > 0;
  $('tone-empty').textContent = t(cues.checked === null ? 'cues.raw' : 'cues.noTone');
  const showCoarse = cues.checked !== null && meta.judgedCount >= 6;
  $('tone-overview').hidden = !showCoarse;
  if (showCoarse) $('tone-overview').textContent = t('cues.coarse', {
    warmth: formatNumber(answers.warmth.score), tension: formatNumber(answers.tension.score),
    n: formatNumber(meta.judgedCount),
  });
  $('animal-duo').replaceChildren(...people.map((name, i) => {
    const sticker = animals[i];
    const box = document.createElement('div'); box.className = 'animal-sticker';
    box.dataset.animal = sticker.key;
    const picture = document.createElement('img');
    picture.src = `img/animals/${sticker.key}.svg`;
    picture.alt = '';
    const heading = document.createElement('strong');
    heading.textContent = name;
    const animalName = document.createElement('span'); animalName.className = 'animal-label';
    animalName.textContent = t(`animals.${sticker.key}.name`);
    const why = document.createElement('p');
    why.textContent = t(`animals.${sticker.key}.why`, sticker);
    box.append(picture, heading, animalName, why);
    return box;
  }));
  $('vibe-sticker').src = `img/vibes/${label}.svg`;
  $('connection-scales').replaceChildren(...DIMENSIONS.map((key) => scale(key, answers[key])));
  const point = vibePoint(answers, rawMode);
  $('map-panel').hidden = !point;
  if (point) {
    $('map-n').textContent = t('visual.sample', { n: formatNumber(meta.judgedCount) });
    const map = $('vibe-map');
    map.setAttribute('aria-label', t('visual.mapAccessible', {
      warmth: formatNumber(answers.warmth.score), tension: formatNumber(answers.tension.score),
    }));
    $('map-dot').style.left = `${point.x * 100}%`;
    $('map-dot').style.bottom = `${point.y * 100}%`;
  }
  const balance = messageBalance(stats, people);
  $('balance-panel').hidden = !balance;
  if (balance) $('balance-bars').replaceChildren(...people.map((name, i) => {
    const row = document.createElement('div');
    row.className = 'balance-row';
    const header = document.createElement('div');
    header.className = 'balance-row-head';
    header.append(
      Object.assign(document.createElement('strong'), { textContent: name }),
      Object.assign(document.createElement('span'), { textContent: t('visual.messages', { count: formatNumber(balance.counts[i]) }) }),
    );
    const track = document.createElement('div');
    track.className = 'balance-track';
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', t('visual.balanceAccessible', {
      name, count: formatNumber(balance.counts[i]), total: formatNumber(balance.total),
    }));
    const fill = document.createElement('span');
    fill.style.width = `${balance.shares[i] * 100}%`;
    track.append(fill);
    row.append(header, track);
    return row;
  }));
  renderTimeline($('timeline-content'), timeline, people);
  renderOutlook($('outlook-content'), outlookOf(timeline, cues, answers, { raw: rawMode, judgedCount: meta.judgedCount }));
  $('conversation-idea').textContent = t(`ideas.${conversationIdea(answers, rawMode, cues.topics.map(({ key }) => key))}`);
  const records = stats ? recordsOf(stats, people) : [];
  $('records').replaceChildren(...records.map(record));
  $('records').hidden = !records.length;
  $('plates').replaceChildren(...people.map((name) => plate(name, stats, people)));
  const evidence = meta.judgedCount === null ? t(meta.truncated ? 'evidenceRawTruncated' : 'evidenceRaw')
    : meta.truncated ? t('evidenceTruncated', { n: meta.judgedCount, total: meta.totalCount })
      : t('evidenceAll', { n: meta.judgedCount });
  const cost = meta.cost === undefined ? '' : ` · $${meta.cost.toFixed(6)}`;
  $('footnote').textContent = `${evidence} · ${meta.model} · ${meta.ms} ms${cost}`;
  $('scope-note').textContent = t(rawMode ? 'scopeRaw' : meta.truncated ? 'scopePartial' : 'scopeFull', {
    n: meta.judgedCount, total: meta.totalCount,
  });
  $('share').onclick = () => openCard({ story, animals, moment,
    scope: rawMode ? null : { total: meta.totalCount, judged: meta.judgedCount },
    people: people.map((name) => ({ name })) });
  if (scroll) for (const detail of results.querySelectorAll('.explore-panel')) detail.open = false;
  results.hidden = false;
  results.classList.toggle('revealed', scroll);
  if (scroll) {
    $('duo-title').focus({ preventScroll: true });
    results.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    for (const fill of results.querySelectorAll('.fill')) fill.style.width = fill.dataset.width;
  }));
}
translatePage();
renderLanguagePicker();
renderSound();
$('sound-toggle').addEventListener('click', () => { sound.toggle(); renderSound(); });
chat.addEventListener('input', onChatChanged);
chat.addEventListener('dragover', (event) => { event.preventDefault(); chat.classList.add('dragging'); });
chat.addEventListener('dragleave', () => chat.classList.remove('dragging'));
chat.addEventListener('drop', (event) => { event.preventDefault(); chat.classList.remove('dragging'); const file = event.dataTransfer.files[0]; if (file) loadFile(file); });
$('open-file').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', () => { const file = $('file').files[0]; $('file').value = ''; if (file) loadFile(file); });
$('sample').addEventListener('click', () => { chat.value = SAMPLE_CHAT; onChatChanged(); });
judgeButton.addEventListener('click', judgeChat);
$('clear-key').addEventListener('click', () => {
  forgetApiKey(); $('key').value = '';
  const status = $('key-status'); status.dataset.i18n = 'keyCleared'; status.textContent = t('keyCleared'); status.hidden = false;
});
namesForm.addEventListener('submit', (event) => {
  event.preventDefault();
  chatRevision++;
  lastVerdict = null;
  results.hidden = true;
  setStage('input');
  typedNames = [...new Set($('names').value.split(',').map((n) => n.trim()).filter(Boolean))];
  renderSubjects();
});
keyForm.addEventListener('submit', (event) => {
  event.preventDefault(); const key = $('key').value.trim();
  if (!isApiKey(key)) { showError(t('errors.badKey')); return; }
  rememberApiKey(key); $('key').value = ''; $('key-status').hidden = true; renderSubjects(); judgeChat();
});
