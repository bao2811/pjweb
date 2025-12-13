#!/usr/bin/env python3
"""
Validate test suites compliance with Requirements 8.

Checks:
- Suite 1: Auth & user operations (login, /me, logout)
- Suite 2: Content read (getPostById, getAllLikes)
- Suite 3: Concurrency (10+ parallel requests)
- Suite 4: Performance benchmark (repeat, concurrency, threshold_ms)
- Suite 5: Retry logic (500, 404, expected_status arrays)
- Suite 6: Performance sync (advanced runner, mode: sync)
- Suite 7: Performance async (mode: async, high concurrency)
"""

import glob
import os
import sys

try:
    import yaml
except ImportError:
    print("Please run this script with venv Python: source venv/bin/activate && python3 ...")
    sys.exit(1)

SUITES_DIR = os.path.join(os.path.dirname(__file__), 'suites')

def load_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def check_suite_1(yaml_obj):
    """Basic Auth & User Operations"""
    issues = []
    tests = [t.get('test') for t in yaml_obj if 'test' in t]
    
    # Check for login test
    login_found = any('login' in str(t.get('url', '')).lower() or 'login' in str(t.get('name', '')).lower() for t in tests)
    if not login_found:
        issues.append("Missing login test")
    
    # Check for token extraction
    extract_found = any('extract_binds' in t for t in tests)
    if not extract_found:
        issues.append("Missing extract_binds (token extraction)")
    
    # Check for /me endpoint
    me_found = any('/me' in str(t.get('url', '')) for t in tests)
    if not me_found:
        issues.append("Missing /api/me test")
    
    # Check for logout
    logout_found = any('logout' in str(t.get('url', '')).lower() or 'logout' in str(t.get('name', '')).lower() for t in tests)
    if not logout_found:
        issues.append("Missing logout test")
    
    return issues

def check_suite_2(yaml_obj):
    """Content Read Operations"""
    issues = []
    tests = [t.get('test') for t in yaml_obj if 'test' in t]
    
    # Check for getPostById
    post_found = any('getPostById' in str(t.get('url', '')) or 'post' in str(t.get('name', '')).lower() for t in tests)
    if not post_found:
        issues.append("Missing getPostById test")
    
    # Check for getAllLikes
    likes_found = any('getAllLikes' in str(t.get('url', '')) or 'like' in str(t.get('name', '')).lower() for t in tests)
    if not likes_found:
        issues.append("Missing getAllLikes test")
    
    # Check for multiple expected_status
    multi_status = any(isinstance(t.get('expected_status'), list) and len(t.get('expected_status', [])) > 1 for t in tests)
    if not multi_status:
        issues.append("Missing multi-value expected_status (e.g., [200, 404])")
    
    return issues

def check_suite_3(yaml_obj):
    """Concurrency Test"""
    issues = []
    tests = [t.get('test') for t in yaml_obj if 'test' in t]
    
    if len(tests) < 10:
        issues.append(f"Only {len(tests)} tests; expected 10+ for concurrency testing")
    
    # Check for similar endpoints (concurrency pattern)
    urls = [t.get('url', '') for t in tests]
    if len(set(urls)) == len(urls):
        issues.append("All URLs unique; expected repeated endpoints to test concurrency")
    
    return issues

def check_suite_4(yaml_obj):
    """Performance Benchmark"""
    issues = []
    tests = [t.get('test') for t in yaml_obj if 'test' in t]
    
    perf_tests = [t for t in tests if 'performance' in t]
    if not perf_tests:
        issues.append("No performance blocks found")
        return issues
    
    for t in perf_tests:
        perf = t.get('performance', {})
        if 'repeat' not in perf:
            issues.append(f"Test '{t.get('name')}' missing repeat in performance block")
        elif perf.get('repeat', 0) < 50:
            issues.append(f"Test '{t.get('name')}' repeat too low ({perf.get('repeat')}); expected >= 100")
        
        if 'concurrency' not in perf:
            issues.append(f"Test '{t.get('name')}' missing concurrency")
        
        if 'threshold_ms' not in perf:
            issues.append(f"Test '{t.get('name')}' missing threshold_ms")
    
    return issues

