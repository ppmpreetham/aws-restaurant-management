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

-- Seed Data
INSERT INTO restaurants (name, description, cuisine_type, rating, price_range, address, image_url, is_open)
VALUES 
('The Spice Garden', 'Authentic Indian cuisine with a modern twist.', 'Indian', 4.5, '$$', '123 Curry Lane, Foodville', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', true),
('Sushi Master', 'Fresh sushi and sashimi prepared daily.', 'Japanese', 4.8, '$$$', '456 Ocean Ave, Seaside', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c', true),
('Burger Joint', 'Classic American burgers and fries.', 'American', 4.2, '$', '789 Main St, Downtown', 'https://images.unsplash.com/photo-1550547660-d9450f859349', true);

INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available)
VALUES 
(1, 'Chicken Tikka Masala', 'Tender chicken cooked in a rich, creamy tomato sauce.', 15.99, 'Main Course', true),
(1, 'Garlic Naan', 'Freshly baked flatbread topped with garlic and cilantro.', 3.99, 'Sides', true),
(2, 'Spicy Tuna Roll', 'Fresh tuna with spicy mayo and cucumber.', 8.99, 'Sushi', true),
(2, 'Salmon Nigiri', 'Two pieces of fresh salmon over seasoned rice.', 6.99, 'Sushi', true),
(3, 'Cheeseburger', 'Beef patty topped with cheddar cheese, lettuce, and tomato.', 9.99, 'Burgers', true),
(3, 'French Fries', 'Crispy golden fries seasoned with sea salt.', 3.99, 'Sides', true);
