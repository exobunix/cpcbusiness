import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { getToken } from "./lib/auth";
import ErrorBoundary from "./components/ErrorBoundary";

// Configure base API URL for Vercel & Production deployments
const apiUrl = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.includes("vercel.app") ? "https://cpcbusiness.onrender.com" : undefined);

if (apiUrl) {
  setBaseUrl(apiUrl);
}

// Wire up auth token so all API calls include the Bearer token
setAuthTokenGetter(() => getToken());

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
