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
