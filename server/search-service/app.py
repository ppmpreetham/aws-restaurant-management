from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Load restaurant data
def load_restaurants():
    with open("restaurants.json", "r") as file:
        return json.load(file)

# Home Page
@app.route("/")
def home():
    return "Search Microservice is Running"

# Get All Restaurants
@app.route("/restaurants", methods=["GET"])
def get_restaurants():
    return jsonify(load_restaurants())

# Search Restaurants
@app.route("/search", methods=["GET"])
def search():

    restaurants = load_restaurants()

    name = request.args.get("name")
    city = request.args.get("city")
    cuisine = request.args.get("cuisine")
    food = request.args.get("food")

    results = restaurants

    if name:
        results = [r for r in results if name.lower() in r["name"].lower()]

    if city:
        results = [r for r in results if city.lower() == r["city"].lower()]

    if cuisine:
        results = [r for r in results if cuisine.lower() == r["cuisine"].lower()]

    if food:
        results = [
            r for r in results
            if any(food.lower() in item.lower() for item in r["menu"])
        ]

    return jsonify(results)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8004)
