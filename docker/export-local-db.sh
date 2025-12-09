#!/bin/bash

# Script đơn giản hơn - export dạng SQL thuần

echo "🔄 Export dữ liệu PostgreSQL local sang SQL file..."

# Export dạng SQL
PGPASSWORD=bao12345 pg_dump -h 127.0.0.1 -p 5432 -U bao -d web \
  --format=plain \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f /tmp/pjweb_backup.sql

if [ $? -eq 0 ]; then
    echo "✅ Export thành công! File: /tmp/pjweb_backup.sql"
    echo "📋 Để import vào Docker, chạy:"
    echo "   docker cp /tmp/pjweb_backup.sql pj_postgres:/tmp/"
    echo "   docker exec -it pj_postgres psql -U hoangyen -d data -f /tmp/pjweb_backup.sql"
else
    echo "❌ Export thất bại!"
    exit 1
fi
