#!/bin/bash

# Script để export dữ liệu từ PostgreSQL local và import vào Docker container

echo "🔄 Bắt đầu chuyển dữ liệu từ PostgreSQL local vào Docker..."

# 1. Export dữ liệu từ PostgreSQL local
echo "📤 Đang export dữ liệu từ PostgreSQL local..."
PGPASSWORD=bao12345 pg_dump -h 127.0.0.1 -p 5432 -U bao -d web \
  --format=custom \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f /tmp/pjweb_backup.dump

if [ $? -eq 0 ]; then
    echo "✅ Export thành công!"
else
    echo "❌ Export thất bại!"
    exit 1
fi

# 2. Copy file backup vào container
echo "📁 Đang copy file backup vào container..."
docker cp /tmp/pjweb_backup.dump pj_postgres:/tmp/pjweb_backup.dump

if [ $? -eq 0 ]; then
    echo "✅ Copy thành công!"
else
    echo "❌ Copy thất bại!"
    exit 1
fi

# 3. Import dữ liệu vào PostgreSQL trong container
echo "📥 Đang import dữ liệu vào PostgreSQL container..."
docker exec pj_postgres pg_restore \
  -U hoangyen \
  -d data \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  /tmp/pjweb_backup.dump

if [ $? -eq 0 ]; then
    echo "✅ Import thành công!"
else
    echo "⚠️  Import hoàn tất với một số cảnh báo (bình thường)"
fi

# 4. Dọn dẹp
echo "🧹 Đang dọn dẹp..."
rm -f /tmp/pjweb_backup.dump
docker exec pj_postgres rm -f /tmp/pjweb_backup.dump

echo "✨ Hoàn tất! Dữ liệu đã được chuyển vào Docker container."
echo "🔍 Kiểm tra bằng lệnh: docker exec -it pj_postgres psql -U hoangyen -d data -c '\\dt'"
