import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Welcome from "./pages/Welcome.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AirQuality from "./pages/AirQuality.jsx";
import Maps from "./pages/Maps.jsx";
import Favorites from "./pages/Favorites.jsx";

export default function App() {
  return (
    <Routes>
      {/* Welcome page has no sidebar */}
      <Route path="/" element={<Welcome />} />

      {/* All other pages share the sidebar layout */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/air-quality" element={<AirQuality />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/favorites" element={<Favorites />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
