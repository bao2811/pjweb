#!/bin/bash

# Script để thêm event_id vào bảng likes trong PostgreSQL Docker container
# Usage: ./migrate_add_event_id.sh

set -e

echo "🔄 Starting migration: Add event_id to likes table..."
echo ""

# Database connection info
DB_CONTAINER="pj_postgres"
DB_NAME="web"
DB_USER="bao"
DB_PASSWORD="bao12345"
MIGRATION_FILE="add_event_id_to_likes.sql"

# Check if Docker container is running
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo "❌ Error: PostgreSQL container '$DB_CONTAINER' is not running!"
    echo "Please start the container first with: docker-compose up -d postgres"
    exit 1
fi

echo "✅ PostgreSQL container is running"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file '$MIGRATION_FILE' not found!"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Run migration
echo "🚀 Running migration..."
echo ""

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Summary:"
    echo "  - Added column: event_id (BIGINT, nullable)"
    echo "  - Updated column: post_id (nullable)"
    echo "  - Added foreign key: likes_event_id_fkey → events(id)"
    echo "  - Created index: likes_user_post_unique (partial)"
    echo "  - Created index: likes_user_event_unique (partial)"
    echo ""
    echo "🎉 You can now use Event Likes feature!"
    echo ""
    echo "API Endpoints:"
    echo "  - POST /api/likes/event/like/{id}"
    echo "  - POST /api/likes/event/unlike/{id}"
    echo "  - GET  /api/likes/event/{id}"
else
    echo ""
    echo "❌ Migration failed! Check the error messages above."
    exit 1
fi
