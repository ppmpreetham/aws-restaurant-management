import { PoolClient } from 'pg';
import { HttpError } from '../errors';
import { pool, withTransaction } from '../db';
import {
  AvailabilitySlot,
  CreateReservationInput,
  NotificationStatus,
  Reservation,
  ReservationTable,
} from '../types';

const ACTIVE_RESERVATION_STATUSES = ['PENDING_PAYMENT', 'CONFIRMED'];

function defaultOpenTime(): string {
  return process.env.DEFAULT_OPEN_TIME ?? '18:00:00';
}

function defaultCloseTime(): string {
  return process.env.DEFAULT_CLOSE_TIME ?? '22:00:00';
}

function defaultSlotMinutes(): number {
  const parsed = Number(process.env.DEFAULT_SLOT_MINUTES ?? 60);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 60;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (value % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:00`;
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export async function getAvailability(input: {
  restaurantId: number;
  date: string;
  partySize: number;
  slotStart?: string;
  slotEnd?: string;
}): Promise<AvailabilitySlot[]> {
  const tablesResult = await pool.query<ReservationTable>(
    `SELECT *
     FROM reservation_tables
     WHERE restaurant_id = $1 AND capacity >= $2 AND is_active = true
     ORDER BY capacity ASC, id ASC`,
    [input.restaurantId, input.partySize]
  );

  const tables = tablesResult.rows;
  if (tables.length === 0) return [];

  const reservationsResult = await pool.query<Reservation>(
    `SELECT *
     FROM reservations
     WHERE restaurant_id = $1
       AND reservation_date = $2
       AND status = ANY($3::text[])`,
    [input.restaurantId, input.date, ACTIVE_RESERVATION_STATUSES]
  );

  const windows =
    input.slotStart && input.slotEnd
      ? [{ slotStart: input.slotStart, slotEnd: input.slotEnd }]
      : buildDefaultWindows();

  return windows.map(({ slotStart, slotEnd }) => {
    const availableTables = tables.filter((table) => {
      return !reservationsResult.rows.some((reservation) => {
        return (
          reservation.table_id === table.id &&
          overlaps(slotStart, slotEnd, reservation.slot_start, reservation.slot_end)
        );
      });
    });

    const maxPartySize =
      availableTables.length > 0
        ? Math.max(...availableTables.map((table) => table.capacity))
        : null;

    return {
      date: input.date,
      slotStart,
      slotEnd,
      availableTables: availableTables.length,
      maxPartySize,
      isAvailable: availableTables.length > 0,
    };
  });
}

function buildDefaultWindows(): Array<{ slotStart: string; slotEnd: string }> {
  const open = timeToMinutes(defaultOpenTime());
  const close = timeToMinutes(defaultCloseTime());
  const slotMinutes = defaultSlotMinutes();
  const windows: Array<{ slotStart: string; slotEnd: string }> = [];

  for (let start = open; start + slotMinutes <= close; start += slotMinutes) {
    windows.push({
      slotStart: minutesToTime(start),
      slotEnd: minutesToTime(start + slotMinutes),
    });
  }

  return windows;
}

export async function createReservation(
  input: CreateReservationInput
): Promise<{ reservation: Reservation; duplicate: boolean }> {
  return withTransaction(async (client) => {
    const duplicate = await client.query<Reservation>(
      `SELECT * FROM reservations WHERE idempotency_key = $1 FOR UPDATE`,
      [input.idempotencyKey]
    );

    if (duplicate.rows[0]) {
      return { reservation: duplicate.rows[0], duplicate: true };
    }

    const table = await findAndLockAvailableTable(client, input);
    if (!table) {
      throw new HttpError(409, 'No table is available for that party size and slot');
    }

    const result = await client.query<Reservation>(
      `INSERT INTO reservations (
         restaurant_id,
         table_id,
         customer_id,
         customer_name,
         customer_email,
         party_size,
         reservation_date,
         slot_start,
         slot_end,
         status,
         idempotency_key,
         notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::time, $9::time, 'PENDING_PAYMENT', $10, $11)
       RETURNING *`,
      [
        input.restaurantId,
        table.id,
        input.customerId,
        input.customerName,
        input.customerEmail,
        input.partySize,
        input.reservationDate,
        input.slotStart,
        input.slotEnd,
        input.idempotencyKey,
        input.notes ?? null,
      ]
    );

    return { reservation: result.rows[0], duplicate: false };
  });
}

async function findAndLockAvailableTable(
  client: PoolClient,
  input: CreateReservationInput
): Promise<ReservationTable | null> {
  const result = await client.query<ReservationTable>(
    `SELECT t.*
     FROM reservation_tables t
     WHERE t.restaurant_id = $1
       AND t.capacity >= $2
       AND t.is_active = true
       AND NOT EXISTS (
         SELECT 1
         FROM reservations r
         WHERE r.restaurant_id = t.restaurant_id
           AND r.table_id = t.id
           AND r.reservation_date = $3
           AND r.status = ANY($6::text[])
           AND r.slot_start < $5::time
           AND r.slot_end > $4::time
       )
     ORDER BY t.capacity ASC, t.id ASC
     LIMIT 1
     FOR UPDATE SKIP LOCKED`,
    [
      input.restaurantId,
      input.partySize,
      input.reservationDate,
      input.slotStart,
      input.slotEnd,
      ACTIVE_RESERVATION_STATUSES,
    ]
  );

  return result.rows[0] ?? null;
}

export async function getReservationById(id: number): Promise<Reservation | null> {
  const result = await pool.query<Reservation>(`SELECT * FROM reservations WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function cancelReservation(id: number): Promise<Reservation | null> {
  return withTransaction(async (client) => {
    const existing = await client.query<Reservation>(
      `SELECT * FROM reservations WHERE id = $1 FOR UPDATE`,
      [id]
    );

    const reservation = existing.rows[0];
    if (!reservation) return null;

    if (reservation.status === 'CANCELLED') {
      return reservation;
    }

    const result = await client.query<Reservation>(
      `UPDATE reservations
       SET status = 'CANCELLED',
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  });
}

export async function updateNotificationStatus(
  reservationId: number,
  status: NotificationStatus,
  messageId?: string,
  error?: string
): Promise<Reservation | null> {
  const result = await pool.query<Reservation>(
    `UPDATE reservations
     SET notification_status = $2,
         notification_message_id = $3,
         notification_error = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [reservationId, status, messageId ?? null, error ?? null]
  );

  return result.rows[0] ?? null;
}
