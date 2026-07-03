# Restaurant Search Microservice

## Overview

The Restaurant Search Microservice is part of a Restaurant Reservation and Ordering System built using a Microservices Architecture.

This service allows users to search restaurants by:

- Restaurant Name
- City
- Cuisine
- Food Items

The application is deployed on Amazon EC2 using Node.js and Express.js.

---

## AWS Service Used

- Amazon EC2
- Amazon CloudWatch

---

## Technologies

- Node.js
- Express.js
- JSON
- REST API

---

## Project Structure

search-service/
│
├── app.js
├── restaurants.json
├── package.json
└── README.md

---

## REST APIs

### Home

GET /

Returns a message indicating that the Search Microservice is running.

---

### Get All Restaurants

GET /restaurants

Returns a list of all available restaurants.

---

### Search by Name

GET /search?name=Pizza

Returns restaurants matching the specified name.

---

### Search by City

GET /search?city=Bhopal

Returns restaurants located in the specified city.

---

### Search by Cuisine

GET /search?cuisine=Italian

Returns restaurants serving the specified cuisine.

---

### Search by Food Item

GET /search?food=Burger

Returns restaurants serving the specified food item.

---

## Running the Application

Install project dependencies

```bash
npm install
```

Start the application

```bash
npm start
```

or

```bash
node app.js
```

Application URL

```
http://localhost:8004
```

---

## Features

- Search restaurants by name
- Search restaurants by city
- Search restaurants by cuisine
- Search restaurants by food item
- View all restaurants
- RESTful API using Express.js

---

## Developer

**Sahil Gautam**

B.Tech – Cloud Computing and Automation

---

## License

This project is developed for academic purposes as part of the **Restaurant Reservation and Ordering System** using a **Microservices Architecture**.
