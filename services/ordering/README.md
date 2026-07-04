# Order Service

## Overview

The Order Service is an independent microservice for the Restaurant Reservation and Ordering System.

It is responsible for:

- Creating customer orders
- Storing orders in PostgreSQL
- Managing order items
- Retrieving order history
- Cancelling orders

This service is designed to integrate with the Restaurant Service, Reservation Service and Payment Service.

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL

---

## Features

- Create Order
- Get All Orders
- Get Order By ID
- Cancel Order
- PostgreSQL Database
- REST API

---

## API Endpoints

### Health Check

GET

```
/health
```

---

### Create Order

POST

```
/api/orders
```

Example

```json
{
  "customerName": "Arnav",
  "restaurantId": 1,
  "items": [
    {
      "name": "Burger",
      "quantity": 2,
      "price": 250
    }
  ]
}
```

---

### Get All Orders

GET

```
/api/orders
```

---

### Get Single Order

GET

```
/api/orders/:id
```

---

### Cancel Order

PATCH

```
/api/orders/:id/cancel
```

---

## Database

### orders

- id
- customer_name
- restaurant_id
- status
- total
- created_at

### order_items

- id
- order_id
- item_name
- quantity
- price

---

## Running Locally

Install dependencies

```bash
pnpm install
```

Run

```bash
pnpm dev
```

The server starts on

```
http://localhost:4002
```

---

## Future Improvements

- Payment Gateway Integration
- Restaurant Service Integration
- Kitchen Notification Service
- Order Tracking
- AWS Deployment