import { NavLink, Outlet } from "react-router-dom";
import { useUnit } from "../context/UnitContext.jsx";

const LINKS = [
  { to: "/home", label: "🏠 Home" },
  { to: "/dashboard", label: "📊 Dashboard" },
  { to: "/air-quality", label: "🌫 Air Quality" },
  { to: "/maps", label: "🗺 Maps" },
  { to: "/favorites", label: "💖 Favorites" },
];

export default function Layout() {
  const { unit, toggleUnit } = useUnit();

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">🌤 WeatherNow</h2>
        <nav className="nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "nav-btn active" : "nav-btn")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button className="unit-btn" onClick={toggleUnit}>
          🌡 Switch to °{unit === "C" ? "F" : "C"}
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
