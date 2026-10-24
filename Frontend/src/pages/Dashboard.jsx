import { useEffect, useState } from "react";
import { getWeather, getForecast } from "../api.js";
import { useUnit } from "../context/UnitContext.jsx";
import useGeolocation from "../hooks/useGeolocation.js";
import { formatOffset } from "../utils/time.js";
import weatherIcon from "../utils/weatherIcon.js";
import Spinner from "../components/Spinner.jsx";
import TempChart from "../components/TempChart.jsx";

export default function Dashboard() {
  const { unit, convert, formatTemp } = useUnit();
  const { coords, error: locationError, loading: locating } = useGeolocation();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  // Runs again when the coordinates arrive
  useEffect(() => {
    if (!coords) return;

    async function load() {
      try {
        const [weatherData, forecastData] = await Promise.all([
          getWeather(coords),
          getForecast(coords),
        ]);
        setWeather(weatherData);
        setForecast(forecastData.list);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [coords]);

  if (locating) return <Spinner text="Getting your location..." />;
  if (locationError) return <p className="error-text">{locationError}</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!weather) return <Spinner text="Loading weather..." />;

  const details = [
    { title: "Feels like", value: formatTemp(weather.main.feels_like) },
    { title: "Humidity", value: `${weather.main.humidity}%` },
    { title: "Wind", value: `${weather.wind.speed} m/s` },
    { title: "Pressure", value: `${weather.main.pressure} hPa` },
    { title: "Timezone", value: formatOffset(weather.timezone) },
  ];

  // Next 24 hours = the next 8 entries (3 hours each)
  const next24 = forecast.slice(0, 8);
  const chartLabels = next24.map((item) => item.dt_txt.slice(11, 16));
  const chartValues = next24.map((item) => Math.round(convert(item.main.temp) * 10) / 10);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="main-card">
        <h2>
          {weather.name}, {weather.sys.country}
        </h2>
        <p className="big-temp">{formatTemp(weather.main.temp)}</p>
        <p>
          {weatherIcon(weather.weather[0].main)} {weather.weather[0].main}
        </p>
      </div>

      <div className="details">
        {details.map((item) => (
          <div className="detail-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Next 24 Hours</h2>
      <div className="chart-wide">
        <TempChart labels={chartLabels} values={chartValues} unit={unit} />
      </div>

      <h2 className="section-title">5 Days 3 hour Forecast</h2>
      <div className="hourly-list">
        {forecast.map((item) => (
          <div className="hourly" key={item.dt}>
            <h3>{item.dt_txt}</h3>
            <p>{formatTemp(item.main.temp)}</p>
            <p>
              {item.weather[0].main} {weatherIcon(item.weather[0].main)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
