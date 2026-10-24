// Time in the searched city (not in the user's own timezone).
// ts = unix time in seconds, tz = timezone offset in seconds (both come from the API)
export function formatClock(ts, tz) {
  return new Date((ts + tz) * 1000).toISOString().slice(11, 16);
}

export function formatOffset(tz) {
  const sign = tz < 0 ? "-" : "+";
  const abs = Math.abs(tz);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  return `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}
