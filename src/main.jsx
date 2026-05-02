// Sentry MUST be imported first -- before React, before App
// This ensures every error including React render errors is captured
import "./instrument.js";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
