import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";

// Temperature unit (°C / °F) is shared by all pages through React Context
const UnitContext = createContext(null);

export function UnitProvider({ children }) {
  const [unit, setUnit] = useLocalStorage("weathernow-unit", "C");

  const toggleUnit = () => setUnit((current) => (current === "C" ? "F" : "C"));

  // The API always gives Celsius, so we convert only for display
  const convert = (celsius) => (unit === "C" ? celsius : (celsius * 9) / 5 + 32);
  const formatTemp = (celsius) => `${Math.round(convert(celsius))}°${unit}`;

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, convert, formatTemp }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  return useContext(UnitContext);
}
