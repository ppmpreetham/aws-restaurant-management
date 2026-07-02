import { Router, Request, Response } from 'express';
import { HttpError } from '../errors';
import { checkRestaurantForReservation } from '../clients/restaurant.client';
import { publishReservationConfirmation } from '../notifications/snsPublisher';
import {
  cancelReservation,
  createReservation,
  getAvailability,
  getReservationById,
  updateNotificationStatus,
} from '../models/reservation.model';
import { createPayment } from '../models/payment.model';
import {
  assertSlotOrder,
  normalizeDate,
  normalizeTime,
  optionalPositiveInteger,
  optionalString,
  positiveInteger,
  requireString,
  validateEmail,
} from '../utils/validation';

const router = Router();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseReservationBody(body: Record<string, unknown>) {
  const slotStart = normalizeTime(body.slotStart, 'slotStart');
  const slotEnd = normalizeTime(body.slotEnd, 'slotEnd');
  assertSlotOrder(slotStart, slotEnd);

  return {
    restaurantId: positiveInteger(body.restaurantId, 'restaurantId'),
    customerId: requireString(body.customerId, 'customerId', 120),
    customerName: requireString(body.customerName, 'customerName', 255),
    customerEmail: validateEmail(body.customerEmail),
    partySize: positiveInteger(body.partySize, 'partySize'),
    reservationDate: normalizeDate(body.reservationDate, 'reservationDate'),
    slotStart,
    slotEnd,
    idempotencyKey: requireString(body.idempotencyKey, 'idempotencyKey', 160),
    notes: optionalString(body.notes, 'notes'),
  };
}

// GET /api/availability?restaurantId=1&date=2026-07-03&partySize=4
router.get('/availability', async (req: Request, res: Response) => {
  const restaurantId = positiveInteger(req.query.restaurantId, 'restaurantId');
  const date = normalizeDate(req.query.date ?? today(), 'date');
  const partySize = positiveInteger(req.query.partySize ?? 2, 'partySize');

  const rawSlotStart = req.query.slotStart;
  const rawSlotEnd = req.query.slotEnd;
  const slotStart = rawSlotStart ? normalizeTime(rawSlotStart, 'slotStart') : undefined;
  const slotEnd = rawSlotEnd ? normalizeTime(rawSlotEnd, 'slotEnd') : undefined;

  if ((slotStart && !slotEnd) || (!slotStart && slotEnd)) {
    throw new HttpError(400, 'slotStart and slotEnd must be provided together');
  }
  if (slotStart && slotEnd) assertSlotOrder(slotStart, slotEnd);

  const restaurant = await checkRestaurantForReservation(restaurantId);
  const slots = await getAvailability({ restaurantId, date, partySize, slotStart, slotEnd });

  res.json({
    restaurant,
    date,
    partySize,
    slots,
  });
});

// POST /api/reservations
router.post('/reservations', async (req: Request, res: Response) => {
  const input = parseReservationBody(req.body ?? {});
  const restaurant = await checkRestaurantForReservation(input.restaurantId);
  const result = await createReservation(input);

  res.status(result.duplicate ? 200 : 201).json({
    duplicate: result.duplicate,
    restaurant,
    reservation: result.reservation,
    payment: {
      required: result.reservation.status === 'PENDING_PAYMENT',
      endpoint: '/api/payments',
    },
  });
});

// GET /api/reservations/:id - useful for frontend/integration smoke checks.
router.get('/reservations/:id', async (req: Request, res: Response) => {
  const id = positiveInteger(req.params.id, 'reservationId');
  const reservation = await getReservationById(id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  res.json(reservation);
});

// DELETE /api/reservations/:id
router.delete('/reservations/:id', async (req: Request, res: Response) => {
  const id = positiveInteger(req.params.id, 'reservationId');
  const reservation = await cancelReservation(id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  res.json(reservation);
});

// POST /api/payments
router.post('/payments', async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const amountCents = optionalPositiveInteger(body.amountCents, 'amountCents');
  const result = await createPayment({
    reservationId: positiveInteger(body.reservationId, 'reservationId'),
    paymentMethod: requireString(body.paymentMethod, 'paymentMethod', 50),
    idempotencyKey: requireString(body.idempotencyKey, 'idempotencyKey', 160),
    amountCents,
    currency: optionalString(body.currency, 'currency', 3)?.toUpperCase(),
    simulateFailure: body.simulateFailure === true,
  });

  if (result.payment.status === 'FAILED') {
    return res.status(402).json(result);
  }

  let notification;
  if (result.payment.status === 'SUCCEEDED' && !result.duplicate) {
    notification = await publishReservationConfirmation(result.reservation, result.payment);
    await updateNotificationStatus(
      result.reservation.id,
      notification.status,
      notification.messageId,
      notification.error
    );
  }

  res.status(result.duplicate ? 200 : 201).json({
    ...result,
    notification,
  });
});

export default router;
