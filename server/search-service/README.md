# Restaurant Search Microservice

## Overview

The Restaurant Search Microservice is part of a Restaurant Reservation and Ordering System built using a Microservices Architecture.

This service allows users to search restaurants by:

- Restaurant Name
- City
- Cuisine
- Food Items

The application is deployed on Amazon EC2 using Python Flask.

---

## AWS Service Used

- Amazon EC2
- Amazon CloudWatch

---

## Technologies

- Python 3
- Flask
- JSON
- REST API

---

## Project Structure

search-service/
│
├── app.py
├── restaurants.json
├── requirements.txt
└── README.md

---

## REST APIs

### Get All Restaurants

GET /restaurants

---

### Search by Name

GET /search?name=Pizza

---

### Search by City

GET /search?city=Bhopal

---

### Search by Cuisine

GET /search?cuisine=Italian

---

### Search by Food

GET /search?food=Burger

---

## Running the Application

Install dependencies

pip3 install -r requirements.txt

Run the application

python3 app.py

Application URL

http://localhost:8004

---

## Developed By

Sahil Gautam

B.Tech Cloud Computing and Automation
