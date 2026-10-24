import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { getAirQuality } from "../api.js";
import useGeolocation from "../hooks/useGeolocation.js";
import Spinner from "../components/Spinner.jsx";

const AQI_INFO = {
  1: { label: "Good", emoji: "🟢", color: "#2ecc71", advice: "Air quality is great. Enjoy your outdoor activities." },
  2: { label: "Fair", emoji: "🟡", color: "#f1c40f", advice: "Air quality is acceptable. Very sensitive people may take care." },
  3: { label: "Moderate", emoji: "🟠", color: "#e67e22", advice: "Sensitive people should reduce long outdoor exercise." },
  4: { label: "Poor", emoji: "🔴", color: "#e74c3c", advice: "Avoid heavy outdoor activity. Consider wearing a mask." },
  5: { label: "Very Poor", emoji: "🟣", color: "#9b59b6", advice: "Stay indoors if possible and avoid outdoor exercise." },
};

export default function AirQuality() {
  const { coords, error: locationError, loading: locating } = useGeolocation();
  const [air, setAir] = useState(null);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!coords) return;

    async function load() {
      try {
        const data = await getAirQuality(coords.lat, coords.lon);
        setAir(data.list[0]);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [coords]);

  // Draw the pie chart after the data arrives. Cleanup removes the old chart.
  useEffect(() => {
    if (!air || !canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: ["PM2.5", "PM10", "CO", "NO2"],
        datasets: [
          {
            data: [
              air.components.pm2_5,
              air.components.pm10,
              air.components.co,
              air.components.no2,
            ],
            backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { color: "white" } },
          title: {
            display: true,
            text: "Air Pollution Components",
            color: "white",
            font: { size: 18 },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [air]);

  if (locating) return <Spinner text="Getting your location..." />;
  if (locationError) return <p className="error-text">{locationError}</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!air) return <Spinner text="Loading air quality..." />;

  const info = AQI_INFO[air.main.aqi];

  return (
    <div className="air">
      <h1 className="page-title">Air Quality</h1>

      <div className="aqi-badge" style={{ backgroundColor: info.color }}>
        {info.emoji} {info.label} (AQI {air.main.aqi})
      </div>
      <p className="advice">{info.advice}</p>

      <div className="details">
        <div className="mini-card">
          <span>PM2.5</span>
          <strong>{air.components.pm2_5}</strong>
        </div>
        <div className="mini-card">
          <span>PM10</span>
          <strong>{air.components.pm10}</strong>
        </div>
        <div className="mini-card">
          <span>CO</span>
          <strong>{air.components.co}</strong>
        </div>
        <div className="mini-card">
          <span>NO2</span>
          <strong>{air.components.no2}</strong>
        </div>
      </div>

      <div className="chart-box">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
