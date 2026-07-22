import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { getToken } from "./lib/auth";

// Configure base URL if VITE_API_URL is provided in production env
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

// Wire up auth token so all API calls include the Bearer token
setAuthTokenGetter(() => getToken());

createRoot(document.getElementById("root")!).render(<App />);
