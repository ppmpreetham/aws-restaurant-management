# Reservation + Payment Service

Preetham's service owns reservation and payment workflow for the restaurant system.

## Responsibilities

- Check slot availability.
- Create pending reservations with idempotency keys.
- Prevent double booking with a Postgres transaction and `FOR UPDATE SKIP LOCKED`.
- Confirm or fail simulated payments.
- Publish confirmation notifications to SNS when `SNS_TOPIC_ARN` is configured.

## API

All routes are mounted under `/api`.

```http
GET /api/availability?restaurantId=1&date=2026-07-03&partySize=4
POST /api/reservations
DELETE /api/reservations/:id
POST /api/payments
```

Create reservation:

```json
{
  "restaurantId": 1,
  "customerId": "user-123",
  "customerName": "Preetham",
  "customerEmail": "preetham@example.com",
  "partySize": 4,
  "reservationDate": "2026-07-03",
  "slotStart": "19:00",
  "slotEnd": "20:00",
  "idempotencyKey": "reservation-user-123-2026-07-03-1900"
}
```

Pay reservation:

```json
{
  "reservationId": 1,
  "paymentMethod": "card",
  "idempotencyKey": "payment-user-123-reservation-1"
}
```

Use `"simulateFailure": true` in the payment request to demo a failed payment.

## Local Setup

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

`seed` creates local bookable table rows for demo restaurants `1`, `2`, and `3`.
