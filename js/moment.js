// One measured comparison, selected from local metadata only. The input
// belongs to the same submitted excerpt as the stickers, so their n matches.
export function chatMoment(stats, people, { raw = false, truncated = false } = {}) {
  if (raw || !stats || people?.length !== 2 || people[0] === people[1]) return null;
  const [a, b] = people.map((name) => stats.get(name));
  if (!a || !b) return null;

  // A truncated excerpt may start mid-conversation and invent a starter.
  const left = a.starts;
  const right = b.starts;
  if (!truncated && left && right && Number.isInteger(left.of) && left.of >= 5 &&
      left.of === right.of && Number.isInteger(left.count) && Number.isInteger(right.count) &&
      left.count >= 0 && right.count >= 0 && left.count + right.count === left.of) {
    const winner = left.count > right.count ? 0 : 1;
    const count = winner === 0 ? left.count : right.count;
    const other = winner === 0 ? right.count : left.count;
    if (count - other >= 2 && count / left.of >= .6) {
      return { key: 'starter', winner: people[winner], count, of: left.of };
    }
  }

  const replies = [a.reply, b.reply];
  if (replies.every((item) => Number.isInteger(item?.n) && item.n >= 5 &&
      Number.isFinite(item.median) && item.median >= 0)) {
    const winner = replies[0].median < replies[1].median ? 0 : 1;
    const fast = replies[winner];
    const slow = replies[1 - winner];
    if (slow.median - fast.median >= 5 * 60_000 && slow.median >= fast.median * 1.5) {
      return { key: 'reply', winner: people[winner], median: fast.median, n: fast.n,
        otherMedian: slow.median, otherN: slow.n };
    }
  }
  return null;
}

export function momentVars(moment, nameOf, timeOf) {
  if (!moment) return {};
  const vars = { name: nameOf(moment.winner) };
  return moment.key === 'starter' ? { ...vars, count: moment.count, of: moment.of }
    : { ...vars, time: timeOf(moment.median), n: moment.n,
      otherTime: timeOf(moment.otherMedian), otherN: moment.otherN };
}
