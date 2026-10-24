import "dotenv/config";
import express from "express";
import cors from "cors";
import { getFavorites, addFavorite, removeFavorite } from "./favorites.js";
import { cacheGet, cacheSet, cacheSize } from "./cache.js";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;
const OWM_BASE = "https://api.openweathermap.org";
const TILE_BASE = "https://tile.openweathermap.org/map";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Middleware
app.use(cors());
app.use(express.json());

// ---------- Helper: call OpenWeatherMap with the key kept on the server ----------
// Cache key ignores letter case of the city and rounds coordinates, so similar requests share one entry
function makeCacheKey(path, query) {
    const normal = {};
    for (const [name, value] of Object.entries(query)) {
        if (name === "q") normal[name] = String(value).toLowerCase();
        else if (name === "lat" || name === "lon") normal[name] = Number(value).toFixed(2);
        else normal[name] = value;
    }
    return `${path}?${new URLSearchParams(normal)}`;
}

async function callOpenWeather(res, path, query) {
    if (!API_KEY) {
        return res.status(500).json({ message: "OPENWEATHER_API_KEY is missing on the server" });
    }

    const cacheKey = makeCacheKey(path, query);
    const cached = cacheGet(cacheKey);
    if (cached) {
        res.set("X-Cache", "HIT");
        return res.json(cached);
    }

    const params = new URLSearchParams({ ...query, appid: API_KEY });

    try {
        const response = await fetch(`${OWM_BASE}${path}?${params}`);
        const data = await response.json();

        // Only successful answers are cached
        if (response.ok) {
            cacheSet(cacheKey, data, CACHE_TTL);
        }
        res.set("X-Cache", "MISS");
        res.status(response.status).json(data);
    } catch (error) {
        res.status(502).json({ message: "Weather service is not reachable right now" });
    }
}

// Build the location part of the query: either ?city=Delhi or ?lat=..&lon=..
function locationQuery(req) {
    const { city, lat, lon } = req.query;

    if (typeof city === "string" && city.trim() !== "") {
        return { q: city.trim().slice(0, 100) };
    }
    if (isCoordinate(lat, 90) && isCoordinate(lon, 180)) {
        return { lat, lon };
    }
    return null;
}

function isCoordinate(value, limit) {
    const number = Number(value);
    return typeof value === "string" && value !== "" && !Number.isNaN(number) && Math.abs(number) <= limit;
}

// ---------- Test route ----------
app.get("/", (req, res) => {
    res.send("WeatherNow Backend Running");
});

// Health check (useful after deployment)
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptimeSeconds: Math.round(process.uptime()),
        cachedItems: cacheSize()
    });
});

// ---------- Weather routes ----------
// Current weather
app.get("/api/weather", (req, res) => {
    const location = locationQuery(req);
    if (!location) {
        return res.status(400).json({ message: "Send either city or lat and lon" });
    }
    callOpenWeather(res, "/data/2.5/weather", { ...location, units: "metric" });
});

// 5 day / 3 hour forecast
app.get("/api/forecast", (req, res) => {
    const location = locationQuery(req);
    if (!location) {
        return res.status(400).json({ message: "Send either city or lat and lon" });
    }
    callOpenWeather(res, "/data/2.5/forecast", { ...location, units: "metric" });
});

// Air quality
app.get("/api/air", (req, res) => {
    const { lat, lon } = req.query;
    if (!isCoordinate(lat, 90) || !isCoordinate(lon, 180)) {
        return res.status(400).json({ message: "Send valid lat and lon" });
    }
    callOpenWeather(res, "/data/2.5/air_pollution", { lat, lon });
});

// City name -> latitude / longitude (used by the map search)
app.get("/api/geocode", (req, res) => {
    const { q } = req.query;
    if (typeof q !== "string" || q.trim() === "") {
        return res.status(400).json({ message: "Send q (city name)" });
    }
    callOpenWeather(res, "/geo/1.0/direct", { q: q.trim().slice(0, 100), limit: 1 });
});

// Weather map tiles (temperature, clouds, rain, wind) - key stays hidden on the server
const TILE_LAYERS = ["temp_new", "clouds_new", "precipitation_new", "wind_new"];

app.get("/api/tiles/:layer/:z/:x/:y", async (req, res) => {
    const { layer, z, x, y } = req.params;

    const numbersOk = [z, x, y].every((value) => /^\d+$/.test(value));
    if (!TILE_LAYERS.includes(layer) || !numbersOk) {
        return res.status(400).json({ message: "Invalid tile request" });
    }
    if (!API_KEY) {
        return res.status(500).json({ message: "OPENWEATHER_API_KEY is missing on the server" });
    }

    try {
        const response = await fetch(`${TILE_BASE}/${layer}/${z}/${x}/${y}.png?appid=${API_KEY}`);
        if (!response.ok) {
            return res.status(response.status).end();
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=600");
        res.send(buffer);
    } catch (error) {
        res.status(502).end();
    }
});

// ---------- Favorites routes ----------
// Get favorites
app.get("/favorites", (req, res) => {
    res.json(getFavorites());
});

// Add favorite
app.post("/favorites", (req, res) => {
    const city = req.body;

    if (!city || !city.city) {
        return res.status(400).json({ success: false, message: "City name is required" });
    }

    const added = addFavorite(city);

    if (!added) {
        return res.json({
            success: false,
            message: "City already exists in Favorites ❤️"
        });
    }

    res.json({
        success: true,
        message: "City added to Favorites ❤️",
        favorites: getFavorites()
    });
});

// Delete favorite
app.delete("/favorites/:city", (req, res) => {
    const removed = removeFavorite(req.params.city);

    if (!removed) {
        return res.status(404).json({ success: false, message: "City not found" });
    }

    res.json({
        success: true,
        message: "City removed successfully",
        favorites: getFavorites()
    });
});

// ---------- Unknown routes and errors ----------
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.status ? "Bad request" : "Internal server error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
