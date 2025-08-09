import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Simple performance tracking for initial load
const perfStart = performance.now();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Log startup time (only in development)
if (import.meta.env.DEV) {
  setTimeout(() => {
    console.log(
      `App startup took ${Math.round(performance.now() - perfStart)}ms`
    );
  }, 100);
}
