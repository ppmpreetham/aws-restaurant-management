export type ReservationStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export type PaymentStatus = 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export type NotificationStatus = 'NOT_SENT' | 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';

export interface ReservationTable {
  id: number;
  restaurant_id: number;
  table_number: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface Reservation {
  id: number;
  restaurant_id: number;
  table_id: number;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  party_size: number;
  reservation_date: string;
  slot_start: string;
  slot_end: string;
  status: ReservationStatus;
  idempotency_key: string;
  notes: string | null;
  notification_status: NotificationStatus;
  notification_message_id: string | null;
  notification_error: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
}

export interface Payment {
  id: number;
  reservation_id: number;
  amount_cents: number;
  currency: string;
  payment_method: string;
  status: PaymentStatus;
  provider_reference: string | null;
  failure_reason: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  date: string;
  slotStart: string;
  slotEnd: string;
  availableTables: number;
  maxPartySize: number | null;
  isAvailable: boolean;
}

export interface CreateReservationInput {
  restaurantId: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  partySize: number;
  reservationDate: string;
  slotStart: string;
  slotEnd: string;
  idempotencyKey: string;
  notes?: string;
}

export interface CreatePaymentInput {
  reservationId: number;
  paymentMethod: string;
  idempotencyKey: string;
  amountCents?: number;
  currency?: string;
  simulateFailure?: boolean;
}
