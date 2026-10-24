import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "🌡", label: "Live Weather" },
  { icon: "📅", label: "Forecast" },
  { icon: "🗺", label: "Weather Maps" },
  { icon: "🌫", label: "Air Quality" },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome">
      <div className="welcome-box">
        <div className="welcome-icon">🌤</div>
        <h1>WeatherNow</h1>
        <h2>Welcome to Smart Weather</h2>
        <p>Get real-time weather updates, forecasts, air quality and weather maps at one place.</p>

        <div className="features">
          {FEATURES.map((item) => (
            <div key={item.label}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <button className="start-btn" onClick={() => navigate("/home")}>
          Get Started →
        </button>
      </div>
    </div>
  );
}
