// The API returns a forecast every 3 hours. This groups it by day
// and finds the lowest and highest temperature of each day.
export function groupByDay(list) {
  const days = {};

  list.forEach((item) => {
    const date = item.dt_txt.slice(0, 10); // "2026-10-24"
    if (!days[date]) {
      days[date] = { date, min: Infinity, max: -Infinity, items: [] };
    }
    days[date].min = Math.min(days[date].min, item.main.temp_min);
    days[date].max = Math.max(days[date].max, item.main.temp_max);
    days[date].items.push(item);
  });

  return Object.values(days)
    .slice(0, 5)
    .map((day) => {
      // Use the midday entry for the icon, or the first entry if there is no midday
      const midday = day.items.find((item) => item.dt_txt.includes("12:00:00")) || day.items[0];
      return {
        date: day.date,
        min: day.min,
        max: day.max,
        condition: midday.weather[0].main,
      };
    });
}

export function dayName(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}
