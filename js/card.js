// The shareable verdict: one portrait image, drawn on a canvas so it can be
// downloaded or handed to the phone's share sheet. It shows names, types and
// counts, never chat text, and names can be changed before anything leaves.
import { t } from './i18n.js';
import { formatDuration, formatNumber, mascotOf, typeName } from './presentation.js';

const WIDTH = 1080;
const HEIGHT = 1350;
const MARGIN = 72;
const PHONE_NUMBER = /^[+\d][\d\s()./-]{5,}$/;

const $ = (id) => document.getElementById(id);
const images = new Map();

/** First names only, and no phone numbers, unless the user types them in. */
export function defaultNames(names) {
  let unknown = 0;
  return names.map((name) =>
    PHONE_NUMBER.test(name) ? t('unknownNumber', { n: ++unknown }) : name.split(/\s+/)[0],
  );
}

/** An emptied display field must never fall back to the original full name. */
export function shownCardName(shown, name) {
  return shown.get(name)?.trim() || t('cardAnonymous');
}

export function cardPreviewLines(verdict, shownName) {
  const people = verdict.people.map((person) => `${shownName(person.name)} · ${scoreLabel(person.flags)}${person.highlights.length
    ? ` · ${person.highlights.map(highlightLabel).join(' · ')}` : ''}`);
  return verdict.mode === 'partner' ? [t('chatModeResult', { mode: t('chatModes.partner') }), ...people] : people;
}

/**
 * `verdict` holds `suspect` (a name), `people` ({ name, type, flags, highlights })
 * and `records` ({ key, name, detail }), all with real names.
 */
export function openCard(verdict) {
  const dialog = $('card-dialog');
  const canvas = $('card-canvas');
  const names = verdict.people.map((p) => p.name);
  const defaults = defaultNames(names);
  const shown = new Map(names.map((name, i) => [name, defaults[i]]));
  const shownName = (name) => shownCardName(shown, name);
  const share = $('card-share');
  const download = $('card-download');
  const previewDetails = $('card-preview-details');
  let requested = 0;
  const redraw = async () => {
    const current = ++requested;
    share.disabled = true;
    download.disabled = true;
    previewDetails.replaceChildren(...cardPreviewLines(verdict, shownName).map((value) => {
      const line = document.createElement('li');
      line.textContent = value;
      return line;
    }));
    try {
      await drawCard(canvas, verdict, shownName);
      if (current === requested) {
        share.disabled = false;
        download.disabled = false;
      }
    } catch (error) {
      if (current === requested) previewDetails.replaceChildren(
        Object.assign(document.createElement('li'), { textContent: t('cardRenderError') }),
      );
    }
  };
  $('card-names').replaceChildren(
    ...verdict.people.map(({ name }) => {
      const input = document.createElement('input');
      input.value = shown.get(name);
      input.setAttribute('aria-label', name);
      input.addEventListener('input', () => {
        shown.set(name, input.value.trim());
        void redraw();
      });
      return input;
    }),
  );

  share.hidden = !navigator.canShare?.({ files: [new File([], 'x.png', { type: 'image/png' })] });
  share.onclick = async () => {
    try {
      await navigator.share({ files: [await asFile(canvas)], text: `${t('cardShareText')} · ${pageUrl()}` });
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    }
  };
  download.onclick = async () => {
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(await asFile(canvas)),
      download: 'judgeyou.png',
    });
    link.click();
    URL.revokeObjectURL(link.href);
  };

  dialog.showModal();
  void redraw();
}

function highlightLabel({ key, median, n }) {
  return key === 'reply'
    ? t('cardReplyHighlight', { time: formatDuration(median), n: formatNumber(n) })
    : t('cardCharsHighlight', { chars: formatNumber(median), n: formatNumber(n) });
}

function scoreLabel({ red, green }) {
  return `${t('cardRed', { score: red })} · ${t('cardGreen', { score: green })}`;
}

async function asFile(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return new File([blob], 'judgeyou.png', { type: 'image/png' });
}

function pageUrl() {
  return `${location.host}${location.pathname.replace(/index\.html$/, '')}`.replace(/\/$/, '');
}

function image(src) {
  if (!images.has(src)) {
    const img = new Image();
    img.src = src;
    images.set(src, img.decode().then(() => img));
  }
  return images.get(src);
}

// Waiting for fonts and images makes drawing async; typing a name starts a
// new draw, and an older one that finishes late must not paint over it.
let drawing = 0;