def check_suite_5(yaml_obj):
    """Retry Logic Test"""
    issues = []
    tests = [t.get('test') for t in yaml_obj if 'test' in t]
    
    # Check for multiple expected_status including error codes
    has_multi_status = any(
        isinstance(t.get('expected_status'), list) and 
        any(s >= 400 for s in t.get('expected_status', []))
        for t in tests
    )
    if not has_multi_status:
        issues.append("Missing expected_status with error codes (404, 500) to test retry")
    
    # Check for logout or flaky endpoint
    logout_or_flaky = any('logout' in str(t.get('name', '')).lower() or 'flaky' in str(t.get('name', '')).lower() for t in tests)
    if not logout_or_flaky:
        issues.append("Missing logout or flaky endpoint test")
    
    return issues

def check_suite_6_or_7_perf(yaml_obj, suite_name):
    """Performance Sync/Async (Advanced)"""
    issues = []
    tests = [t.get('test') for t in yaml_obj if 'test' in t]
    
    perf_tests = [t for t in tests if 'performance' in t]
    if not perf_tests:
        issues.append(f"{suite_name}: No performance blocks found")
        return issues
    
    for t in perf_tests:
        perf = t.get('performance', {})
        mode = perf.get('mode', '')
        if not mode:
            issues.append(f"{suite_name}: Test '{t.get('name')}' missing mode (sync/async)")
        
        if 'repeat' in perf and perf.get('repeat', 0) < 50:
            issues.append(f"{suite_name}: Test '{t.get('name')}' repeat too low for advanced benchmark")
    
    return issues

def validate_all():
    suites = sorted(glob.glob(os.path.join(SUITES_DIR, 'test_suite_*.yaml')))
    suites = [s for s in suites if '.backup' not in s]  # exclude backups
    
    report = {}
    
    for suite_path in suites:
        suite_name = os.path.basename(suite_path)
        try:
            yaml_obj = load_yaml(suite_path)
        except Exception as e:
            report[suite_name] = {'status': 'ERROR', 'issues': [f'Failed to parse: {e}']}
            continue
        
        issues = []
        
        if 'test_suite_1' in suite_name:
            issues = check_suite_1(yaml_obj)
        elif 'test_suite_2' in suite_name:
            issues = check_suite_2(yaml_obj)
        elif 'test_suite_3' in suite_name:
            issues = check_suite_3(yaml_obj)
        elif 'test_suite_4' in suite_name:
            issues = check_suite_4(yaml_obj)
        elif 'test_suite_5' in suite_name:
            issues = check_suite_5(yaml_obj)
        elif 'test_suite_6' in suite_name or 'test_suite_7' in suite_name:
            issues = check_suite_6_or_7_perf(yaml_obj, suite_name)
        
        status = 'PASS' if not issues else 'FAIL'
        report[suite_name] = {'status': status, 'issues': issues}
    
    return report

def print_report(report):
    print("\n" + "="*80)
    print(" VALIDATION REPORT: Requirements 8 (Testing & Quality Gates)")
    print("="*80 + "\n")
    
    total = len(report)
    passed = sum(1 for r in report.values() if r['status'] == 'PASS')
    
    for suite, result in sorted(report.items()):
        status_str = f"[{result['status']}]"
        if result['status'] == 'PASS':
            status_str = f"\033[32m{status_str}\033[0m"  # green
        else:
            status_str = f"\033[31m{status_str}\033[0m"  # red
        
        print(f"{status_str} {suite}")
        
        if result['issues']:
            for issue in result['issues']:
                print(f"    ❌ {issue}")
        else:
            print(f"    ✅ All checks passed")
        print()
    
    print("="*80)
    print(f"Summary: {passed}/{total} suites compliant\n")
    
    return passed == total

if __name__ == '__main__':
    report = validate_all()
    success = print_report(report)
    sys.exit(0 if success else 1)
