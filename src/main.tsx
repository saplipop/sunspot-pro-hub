import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeMockData } from "./lib/dataInitializer";

// Initialize mock data on app start
initializeMockData();

createRoot(document.getElementById("root")!).render(<App />);
