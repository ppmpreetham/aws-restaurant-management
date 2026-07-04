-- Ordering Service database schema

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_uuid UUID NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    restaurant_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    reason TEXT,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    credits NUMERIC(10,2) NOT NULL DEFAULT 500.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'ORDER_PAYMENT', 'REFUND'
    amount NUMERIC(10,2) NOT NULL,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a mock user for testing
INSERT INTO users (name, credits) VALUES ('admin', 500.00) ON CONFLICT DO NOTHING;
