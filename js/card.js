// One share flow for PNG and Web Share. The canvas and visible checklist use
// the same curated, editable names, sticker reasons, vibe and one local fact.
import { t } from './i18n.js';
import { formatDuration } from './presentation.js';
import { momentVars } from './moment.js';
import { ANIMALS } from './animals.js';
const PHONE_NUMBER = /^[+\d][\d\s()./-]{5,}$/;
const $ = (id) => document.getElementById(id);
let cardGeneration = 0;
export function defaultNames(names) {
  let unknown = 0;
  return names.map((name) => PHONE_NUMBER.test(name) ? t('unknownNumber', { n: ++unknown }) : name.split(/\s+/)[0]);
}
export function shownCardName(shown, name) {
  return shown.get(name)?.trim() || t('cardAnonymous');
}
// Both the visible checklist and the PNG consume this one curated model.
// Only edited names, animal rules, one selected moment and the scope enter it.
export function cardCopy(verdict, shownName) {
  return {
    vibe: t(`cardVibe.${verdict.story ?? 'uncertain'}`),
    people: verdict.people.slice(0, 2).map((person, i) => {
      const candidate = verdict.animals?.[i] ?? { key: 'neutral' };
      const animal = ANIMALS.includes(candidate.key) ? candidate : { key: 'neutral' };
      return { name: shownName(person.name), animal: t(`animals.${animal.key}.name`),
        reason: t(`animals.${animal.key}.why`, animal), key: animal.key };
    }),
    moment: verdict.moment ? t(`moment.${verdict.moment.key}.card`,
      momentVars(verdict.moment, shownName, formatDuration)) : null,
    scope: verdict.scope ? cardScope(verdict.scope) : null,
  };
}
export function cardPreviewLines(verdict, shownName) {
  const copy = cardCopy(verdict, shownName);
  return [copy.vibe, ...copy.people.map(({ name, animal, reason }) => `${name} · ${animal} · ${reason}`),
    ...(copy.moment ? [copy.moment] : []), ...(copy.scope ? [copy.scope] : [])];
}
function cardScope({ judged, total }) {
  return t(judged < total ? 'cardScopePartial' : 'cardScopeFull', { n: judged, total });
}
async function asFile(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG unavailable');
  return new File([blob], 'fakeorfriend.png', { type: 'image/png' });
}
function drawAnimal(ctx, x, y, sticker) {
  const colors = { mouse: '#c0e8ff', cat: '#dccbff', dog: '#f2db91', hedgehog: '#f9c4ac', owl: '#d8a8f5', rabbit: '#c1e9dc', tortoise: '#b9dc91', neutral: '#d8d0df' };
  const key = sticker?.key ?? 'neutral';
  ctx.fillStyle = colors[key] ?? colors.neutral;
  ctx.beginPath(); ctx.roundRect(x, y, 340, 235, 42); ctx.fill();
  ctx.fillStyle = '#39283d';
  if (key === 'cat') {
    for (const offset of [85, 255]) { ctx.beginPath(); ctx.moveTo(x + offset - 35, y + 100); ctx.lineTo(x + offset, y + 32); ctx.lineTo(x + offset + 35, y + 100); ctx.fill(); }
  } else if (key === 'hedgehog') {
    for (let i = 0; i < 7; i++) { const left = x + 65 + i * 35; ctx.beginPath(); ctx.moveTo(left, y + 105); ctx.lineTo(left + 17, y + 35 + (i % 2) * 18); ctx.lineTo(left + 36, y + 105); ctx.fill(); }
  } else if (key === 'mouse' || key === 'dog') {
    for (const offset of [85, 255]) { ctx.beginPath(); ctx.arc(x + offset, y + (key === 'mouse' ? 84 : 112), 44, 0, Math.PI * 2); ctx.fill(); }
  }
  if (key === 'rabbit') {
    for (const offset of [130, 210]) { ctx.beginPath(); ctx.ellipse(x + offset, y + 54, 23, 65, offset === 130 ? -.2 : .2, 0, Math.PI * 2); ctx.fill(); }
  }
  if (key === 'owl') {
    ctx.beginPath(); ctx.moveTo(x + 66, y + 112); ctx.lineTo(x + 87, y + 39); ctx.lineTo(x + 133, y + 112); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 207, y + 112); ctx.lineTo(x + 253, y + 39); ctx.lineTo(x + 274, y + 112); ctx.fill();
  }
  if (key === 'tortoise') {
    ctx.fillStyle = '#689258'; ctx.beginPath(); ctx.ellipse(x + 170, y + 126, 113, 106, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = colors[key] ?? colors.neutral;
  ctx.beginPath(); ctx.ellipse(x + 170, y + 137, 105, 85, 0, 0, Math.PI * 2); ctx.fill();
  if (key === 'owl') {
    ctx.fillStyle = '#fff4e4';
    for (const offset of [132, 208]) { ctx.beginPath(); ctx.arc(x + offset, y + 137, 22, 0, Math.PI * 2); ctx.fill(); }
  }
  if (key === 'tortoise') {
    ctx.strokeStyle = '#5b8752'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x + 170, y + 79, 61, Math.PI, 0); ctx.stroke();
  }
  ctx.fillStyle = '#39283d';
  for (const offset of [132, 208]) { ctx.beginPath(); ctx.arc(x + offset, y + 135, 8, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(x + 170, y + 168, 8, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#39283d'; ctx.beginPath(); ctx.arc(x + 170, y + 175, 23, 0.2, Math.PI - 0.2); ctx.stroke();
}
function drawWrapped(ctx, value, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = value.split(/\s+/);
  let start = 0;
  for (let row = 0; row < maxLines && start < words.length; row++) {
    if (row === maxLines - 1) { ctx.fillText(words.slice(start).join(' '), x, y + row * lineHeight, maxWidth); break; }
    let end = start + 1;
    while (end < words.length && ctx.measureText(words.slice(start, end + 1).join(' ')).width <= maxWidth) end++;
    ctx.fillText(words.slice(start, end).join(' '), x, y + row * lineHeight, maxWidth);
    start = end;
  }
}
export function drawCard(canvas, verdict, shownName, images = []) {
  const ctx = canvas.getContext('2d');
  const copy = cardCopy(verdict, shownName);
  canvas.width = 1080;
  canvas.height = 1350;
  ctx.fillStyle = '#171420';
  ctx.fillRect(0, 0, 1080, 1350);
  const paint = (value, x, y, size, color = '#faf3f7', max = 900, weight = 700) => {
    ctx.font = `${weight} ${size}px system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(value, x, y, max);
  };
  // No transcript or external images are loaded. This model also drives the
  // user's explicit pre-share checklist.
  const gradient = ctx.createLinearGradient(0, 0, 1080, 930);
  gradient.addColorStop(0, '#4d3467'); gradient.addColorStop(1, '#204559');
  ctx.fillStyle = gradient; ctx.beginPath(); ctx.roundRect(48, 46, 984, 1250, 48); ctx.fill();
  ctx.strokeStyle = '#dff86f55'; ctx.lineWidth = 3;
  for (const radius of [136, 196, 256]) { ctx.beginPath(); ctx.arc(986, 96, radius, 0, Math.PI * 2); ctx.stroke(); }
  paint('FakeorFriend', 94, 133, 46, '#dff86f');
  ctx.fillStyle = '#8b728d'; ctx.fillRect(94, 166, 892, 2);
  paint(t('spotlight.animals'), 94, 226, 45, '#faf3f7');
  copy.people.forEach((person, i) => {
    const x = i ? 570 : 150;
    ctx.font = '800 28px system-ui, sans-serif'; ctx.fillStyle = '#faf3f7';
    drawWrapped(ctx, person.name, x, 275, 340, 33, 2);
    if (images[i]?.naturalWidth > 0) {
      ctx.fillStyle = i ? '#bde9ff20' : '#dff86f20';
      ctx.beginPath(); ctx.roundRect(x, 330, 340, 235, 42); ctx.fill();
      ctx.drawImage(images[i], x + 60, 337, 220, 220);
    } else drawAnimal(ctx, x, 330, { key: person.key });
    paint(person.animal, x, 610, 31, '#dff86f', 340);
    ctx.font = '500 19px system-ui, sans-serif'; ctx.fillStyle = '#e1d2e3';
    drawWrapped(ctx, person.reason, x, 641, 340, 25, 4);
  });
  ctx.fillStyle = '#cab9d065'; ctx.fillRect(94, 767, 892, 2);
  paint(t('spotlight.vibe'), 94, 824, 29, '#bde9ff');
  ctx.font = '700 32px system-ui, sans-serif'; ctx.fillStyle = '#faf3f7';
  drawWrapped(ctx, copy.vibe, 94, 871, 870, 43, 3);
  if (copy.moment) {
    paint(t('spotlight.moment'), 94, 1020, 29, '#dff86f');
    ctx.font = '600 25px system-ui, sans-serif'; ctx.fillStyle = '#faf3f7';
    drawWrapped(ctx, copy.moment, 94, 1065, 870, 34, 3);
  }
  ctx.fillStyle = '#cab9d065'; ctx.fillRect(94, 1184, 892, 2);
  paint(t('cardFooter'), 94, 1230, 22, '#e1d2e3', 880, 500);
  if (copy.scope) {
    ctx.font = '500 18px system-ui, sans-serif'; ctx.fillStyle = '#e1d2e3';
    drawWrapped(ctx, copy.scope, 94, 1270, 880, 23, 2);
  }
}
export function openCard(verdict) {
  const generation = ++cardGeneration;
  const dialog = $('card-dialog');
  const canvas = $('card-canvas');
  const names = verdict.people.map((p) => p.name);
  const defaults = defaultNames(names);
  const shown = new Map(names.map((name, i) => [name, defaults[i]]));
  const shownName = (name) => shownCardName(shown, name);
  const preview = $('card-preview-details');
  const share = $('card-share');
  const download = $('card-download');
  let images = [];
  const redraw = () => {
    preview.replaceChildren(...cardPreviewLines(verdict, shownName).map((value) =>
      Object.assign(document.createElement('li'), { textContent: value })));
    drawCard(canvas, verdict, shownName, images);
  };
  $('card-names').replaceChildren(...verdict.people.map(({ name }) => {
    const input = document.createElement('input');
    input.value = shown.get(name);
    input.maxLength = 48;
    input.setAttribute('aria-label', name);
    input.addEventListener('input', () => { shown.set(name, input.value.trim()); redraw(); });
    return input;
  }));
  share.hidden = !navigator.canShare?.({ files: [new File([], 'x.png', { type: 'image/png' })] });
  share.onclick = async () => {
    try { await navigator.share({ files: [await asFile(canvas)], text: t('cardShareText') }); }
    catch (error) { if (error.name !== 'AbortError') throw error; }
  };
  download.onclick = async () => {
    const url = URL.createObjectURL(await asFile(canvas));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'fakeorfriend.png' });
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  dialog.showModal();
  redraw();
  // The same original, same-origin SVGs appear on screen and in the PNG.
  // Keep export disabled until images have finished decoding; never capture a
  // half-drawn canvas if the user taps immediately after opening the dialog.
  share.disabled = download.disabled = true;
  void Promise.all(cardCopy(verdict, shownName).people.map(({ key }) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `img/animals/${key}.svg`;
  }))).then((loaded) => {
    if (generation !== cardGeneration || !dialog.open) return;
    images = loaded;
    redraw();
    share.disabled = download.disabled = false;
  });
}
