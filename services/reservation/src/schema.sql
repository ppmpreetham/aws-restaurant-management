-- Reservation + Payment Service database schema
-- Run this against the reservation database before starting the service.

CREATE TABLE IF NOT EXISTS reservation_tables (
  id              SERIAL PRIMARY KEY,
  restaurant_id   INT NOT NULL,
  table_number    VARCHAR(50) NOT NULL,
  capacity        INT NOT NULL CHECK (capacity > 0),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE (restaurant_id, table_number)
);

CREATE TABLE IF NOT EXISTS reservations (
  id                        BIGSERIAL PRIMARY KEY,
  restaurant_id             INT NOT NULL,
  table_id                  INT NOT NULL REFERENCES reservation_tables(id),
  customer_id               VARCHAR(120) NOT NULL,
  customer_name             VARCHAR(255) NOT NULL,
  customer_email            VARCHAR(255) NOT NULL,
  party_size                INT NOT NULL CHECK (party_size > 0),
  reservation_date          DATE NOT NULL,
  slot_start                TIME NOT NULL,
  slot_end                  TIME NOT NULL,
  status                    VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT'
                            CHECK (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'PAYMENT_FAILED')),
  idempotency_key           VARCHAR(160) NOT NULL UNIQUE,
  notes                     TEXT,
  notification_status       VARCHAR(20) NOT NULL DEFAULT 'NOT_SENT'
                            CHECK (notification_status IN ('NOT_SENT', 'PENDING', 'SENT', 'FAILED', 'SKIPPED')),
  notification_message_id   VARCHAR(255),
  notification_error        TEXT,
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW(),
  cancelled_at              TIMESTAMP,
  CHECK (slot_end > slot_start)
);

CREATE TABLE IF NOT EXISTS payments (
  id                  BIGSERIAL PRIMARY KEY,
  reservation_id      BIGINT NOT NULL REFERENCES reservations(id),
  amount_cents        INT NOT NULL CHECK (amount_cents > 0),
  currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
  payment_method      VARCHAR(50) NOT NULL,
  status              VARCHAR(20) NOT NULL
                      CHECK (status IN ('SUCCEEDED', 'FAILED', 'REFUNDED')),
  provider_reference  VARCHAR(120),
  failure_reason      TEXT,
  idempotency_key     VARCHAR(160) NOT NULL UNIQUE,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservation_tables_restaurant
  ON reservation_tables(restaurant_id, is_active);

CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_date
  ON reservations(restaurant_id, reservation_date, status);

CREATE INDEX IF NOT EXISTS idx_reservations_table_slot
  ON reservations(table_id, reservation_date, slot_start, slot_end);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_same_slot
  ON reservations(restaurant_id, table_id, reservation_date, slot_start)
  WHERE status IN ('PENDING_PAYMENT', 'CONFIRMED');

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_one_success
  ON payments(reservation_id)
  WHERE status = 'SUCCEEDED';
