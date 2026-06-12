import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
// @ts-ignore: CSS side-effect import without type declarations
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>
);
