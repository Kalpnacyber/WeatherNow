// Decides the background style of the Home page from the weather condition
export default function weatherTheme(condition) {
  switch (condition) {
    case "Clear":
      return "clear";
    case "Clouds":
      return "clouds";
    case "Rain":
    case "Drizzle":
      return "rain";
    case "Thunderstorm":
      return "storm";
    case "Snow":
      return "snow";
    case "Mist":
    case "Haze":
    case "Fog":
    case "Smoke":
      return "mist";
    default:
      return "default";
  }
}
