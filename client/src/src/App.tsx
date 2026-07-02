import { useState } from "react";
import { Browse } from "./pages/Browse";
import { Kitchen } from "./pages/Kitchen";
import "./App.css";

type Tab = "browse" | "kitchen";

export default function App() {
  const [tab, setTab] = useState<Tab>("browse");

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__mark">TT</span>
          <div>
            <h1>Table &amp; Tray</h1>
            <p>Restaurant service: listings, menus &amp; kitchen order desk</p>
          </div>
        </div>
        <nav className="tabs">
          <button
            className={tab === "browse" ? "tab tab--active" : "tab"}
            onClick={() => setTab("browse")}
          >
            Browse
          </button>
          <button
            className={tab === "kitchen" ? "tab tab--active" : "tab"}
            onClick={() => setTab("kitchen")}
          >
            Kitchen desk
          </button>
        </nav>
      </header>

      <main className="app-main">{tab === "browse" ? <Browse /> : <Kitchen />}</main>
    </div>
  );
}
