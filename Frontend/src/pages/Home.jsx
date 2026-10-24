import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getWeather, getForecast, addFavorite } from "../api.js";
import { useUnit } from "../context/UnitContext.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { groupByDay, dayName } from "../utils/forecast.js";
import { formatClock } from "../utils/time.js";
import weatherIcon from "../utils/weatherIcon.js";
import weatherTheme from "../utils/weatherTheme.js";
import Spinner from "../components/Spinner.jsx";

export default function Home() {
  const { formatTemp } = useUnit();
  const [searchParams] = useSearchParams();

  const [city, setCity] = useState("");
  const [current, setCurrent] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [recent, setRecent] = useLocalStorage("weathernow-recent", []);

  // params is { city } or { lat, lon }
  async function loadWeather(params) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [weather, forecastData] = await Promise.all([getWeather(params), getForecast(params)]);

      setCurrent(weather);
      setDays(groupByDay(forecastData.list));
      setCity(weather.name);

      // Remember the last 5 different searches
      setRecent((previous) =>
        [weather.name, ...previous.filter((name) => name.toLowerCase() !== weather.name.toLowerCase())].slice(0, 5)
      );
    } catch (err) {
      setCurrent(null);
      setDays([]);
      setError(err.status === 404 ? "City not found" : err.message);
    } finally {
      setLoading(false);
    }
  }

  // When we come from the Favorites page (/home?city=Delhi), search that city directly
  useEffect(() => {
    const cityFromLink = searchParams.get("city");
    if (cityFromLink) {
      setCity(cityFromLink);
      loadWeather({ city: cityFromLink });
    }
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    const query = city.trim();
    if (query) loadWeather({ city: query });
  }

  function handleMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => loadWeather({ lat: position.coords.latitude, lon: position.coords.longitude }),
      () => {
        setLoading(false);
        setError("Location permission denied.");
      }
    );
  }

  async function handleFavorite() {
    try {
      const data = await addFavorite({
        city: current.name,
        country: current.sys.country,
        temp: current.main.temp,
        weather: current.weather[0].main,
      });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const theme = current ? weatherTheme(current.weather[0].main) : "default";

  // Extra details shown as small cards
  const details = current
    ? [
        { label: "Feels like", value: formatTemp(current.main.feels_like) },
        { label: "Min / Max", value: `${formatTemp(current.main.temp_min)} / ${formatTemp(current.main.temp_max)}` },
        { label: "Humidity", value: `${current.main.humidity}%` },
        { label: "Wind", value: `${current.wind.speed} m/s` },
        { label: "Pressure", value: `${current.main.pressure} hPa` },
        {
          label: "Visibility",
          value: current.visibility !== undefined ? `${(current.visibility / 1000).toFixed(1)} km` : "N/A",
        },
        { label: "Sunrise", value: formatClock(current.sys.sunrise, current.timezone) },
        { label: "Sunset", value: formatClock(current.sys.sunset, current.timezone) },
      ]
    : [];

  return (
    <div className="home">
      <section className={`hero theme-${theme}`}>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search City..."
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <button type="submit" disabled={loading}>
            🔍
          </button>
          <button type="button" onClick={handleMyLocation} disabled={loading} title="Use my location">
            📍
          </button>
        </form>

        {recent.length > 0 && (
          <div className="recent">
            <span>Recent:</span>
            {recent.map((name) => (
              <button key={name} className="chip" onClick={() => loadWeather({ city: name })}>
                {name}
              </button>
            ))}
            <button className="chip clear-chip" onClick={() => setRecent([])}>
              Clear
            </button>
          </div>
        )}

        {loading && <Spinner text="Fetching weather..." />}
        {error && <p className="error-text">{error}</p>}

        {!loading && !current && !error && (
          <p className="info-text">Search a city or tap 📍 to see the weather.</p>
        )}

        {!loading && current && (
          <div className="current">
            <h3>
              {current.name}, {current.sys.country} 📍
            </h3>
            <p className="current-temp">
              {weatherIcon(current.weather[0].main)} {formatTemp(current.main.temp)}
            </p>
            <p className="condition">{current.weather[0].description}</p>
            <p>{today}</p>

            <button className="fav-btn" onClick={handleFavorite}>
              ❤️ Add to Favorites
            </button>
            {message && <p className="info-text">{message}</p>}
          </div>
        )}
      </section>

      {!loading && current && (
        <div className="details home-details">
          {details.map((item) => (
            <div className="mini-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      )}

      {!loading && days.length > 0 && (
        <section>
          <h2 className="section-title">5 Day Forecast 🌦️</h2>
          <div className="forecast">
            {days.map((day) => (
              <div className="forecast-card" key={day.date}>
                <h4>{dayName(day.date)}</h4>
                <p className="forecast-icon">{weatherIcon(day.condition)}</p>
                <p>{day.condition}</p>
                <p className="range">
                  {formatTemp(day.max)} / {formatTemp(day.min)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
