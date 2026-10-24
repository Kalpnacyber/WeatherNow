import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { UnitProvider } from "./context/UnitContext.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UnitProvider>
        <App />
      </UnitProvider>
    </BrowserRouter>
  </React.StrictMode>
);
