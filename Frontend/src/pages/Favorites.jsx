import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFavorites, removeFavorite } from "../api.js";
import { useUnit } from "../context/UnitContext.jsx";
import weatherIcon from "../utils/weatherIcon.js";
import Spinner from "../components/Spinner.jsx";

export default function Favorites() {
  const navigate = useNavigate();
  const { formatTemp } = useUnit();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFavorites() {
    try {
      setFavorites(await getFavorites());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function handleRemove(cityName) {
    try {
      await removeFavorite(cityName);
      loadFavorites();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="favorites">
      <h1 className="page-title">❤️ Favorite Cities</h1>

      {loading && <Spinner text="Loading favorites..." />}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && favorites.length === 0 && (
        <p className="info-text">No favorite cities yet. Search a city on Home and add it.</p>
      )}

      {favorites.map((item) => (
        <div className="fav-card" key={item.city}>
          <h2>{item.city}</h2>
          <p>Country : {item.country}</p>
          <p>Temperature (when saved) : {formatTemp(item.temp)}</p>
          <p>
            Weather : {weatherIcon(item.weather)} {item.weather}
          </p>
          <div className="fav-actions">
            <button onClick={() => navigate(`/home?city=${encodeURIComponent(item.city)}`)}>
              View live weather
            </button>
            <button className="danger" onClick={() => handleRemove(item.city)}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