async function drawCard(canvas, { mode, suspect, people, records }, shownName) {
  const ticket = ++drawing;
  const style = getComputedStyle(document.documentElement);
  const token = (name) => style.getPropertyValue(name).trim();
  const color = { paper: token('--paper'), ink: token('--ink'), soft: token('--ink-soft'), muted: token('--ink-muted'), rule: token('--rule'), accent: token('--accent') };
  const display = (weight, size, italic = '') => `${italic} ${weight} ${size}px ${token('--font-display')}`;
  const body = (weight, size) => `${weight} ${size}px ${token('--font-body')}`;
  const mono = (weight, size) => `${weight} ${size}px ${token('--font-mono')}`;

  const suspectType = people.find((p) => p.name === suspect).type;
  const [mascots] = await Promise.all([
    Promise.all(people.map((p) => image(mascotOf(p.type)))),
    document.fonts.load(display(800, 96)),
    document.fonts.load(display(700, 44, 'italic')),
    document.fonts.load(body(600, 30)),
    document.fonts.load(mono(500, 20)),
  ]);
  if (ticket !== drawing) return;

  // Keep every person's two statistics readable even in an eight-person chat.
  const recordsBottom = 510 + (records.length ? 176 : 0);
  const height = Math.max(HEIGHT, recordsBottom + 10 + people.length * 140 + 110);
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const inner = WIDTH - 2 * MARGIN;
  ctx.fillStyle = color.paper;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textBaseline = 'alphabetic';

  const text = (value, x, y, font, fill, maxWidth, align = 'left') => {
    ctx.font = font;
    ctx.fillStyle = fill;
    ctx.textAlign = align;
    ctx.fillText(clip(ctx, value, maxWidth), x, y);
  };
  const rule = (y, weight = 1, fill = color.ink) => {
    ctx.fillStyle = fill;
    ctx.fillRect(MARGIN, y, inner, weight);
  };

  // Masthead
  text('JudgeYou', MARGIN, 96, display(700, 44, 'italic'), color.ink, 300);
  text((mode === 'partner' ? t('chatModes.partner') : t('tagline')).toUpperCase(), WIDTH - MARGIN, 92, mono(500, 18), color.muted, inner - 320, 'right');
  rule(120, 3);
  rule(127);

  // Prime suspect
  ctx.drawImage(mascots[people.findIndex((p) => p.name === suspect)], MARGIN - 20, 150, 330, 330);
  const textX = MARGIN + 340;
  const textWidth = WIDTH - MARGIN - textX;
  text(t(mode === 'partner' ? 'suspectPartner' : 'suspect').toUpperCase(), textX, 250, mono(500, 22), color.accent, textWidth);
  const suspectSize = fitSize(ctx, shownName(suspect), (s) => display(800, s), 104, textWidth);
  text(shownName(suspect), textX, 350, display(800, suspectSize), color.ink, textWidth);
  text(typeName(suspectType), textX, 405, body(600, 34), color.soft, textWidth);
  stamp(ctx, t(mode === 'partner' ? 'guiltyPartner' : 'guilty').toUpperCase(), WIDTH - MARGIN - 130, 455, mono(600, 30), color);

  // Records: the counted facts, next to Jev's opinions.
  let y = 510;
  rule(y);
  if (records.length) {
    const shownRecords = records.slice(0, 3);
    const column = inner / shownRecords.length;
    shownRecords.forEach((record, i) => {
      const x = MARGIN + i * column;
      const width = column - 24;
      text(t(`records.${record.key}.title`).toUpperCase(), x, y + 44, mono(500, 17), color.muted, width);
      text(shownName(record.name), x, y + 90, display(700, 38), color.ink, width);
      ctx.font = body(400, 18);
      lines(ctx, record.detail, width, 2).forEach((line, n) => text(line, x, y + 122 + n * 24, ctx.font, color.soft, width));
    });
    y += 176;
    rule(y);
  }

  // Everyone else, one row each.
  const bottom = height - 110;
  const rowHeight = Math.min(140, (bottom - y - 10) / people.length);
  people.forEach((person, i) => {
    const top = y + 10 + i * rowHeight;
    const size = rowHeight - 12;
    ctx.drawImage(mascots[i], MARGIN - 8, top + 6, size, size);
    const nameSize = Math.min(38, rowHeight * 0.31);
    const lineX = MARGIN + size + 16;
    const lineWidth = inner - size - 260;
    text(shownName(person.name), lineX, top + 39, display(700, nameSize), color.ink, lineWidth);
    text(typeName(person.type), lineX, top + 67, body(500, 20), color.soft, lineWidth);
    person.highlights.slice(0, 2).forEach((highlight, j) =>
      text(highlightLabel(highlight), lineX, top + 93 + j * 23, mono(500, 17), color.ink, lineWidth),
    );
    text(t('cardRed', { score: person.flags.red }), WIDTH - MARGIN, top + 44, mono(600, 20), color.accent, 240, 'right');
    text(t('cardGreen', { score: person.flags.green }), WIDTH - MARGIN, top + 72, mono(500, 19), color.soft, 240, 'right');
    text(t('cardGameScore').toUpperCase(), WIDTH - MARGIN, top + 98, mono(500, 15), color.muted, 240, 'right');
    if (i < people.length - 1) rule(top + rowHeight, 1, color.rule);
  });

  // Footer
  rule(height - 86, 3);
  text(pageUrl(), MARGIN, height - 40, mono(500, 22), color.ink, inner / 2);
  text(t('cardGameScore').toUpperCase(), WIDTH - MARGIN, height - 40, mono(500, 18), color.muted, inner / 2, 'right');
}

/** The largest size up to `size` at which `value` fits `maxWidth`, down to half of it. */
function fitSize(ctx, value, font, size, maxWidth) {
  const smallest = Math.round(size / 2);
  for (; size > smallest; size -= 4) {
    ctx.font = font(size);
    if (ctx.measureText(value).width <= maxWidth) return size;
  }
  return smallest;
}

/** Word-wrapped lines for the current font; the last one is clipped if needed. */
function lines(ctx, value, maxWidth, maxLines) {
  const result = [''];
  for (const word of value.split(' ')) {
    const candidate = result.at(-1) ? `${result.at(-1)} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !result.at(-1)) result[result.length - 1] = candidate;
    else if (result.length < maxLines) result.push(word);
    else {
      result[result.length - 1] = candidate;
      break;
    }
  }
  return result;
}

function clip(ctx, value, maxWidth) {
  if (ctx.measureText(value).width <= maxWidth) return value;
  let cut = value;
  while (cut && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

function stamp(ctx, label, x, y, font, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-11 * Math.PI) / 180);
  ctx.globalAlpha = 0.88;
  ctx.font = font;
  const width = ctx.measureText(label).width + 44;
  ctx.strokeStyle = color.accent;
  ctx.lineWidth = 5;
  ctx.strokeRect(-width / 2, -30, width, 60);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-width / 2 + 7, -23, width - 14, 46);
  ctx.fillStyle = color.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 2);
  ctx.restore();
}
