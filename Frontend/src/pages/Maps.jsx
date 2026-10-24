import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { BASE, geocodeCity } from "../api.js";

// Leaflet's default marker images break with Vite, so we point to them manually
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LAYERS = [
  { id: "temp_new", label: "🌡" },
  { id: "clouds_new", label: "☁" },
  { id: "precipitation_new", label: "🌧" },
  { id: "wind_new", label: "💨" },
];

// Weather tiles are loaded through our backend so the API key stays hidden
const tileUrl = (layer) => `${BASE}/api/tiles/${layer}/{z}/{x}/{y}`;

export default function Maps() {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const weatherLayerRef = useRef(null);
  const markerRef = useRef(null);

  const [city, setCity] = useState("");
  const [layer, setLayer] = useState("temp_new");
  const [message, setMessage] = useState("");

  // Create the map once
  useEffect(() => {
    const map = L.map(mapDivRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      weatherLayerRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Swap the weather layer whenever the selected layer changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (weatherLayerRef.current) {
      map.removeLayer(weatherLayerRef.current);
    }
    weatherLayerRef.current = L.tileLayer(tileUrl(layer)).addTo(map);
  }, [layer]);

  function showMarker(lat, lon, label) {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    map.setView([lat, lon], 8);
    markerRef.current = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
  }

  async function handleSearch(event) {
    event.preventDefault();
    const query = city.trim();
    if (!query) return;

    setMessage("");
    try {
      const data = await geocodeCity(query);
      if (!data || data.length === 0) {
        setMessage("City Not Found");
        return;
      }
      showMarker(data[0].lat, data[0].lon, query);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function handleMyLocation() {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location.");
      return;
    }
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => showMarker(position.coords.latitude, position.coords.longitude, "Your Location"),
      () => setMessage("Location permission denied.")
    );
  }

  function handleFullscreen() {
    if (!document.fullscreenElement) {
      mapDivRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <div className="maps">
      <form className="map-top" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search City"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
        <button type="submit">🔍 Search</button>
        <button type="button" onClick={handleMyLocation}>
          📍 My Location
        </button>
        <button type="button" onClick={handleFullscreen}>
          ⛶ Fullscreen
        </button>
      </form>

      {message && <p className="error-text">{message}</p>}

      <div className="layers">
        {LAYERS.map((item) => (
          <button
            key={item.id}
            className={layer === item.id ? "layer-btn selected" : "layer-btn"}
            onClick={() => setLayer(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div ref={mapDivRef} className="map-box"></div>
    </div>
  );
}
