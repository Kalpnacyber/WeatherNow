# WeatherNow

A full-stack weather web app.

- **Frontend:** React.js (Vite, React Router, Leaflet, Chart.js)
- **Backend:** Node.js + Express.js REST API
- **Data:** OpenWeatherMap API (called from the backend, so the API key is never exposed in the browser)

## Features
- Search any city: current weather and 5 day forecast
- Dashboard with your location's weather and 3 hour forecast
- Air quality (AQI) with a pollutant pie chart
- Interactive weather map (temperature, clouds, rain, wind layers)
- Favorite cities (saved in the backend in `favorites.json`), with a "View live weather" shortcut
- °C / °F switch (shared by all pages with React Context, remembered in the browser)
- "Use my location" button and last 5 recent searches (localStorage)
- Home page background changes with the weather; extra details (feels like, min/max, visibility, sunrise, sunset)
- Day-wise forecast with min / max temperature
- Next 24 hours temperature line chart on the Dashboard
- Air quality badge with a health tip
- Loading spinners and clear error messages

## Backend highlights
- OpenWeatherMap key stays on the server (`.env`), never in the browser
- 10 minute in-memory cache (`cache.js`), so repeated searches are faster and use fewer API calls
- Input validation for city names and coordinates, JSON 404 / error handlers
- `/health` route to check that the server is running

## Folder structure
```
WeatherNow/
  Backend/    Express server (index.js, favorites.js)
  Frontend/   React app (src/pages, src/components, src/hooks, src/api.js)
```

## Run locally

### 1. Backend
```
cd Backend
npm install
copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
```
Open `.env` and put your OpenWeatherMap key in `OPENWEATHER_API_KEY`. Then:
```
npm start
```
Backend runs on http://localhost:3000

### 2. Frontend (new terminal)
```
cd Frontend
npm install
npm run dev
```
Open http://localhost:5173

## API endpoints
| Method | Route | What it does |
|--------|-------|--------------|
| GET | `/api/weather?city=Delhi` or `?lat=..&lon=..` | Current weather |
| GET | `/api/forecast?city=Delhi` or `?lat=..&lon=..` | 5 day / 3 hour forecast |
| GET | `/api/air?lat=..&lon=..` | Air quality |
| GET | `/api/geocode?q=Delhi` | City to latitude / longitude |
| GET | `/api/tiles/:layer/:z/:x/:y` | Weather map tiles |
| GET | `/health` | Server status |
| GET | `/favorites` | List favorite cities |
| POST | `/favorites` | Add a favorite city |
| DELETE | `/favorites/:city` | Remove a favorite city |

## Deployment note
Deploy the backend first (for example on Render) and add `OPENWEATHER_API_KEY` in its environment variables.
For the frontend, set `VITE_API_URL` to the deployed backend URL (see `Frontend/.env.example`) and run `npm run build`.
