import { t } from './i18n.js';
import { formatNumber } from './presentation.js';

const node = (tag, className, value) => {
  const item = document.createElement(tag);
  item.className = className;
  if (value !== undefined) item.textContent = value;
  return item;
};
const n = (value) => formatNumber(value);
const date = (at) => new Date(at).toISOString().slice(0, 10);
const card = (title, body) => {
  const article = node('article', 'outlook-card');
  article.append(node('h4', '', title), node('p', '', body));
  return article;
};

export function renderOutlook(root, outlook) {
  const measured = node('div', 'outlook-grid');
  const rhythm = outlook.rhythm;
  measured.append(card(t('outlook.rhythmTitle'), rhythm
    ? t(`outlook.rhythm.${rhythm.direction}`, { old: n(rhythm.oldMedian), recent: n(rhythm.newMedian) })
    : t('outlook.rhythm.empty')));
  const coactive = outlook.coactive;
  measured.append(card(t('outlook.coactiveTitle'), coactive
    ? t(coactive.previous === null ? 'outlook.coactive.first' : 'outlook.coactive.compare', {
      recent: n(coactive.recent), previous: n(coactive.previous), days: n(coactive.days),
    }) : t('outlook.coactive.empty')));
  const forecast = outlook.forecast;
  const next = outlook.nextMonday === null ? null : date(outlook.nextMonday);
  const forecastCard = card(t('outlook.forecastTitle'), forecast.prediction !== undefined
    ? t('outlook.forecast.ready', { first: n(forecast.lower), last: n(forecast.upper),
      date: next, error: n(forecast.error) })
    : t(`outlook.forecast.${forecast.reason === 'weak' ? 'weak' : 'empty'}`));
  if (forecast.prediction !== undefined) {
    const diagnostic = node('p', 'outlook-diagnostic', t('outlook.forecast.test', {
      model: n(forecast.diagnostics.mae), baseline: n(forecast.diagnostics.baselineMae),
      folds: n(forecast.diagnostics.folds),
    }));
    forecastCard.append(diagnostic);
  }
  measured.append(forecastCard);
  const figure = node('div', 'outlook-bars');
  const sample = outlook.weeks.slice(-9);
  if (sample.length) {
    figure.setAttribute('role', 'group');
    figure.setAttribute('aria-label', t('outlook.barTitle'));
    const max = Math.max(1, ...sample.map((week) => week.total));
    for (const week of sample) {
      const bar = node('span', 'outlook-bar');
      bar.style.setProperty('--height', `${Math.round(week.total / max * 100)}%`);
      bar.title = t('outlook.barLabel', { date: date(week.at), n: n(week.total) });
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', bar.title);
      figure.append(bar);
    }
    measured.prepend(node('p', 'outlook-bar-caption', t('outlook.barTitle')), figure);
  }
  const scenes = node('div', 'outlook-grid outlook-scenes');
  if (outlook.scenes.length) scenes.append(...outlook.scenes.map(({ key, evidence }) =>
    card(t(`outlook.scenes.${key}.title`), t(`outlook.scenes.${key}.body`, {
      ...Object.fromEntries(Object.entries(evidence).map(([name, value]) => [name, n(value)])),
    }))));
  else scenes.append(node('p', 'outlook-empty', t('outlook.scenes.empty')));
  root.replaceChildren(measured, node('h4', 'outlook-scenes-title', t('outlook.scenesTitle')),
    node('p', 'outlook-disclaimer', t('outlook.disclaimer')), scenes);
}
