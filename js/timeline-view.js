import { t } from './i18n.js';

const ns = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attributes = {}) => {
  const element = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
};
const make = (tag, className, content) => {
  const node = document.createElement(tag);
  node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
};
const labelDate = (at) => new Date(at).toISOString().slice(0, 10);
const COLORS = ['#e9f056', '#d7efff'];
const text = (x, y, value, extra = {}) => {
  const node = svgEl('text', { x, y, fill: '#e6d6e0', 'font-size': 12, ...extra });
  node.textContent = String(value);
  return node;
};

export function renderTimeline(root, timeline, shownNames) {
  root.replaceChildren();
  if (!timeline?.points) {
    root.append(make('p', 'timeline-empty', t(`timeline.empty.${timeline?.reason ?? 'unavailable'}`)));
    return;
  }
  const { points, trend, weekly, finds } = timeline;
  const legend = make('div', 'timeline-legend');
  timeline.people.forEach((name, i) => {
    const line = make('span', `timeline-key key-${i}`);
    line.append(make('span', 'key-symbol'), make('strong', '', shownNames?.[i] ?? name));
    legend.append(line);
  });
  root.append(make('p', 'timeline-scope', t('timeline.scope', { n: timeline.activeDays, total: timeline.totalDays })), legend);
  const chart = svgEl('svg', { viewBox: '0 0 700 300', role: 'img', 'aria-label': t('timeline.accessible', {
    first: labelDate(points[0].at), last: labelDate(points.at(-1).at),
    firstName: shownNames?.[0] ?? timeline.people[0], secondName: shownNames?.[1] ?? timeline.people[1],
  }) });
  const x = (i) => 54 + i * 620 / Math.max(1, points.length - 1);
  const max = Math.max(1, ...points.flatMap(({ counts }) => counts), ...(trend ? [trend.start, trend.end] : []));
  const ceiling = Math.ceil(max);
  const y = (value) => 244 - Math.max(0, value) / ceiling * 200;
  for (const tick of [0, 0.5, 1]) {
    const height = y(ceiling * tick);
    chart.append(svgEl('line', { x1: 54, x2: 674, y1: height, y2: height, stroke: '#78586d' }),
      text(46, height + 4, Math.round(ceiling * tick), { 'text-anchor': 'end' }));
  }
  for (const i of [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])])
    chart.append(text(x(i), 277, labelDate(points[i].at), { 'text-anchor': i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle' }));
  for (const p of [0, 1]) {
    const coords = points.map((row, i) => `${x(i)},${y(row.counts[p])}`).join(' ');
    chart.append(svgEl('polyline', { points: coords, fill: 'none', stroke: COLORS[p], 'stroke-width': p ? 3 : 4,
      'stroke-dasharray': p ? '8 5' : 'none', 'stroke-linejoin': 'round' }));
    if (points.length <= 42) points.forEach((row, i) => chart.append(p
      ? svgEl('rect', { x: x(i) - 3.5, y: y(row.counts[p]) - 3.5, width: 7, height: 7, fill: COLORS[p] })
      : svgEl('circle', { cx: x(i), cy: y(row.counts[p]), r: 3.6, fill: COLORS[p] })));
  }
  if (trend) chart.append(svgEl('line', { x1: x(0), y1: y(trend.start), x2: x(trend.periods - 1), y2: y(trend.end),
    stroke: '#ffb9a3', 'stroke-width': 2, 'stroke-dasharray': '3 7' }));
  root.append(chart, make('p', 'timeline-caption', t(weekly ? 'timeline.weekly' : 'timeline.daily')));
  root.append(make('p', 'timeline-caption', t(trend ? 'timeline.trend' : 'timeline.noTrend')));
  const details = make('details', 'timeline-table');
  details.append(make('summary', '', t('timeline.tableTitle')));
  const table = make('table', '');
  const head = document.createElement('thead');
  const trHead = document.createElement('tr');
  for (const value of [t('timeline.period'), ...(shownNames ?? timeline.people)]) trHead.append(make('th', '', value));
  head.append(trHead); table.append(head);
  const body = document.createElement('tbody');
  for (const row of points) {
    const tr = document.createElement('tr');
    for (const value of [labelDate(row.at), ...row.counts]) tr.append(make('td', '', value));
    body.append(tr);
  }
  table.append(body); details.append(table); root.append(details);
  const cards = make('div', 'pattern-cards');
  if (!finds.length) cards.append(make('p', 'timeline-empty', t('timeline.noPatterns')));
  for (const find of finds.slice(0, 2)) {
    const item = make('article', 'pattern-card');
    item.append(make('h4', '', t(`timeline.pattern.${find.key}.${find.direction}`)));
    item.append(make('p', '', t(`timeline.pattern.${find.key}.detail`, find)));
    const bar = make('div', 'pattern-mini');
    if (find.key === 'length') {
      for (const v of [find.low, find.high]) {
        const col = make('span', 'pattern-bar');
        col.style.height = `${Math.max(8, v / Math.max(find.low, find.high) * 100)}%`;
        bar.append(col);
      }
    } else {
      const col = make('span', 'pattern-gauge');
      col.style.width = `${Math.round(Math.abs(find.rho) * 100)}%`;
      bar.append(col);
    }
    item.append(bar); cards.append(item);
  }
  root.append(cards);
}
