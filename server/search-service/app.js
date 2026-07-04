const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 8004;

// Function to load restaurant data
function loadRestaurants() {
    const data = fs.readFileSync("restaurants.json");
    return JSON.parse(data);
}

// Home Route
app.get("/", (req, res) => {
    res.send("Search Microservice is Running");
});

// Get All Restaurants
app.get("/restaurants", (req, res) => {
    res.json(loadRestaurants());
});

// Search API
app.get("/search", (req, res) => {

    const restaurants = loadRestaurants();

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
