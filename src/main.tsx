
  import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/errorHandling"; // Initialize global error handling

createRoot(document.getElementById("root")!).render(<App />);
  