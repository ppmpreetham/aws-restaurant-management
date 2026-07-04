const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 8004;

// In-memory cache for restaurants
let restaurantsCache = [];

// Function to load restaurant data from Restaurant Service
async function fetchRestaurants() {
    try {
        const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:8001';
        const response = await fetch(`${restaurantServiceUrl}/api/restaurants`);
        if (response.ok) {
            restaurantsCache = await response.json();
            console.log(`Loaded ${restaurantsCache.length} restaurants from Restaurant Service`);
        } else {
            console.error('Failed to fetch restaurants:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching restaurants:', error.message);
    }
}

// Initial fetch and periodic refresh every 1 minute
fetchRestaurants();
setInterval(fetchRestaurants, 60000);

// Home Route
app.get("/", (req, res) => {
    res.send("Search Microservice is Running");
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "search-service" });
});

// Get All Restaurants
app.get("/restaurants", (req, res) => {
    res.json(restaurantsCache);
});

// Search API
app.get("/search", (req, res) => {
    const restaurants = restaurantsCache;

    const { name, city, cuisine, food } = req.query;

    let results = restaurants;

    if (name) {
        results = results.filter(r =>
            r.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    if (city) {
        results = results.filter(r =>
            r.city.toLowerCase() === city.toLowerCase()
        );
    }

    if (cuisine) {
        results = results.filter(r =>
            r.cuisine.toLowerCase() === cuisine.toLowerCase()
        );
    }

    if (food) {
        results = results.filter(r =>
            r.menu.some(item =>
                item.toLowerCase().includes(food.toLowerCase())
            )
        );
    }

    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Search Service running on port ${PORT}`);
});
