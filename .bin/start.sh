#!/bin/sh

startApp() {
    cd /app/api && node index.js
    exit
}

# default environment
DB_CONF="development"

# sqlite3 db file
DB_FILE="mnt/something.db"

if [ ! -f "$DB_FILE" ]; then
    echo "Creating a new database at $DB_FILE"
    cd /app/api && npx knex migrate:latest && npx knex seed:run
    cd ..
else
    echo "Database: $DB_FILE"
fi

startApp
