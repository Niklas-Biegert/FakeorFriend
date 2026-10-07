import { lang, t } from './i18n.js';
export const percent = (value) => `${Math.round(value * 100)}%`;
export const formatNumber = (value) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(value);
export function textLengthPresentation(counts) {
  const length = counts.textLength;
  return {
    median: length ? t('counted.charValue', { count: formatNumber(length.medianChars) }) : '–',
    longest: length ? t('counted.charValue', { count: formatNumber(length.maxChars) }) : '–',
    sample: t('counted.sample', { n: length?.n ?? counts.messages }),
    note: length ? null : t('counted.tooFew'),
  };
}
export function statisticNotes(stats, judged, name) {
  const counts = stats?.get(name);
  const length = counts?.textLength;
  if (!length) return [];
  const contenders = judged.map((person) => ({ name: person, max: stats.get(person)?.textLength?.maxChars }))
    .filter(({ max }) => Number.isFinite(max)).sort((a, b) => b.max - a.max);
  const leader = contenders.length >= 2 && contenders[0].max > contenders[1].max ? contenders[0].name : null;
  const n = formatNumber(length.n);
  const notes = [t('statNotes.median', { chars: formatNumber(length.medianChars), n }),
    leader === name ? t('statNotes.leader', { name, chars: formatNumber(length.maxChars), n })
      : t('statNotes.maximum', { chars: formatNumber(length.maxChars), n })];
  if (counts.reply) notes.push(t('statNotes.reply', { time: formatDuration(counts.reply.median), n: formatNumber(counts.reply.n) }));
  return notes;
}
export function formatDuration(ms) {
  const unit = (value, name) => new Intl.NumberFormat(lang, { style: 'unit', unit: name, unitDisplay: 'short' }).format(value);
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return unit(Math.round(ms / 1000), 'second');
  if (minutes < 60) return unit(minutes, 'minute');
  const rest = minutes % 60;
  return rest ? `${unit(Math.floor(minutes / 60), 'hour')} ${unit(rest, 'minute')}` : unit(minutes / 60, 'hour');
}
export function recordDetail({ key, stats }) {
  const detail = `records.${key}.detail`;
  if (key === 'slowest' || key === 'fastest') return t(detail, { time: formatDuration(stats.reply.median), n: stats.reply.n });
  if (key === 'wordiest') return t(detail, { words: formatNumber(stats.medianWords), n: stats.messages });
  return t(detail, stats.starts);
}
