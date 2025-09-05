#!/bin/sh

echo "waiting for postgres..."
until nc -z postgres 5432; do
  echo "postgres is unavailable - waiting..."
  sleep 1
done

echo "postgres is running - executing migrations"

npm run migration:run

echo "migrations completed - starting the server"

exec "$@"