-- Restaurant Service database schema
-- Run this once against your Postgres database (local or RDS) before starting the app.

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

-- Lightweight record of an order from the restaurant's point of view.
-- The full order (customer, payment, delivery) lives in Arnav's Order service;
-- this table only tracks what the restaurant needs: what came in, and its decision.
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id                  SERIAL PRIMARY KEY,
  external_order_id   VARCHAR(100) NOT NULL,    -- the order id from the Order service
  restaurant_id       INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  items_snapshot      JSONB,                    -- copy of items at the time the order came in
  status              VARCHAR(20) NOT NULL DEFAULT 'pending',
                      -- pending -> accepted | rejected -> completed
  reason              TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_restaurant_id ON restaurant_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_external_id ON restaurant_orders(external_order_id);
