import { HttpError } from '../errors';
import { withTransaction } from '../db';
import { CreatePaymentInput, Payment, Reservation } from '../types';

function defaultCurrency(): string {
  return (process.env.PAYMENT_CURRENCY ?? 'INR').slice(0, 3).toUpperCase();
}

function depositPerGuestCents(): number {
  const parsed = Number(process.env.DEPOSIT_PER_GUEST_CENTS ?? 500);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 500;
}

function paymentReference(reservationId: number): string {
  return `sim_${reservationId}_${Date.now()}`;
}

export async function createPayment(
  input: CreatePaymentInput
): Promise<{ reservation: Reservation; payment: Payment; duplicate: boolean }> {
  return withTransaction(async (client) => {
    const duplicatePayment = await client.query<Payment>(
      `SELECT * FROM payments WHERE idempotency_key = $1 FOR UPDATE`,
      [input.idempotencyKey]
    );

    if (duplicatePayment.rows[0]) {
      const reservation = await client.query<Reservation>(
        `SELECT * FROM reservations WHERE id = $1`,
        [duplicatePayment.rows[0].reservation_id]
      );
      return {
        reservation: reservation.rows[0],
        payment: duplicatePayment.rows[0],
        duplicate: true,
      };
    }

    const reservationResult = await client.query<Reservation>(
      `SELECT * FROM reservations WHERE id = $1 FOR UPDATE`,
      [input.reservationId]
    );

    const reservation = reservationResult.rows[0];
    if (!reservation) {
      throw new HttpError(404, 'Reservation not found');
    }

    if (reservation.status === 'CANCELLED') {
      throw new HttpError(409, 'Cannot pay for a cancelled reservation');
    }

    if (reservation.status === 'CONFIRMED') {
      throw new HttpError(409, 'Reservation is already confirmed');
    }

    if (reservation.status === 'PAYMENT_FAILED') {
      throw new HttpError(409, 'Payment already failed for this reservation; create a new reservation');
    }

    const amountCents = input.amountCents ?? reservation.party_size * depositPerGuestCents();
    const currency = input.currency ?? defaultCurrency();

    if (input.simulateFailure) {
      const failedPayment = await client.query<Payment>(
        `INSERT INTO payments (
           reservation_id,
           amount_cents,
           currency,
           payment_method,
           status,
           failure_reason,
           idempotency_key
         )
         VALUES ($1, $2, $3, $4, 'FAILED', $5, $6)
         RETURNING *`,
        [
          reservation.id,
          amountCents,
          currency,
          input.paymentMethod,
          'Simulated payment failure',
          input.idempotencyKey,
        ]
      );

      const updatedReservation = await client.query<Reservation>(
        `UPDATE reservations
         SET status = 'PAYMENT_FAILED',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [reservation.id]
      );

      return {
        reservation: updatedReservation.rows[0],
        payment: failedPayment.rows[0],
        duplicate: false,
      };
    }

    const payment = await client.query<Payment>(
      `INSERT INTO payments (
         reservation_id,
         amount_cents,
         currency,
         payment_method,
         status,
         provider_reference,
         idempotency_key
       )
       VALUES ($1, $2, $3, $4, 'SUCCEEDED', $5, $6)
       RETURNING *`,
      [
        reservation.id,
        amountCents,
        currency,
        input.paymentMethod,
        paymentReference(reservation.id),
        input.idempotencyKey,
      ]
    );

    const confirmedReservation = await client.query<Reservation>(
      `UPDATE reservations
       SET status = 'CONFIRMED',
           notification_status = 'PENDING',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [reservation.id]
    );

    return {
      reservation: confirmedReservation.rows[0],
      payment: payment.rows[0],
      duplicate: false,
    };
  });
}
