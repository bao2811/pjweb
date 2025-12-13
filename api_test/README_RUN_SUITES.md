# Test Suite Runner - Hướng dẫn sử dụng

## Script: `run_all_suites.py`

Script toàn diện để chạy tất cả test suites trong thư mục `suites/` với đầy đủ performance benchmarking và metrics collection.

## Tính năng

✅ **Chạy tất cả suites tự động** - Tìm và chạy tất cả file .yaml trong thư mục suites/  
✅ **Performance benchmarking thực sự** - Repeat loop với concurrency thực tế  
✅ **Metrics đầy đủ** - min, max, avg, median, p95, p99, std_dev  
✅ **Phân loại tự động** - Functional, Performance, Concurrency, Retry  
✅ **Quick mode** - Giảm số lần lặp để test nhanh  
✅ **JSON export** - Lưu kết quả chi tiết vào file

## Cách sử dụng

### 1. Chạy cơ bản (tất cả suites, full benchmarking)

```bash
source venv/bin/activate
python3 api_test/run_all_suites.py
```

### 2. Quick mode (giảm iterations cho test nhanh)

```bash
python3 api_test/run_all_suites.py --quick
```

### 3. Tùy chỉnh base URL

```bash
python3 api_test/run_all_suites.py --base-url http://localhost:9000
```

### 4. Chạy với pattern cụ thể

```bash
# Chỉ chạy performance suites
python3 api_test/run_all_suites.py --pattern "*performance*.yaml"

# Chỉ chạy suite 1 và 2
python3 api_test/run_all_suites.py --pattern "test_suite_[12]*.yaml"
```

### 5. Tùy chỉnh thư mục suites

```bash
python3 api_test/run_all_suites.py --suites-dir /path/to/other/suites
```

## Output

### Console Output

Script sẽ in ra:

- Tiến trình chạy từng suite
- Metrics real-time cho mỗi test
- Bảng tổng kết theo category (Functional, Performance, Concurrency, Retry)
- Performance metrics: min, max, avg, p95, p99
- Success rate và threshold checks

Ví dụ:

```
================================================================================
Running: test_suite_4_performance.yaml
================================================================================

  [1/4] Test API /api/posts with performance benchmark

    Mode: sync | Repeat: 100 | Concurrency: 10
    ✓ Completed: 100/100 requests
    ⏱  Min: 45.23ms | Avg: 67.89ms | Max: 123.45ms | P95: 98.76ms
    Threshold: 100ms → ✓ PASS
```

### JSON Output

Kết quả chi tiết được lưu tại: `api_test/reports/all_suites_results.json`

```json
{
  "timestamp": "2025-12-12T10:30:00",
  "base_url": "http://localhost:8000",
  "results": {
    "functional": [...],
    "performance": [
      {
        "suite_name": "test_suite_4_performance",
        "tests": [
          {
            "name": "Test API /api/posts",
            "type": "performance",
            "metrics": {
              "min_ms": 45.23,
              "max_ms": 123.45,
              "avg_ms": 67.89,
              "median_ms": 65.12,
              "p95_ms": 98.76,
              "p99_ms": 115.34,
              "std_dev": 15.67,
              "successful": 100,
              "total_requests": 100,
              "mode": "sync",
              "concurrency": 10
            }
          }
        ]
      }
    ],
    "concurrency": [...],
    "retry": [...]
  }
}
```

## Metrics giải thích

- **min_ms**: Thời gian response nhanh nhất
- **max_ms**: Thời gian response chậm nhất
- **avg_ms**: Thời gian trung bình
- **median_ms**: Trung vị (50th percentile)
- **p95_ms**: 95% requests nhanh hơn giá trị này
- **p99_ms**: 99% requests nhanh hơn giá trị này
- **std_dev**: Độ lệch chuẩn (càng thấp càng ổn định)
- **mode**: sync (ThreadPool) hoặc async (asyncio)
- **concurrency**: Số requests chạy đồng thời

## Performance Benchmarking

Script sử dụng:

### Sync mode (ThreadPoolExecutor)

```yaml
performance:
  repeat: 100
  concurrency: 10
  mode: sync
  threshold_ms: 100
```

### Async mode (concurrent futures)

```yaml
performance:
  repeat: 200
  concurrency: 50
  mode: async
  threshold_ms: 50
```

## Lưu ý

⚠️ **Server phải đang chạy** - Đảm bảo API server đang hoạt động tại base_url  
⚠️ **Venv required** - Luôn activate venv trước khi chạy  
⚠️ **Performance tests mất thời gian** - Với repeat=200, concurrency=50 có thể mất vài phút  
⚠️ **Quick mode cho development** - Dùng `--quick` khi test code changes

## Troubleshooting

### Import error

```bash
# Đảm bảo đã activate venv
source venv/bin/activate

# Kiểm tra pyresttest đã cài
pip list | grep pyresttest
```

### Connection refused

```bash
# Kiểm tra server đang chạy
curl http://localhost:8000/api/health

# Hoặc thay đổi base URL
python3 api_test/run_all_suites.py --base-url http://localhost:9000
```

### Slow performance

```bash
# Dùng quick mode
python3 api_test/run_all_suites.py --quick

# Hoặc chạy ít suites hơn
python3 api_test/run_all_suites.py --pattern "test_suite_[1-3]*.yaml"
```

## Tích hợp CI/CD

Thêm vào GitHub Actions:

```yaml
- name: Run API Test Suites
  run: |
    source venv/bin/activate
    python3 api_test/run_all_suites.py --quick

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: api_test/reports/all_suites_results.json
```

## So sánh với các script khác

| Script                     | Mục đích              | Performance Metrics |
| -------------------------- | --------------------- | ------------------- |
| `abc.py`                   | Wrapper đơn giản      | ❌ Không có         |
| `run_api_tests.py`         | Runner với login      | ❌ Không có         |
| `run_test_with_metrics.py` | Thử parse metrics     | ⚠️ Không hoạt động  |
| `run_all_suites.py`        | **Runner hoàn chỉnh** | ✅ **Đầy đủ**       |

## Ví dụ output hoàn chỉnh

```
🚀 Found 9 test suites
📁 Directory: /home/bao/Documents/pj_web/api_test/suites
🌐 Base URL: http://localhost:8000
⚡ Quick Mode: OFF

================================================================================
Running: test_suite_1_basic.yaml
================================================================================
...

================================================================================
                              FINAL REPORT
================================================================================

📊 Total Suites Run: 9
⏱️  Total Time: 125.34s

PERFORMANCE TESTS
--------------------------------------------------------------------------------

  📝 test_suite_4_performance
     Tests: 4 (Perf: 4, Functional: 0)
     Requests: 400/400 (100.0% success)
     └─ Test GET /api/posts: Avg 67.89ms | P95 98.76ms | Min 45.23ms | Max 123.45ms
     └─ Test POST /api/events: Avg 89.12ms | P95 125.34ms | Min 56.78ms | Max 167.89ms

================================================================================
✅ Report complete!
📄 Detailed results saved to: api_test/reports/all_suites_results.json
================================================================================
```
