// Counts weekdays (Mon-Fri) between two dates, exclusive of the start day.
export function weekdaysBetween(from, to) {
  if (!from) return Infinity;
  let count = 0;
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

// Derive a customer status from last visit.
export function customerStatus(lastVisit) {
  const absent = weekdaysBetween(lastVisit, new Date());
  if (!lastVisit) return "at-risk";
  if (absent >= 5) return "lapsed";
  if (absent >= 3) return "at-risk";
  return "active";
}