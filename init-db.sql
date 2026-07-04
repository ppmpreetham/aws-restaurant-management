-- Create specific users
CREATE USER restaurant_user WITH PASSWORD 'restaurant_pass';
CREATE USER reservation_user WITH PASSWORD 'reservation_pass';
CREATE USER ordering_user WITH PASSWORD 'ordering_pass';
CREATE USER search_user WITH PASSWORD 'search_pass';

-- Create databases
CREATE DATABASE restaurant_db OWNER restaurant_user;
CREATE DATABASE reservation_db OWNER reservation_user;
CREATE DATABASE ordering_db OWNER ordering_user;
CREATE DATABASE search_db OWNER search_user;

-- Revoke all on databases from public
REVOKE ALL PRIVILEGES ON DATABASE restaurant_db FROM PUBLIC;
REVOKE ALL PRIVILEGES ON DATABASE reservation_db FROM PUBLIC;
REVOKE ALL PRIVILEGES ON DATABASE ordering_db FROM PUBLIC;
REVOKE ALL PRIVILEGES ON DATABASE search_db FROM PUBLIC;

\connect restaurant_db;

CREATE TABLE IF NOT EXISTS restaurants (
  id                      SERIAL PRIMARY KEY,
  name                    VARCHAR(255) NOT NULL,
  description             TEXT,
  cuisine_type            VARCHAR(100),
  rating                  NUMERIC(2,1) DEFAULT 0,
  price_range             VARCHAR(10),              -- '$', '$$', '$$$'
  address                 VARCHAR(255),
  image_url               TEXT,
  is_open                 BOOLEAN DEFAULT true,
  max_concurrent_orders   INT DEFAULT 10,            -- capacity used by the inventory endpoint
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id              SERIAL PRIMARY KEY,
  restaurant_id   INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  category        VARCHAR(100),
  image_url       TEXT,
  is_available    BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurant_orders (
  id                  SERIAL PRIMARY KEY,
  external_order_id   VARCHAR(100) NOT NULL,
  restaurant_id       INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  items_snapshot      JSONB,
  status              VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_restaurant_id ON restaurant_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_external_id ON restaurant_orders(external_order_id);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO restaurant_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO restaurant_user;

\connect reservation_db;

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

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO reservation_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO reservation_user;

\connect ordering_db;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_uuid UUID NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    restaurant_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ordering_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ordering_user;
