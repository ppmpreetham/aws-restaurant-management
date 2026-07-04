import { useState } from "react";
import { Browse } from "./pages/Browse";
import { Kitchen } from "./pages/Kitchen";
import Orders from "./pages/Orders";
import "./App.css";

type Tab = "browse" | "kitchen" | "orders";

export default function App() {
  const [tab, setTab] = useState<Tab>("browse");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__mark">TT</span>
          <div>
            <h1>Table &amp; Tray</h1>
            <p>
              Restaurant service: listings, menus, kitchen desk &amp; customer
              ordering
            </p>
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
            Kitchen Desk
          </button>

          <button
            className={tab === "orders" ? "tab tab--active" : "tab"}
            onClick={() => setTab("orders")}
          >
            🍽 Order Food
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === "browse" && (
          <Browse
            selectedRestaurantId={selectedRestaurantId}
            onSelectRestaurantId={setSelectedRestaurantId}
          />
        )}
        {tab === "kitchen" && <Kitchen />}
        {tab === "orders" && <Orders restaurantId={selectedRestaurantId ?? 1} />}
      </main>
    </div>
  );
}