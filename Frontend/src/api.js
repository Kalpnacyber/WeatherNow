// All calls go to our own Express backend. The OpenWeatherMap key lives only on the server.
// Local development: BASE is empty, so the Vite proxy forwards /api and /favorites to port 3000.
// After deployment: set VITE_API_URL to the deployed backend URL.
export const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options) {
  const response = await fetch(BASE + path, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error((data && data.message) || "Something went wrong");
    error.status = response.status;
    throw error;
  }
  return data;
}

const toQuery = (params) => new URLSearchParams(params).toString();

// params: { city } or { lat, lon }
export const getWeather = (params) => request(`/api/weather?${toQuery(params)}`);
export const getForecast = (params) => request(`/api/forecast?${toQuery(params)}`);
export const getAirQuality = (lat, lon) => request(`/api/air?${toQuery({ lat, lon })}`);
export const geocodeCity = (q) => request(`/api/geocode?${toQuery({ q })}`);

export const getFavorites = () => request("/favorites");

export const addFavorite = (city) =>
  request("/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(city),
  });

export const removeFavorite = (cityName) =>
  request(`/favorites/${encodeURIComponent(cityName)}`, { method: "DELETE" });
