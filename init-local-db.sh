#!/bin/bash
set -e

echo "Initializing Local Database Roles and Schemas..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Restaurant Service
    CREATE USER restaurant_user WITH PASSWORD 'restaurant_pass';
    CREATE DATABASE restaurant_db;
    GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;
    ALTER DATABASE restaurant_db OWNER TO restaurant_user;

    -- Reservation Service
    CREATE USER reservation_user WITH PASSWORD 'reservation_pass';
    CREATE DATABASE reservation_db;
    GRANT ALL PRIVILEGES ON DATABASE reservation_db TO reservation_user;
    ALTER DATABASE reservation_db OWNER TO reservation_user;

    -- Ordering Service
    CREATE USER ordering_user WITH PASSWORD 'ordering_pass';
    CREATE DATABASE ordering_db;
    GRANT ALL PRIVILEGES ON DATABASE ordering_db TO ordering_user;
    ALTER DATABASE ordering_db OWNER TO ordering_user;

    -- Search Service
    CREATE USER search_user WITH PASSWORD 'search_pass';
    CREATE DATABASE search_db;
    GRANT ALL PRIVILEGES ON DATABASE search_db TO search_user;
    ALTER DATABASE search_db OWNER TO search_user;
EOSQL

echo "Running Migrations..."

psql -v ON_ERROR_STOP=1 --username "restaurant_user" --dbname "restaurant_db" -f /schemas/restaurant/src/schema.sql
psql -v ON_ERROR_STOP=1 --username "reservation_user" --dbname "reservation_db" -f /schemas/reservation/src/schema.sql
psql -v ON_ERROR_STOP=1 --username "ordering_user" --dbname "ordering_db" -f /schemas/ordering/src/schema.sql

echo "Local Database Initialization Complete!"
