#!/usr/bin/env python3
"""
Run test suites and report metrics.

Usage:
  python run_bench_and_report.py [--url URL] [--quick] [--output report.json]

Features:
- Detects performance tests (presence of `performance` block) and runs them via `abc.py --perf`.
- Runs regular suites with `pyresttest` and captures pass/fail counts.
- Quick mode scales down `repeat` values for performance suites to keep runs short.
- Outputs a JSON summary and prints a human-readable table.

"""
import argparse
import glob
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
from collections import defaultdict
from statistics import mean, median, quantiles

import yaml

ROOT = os.path.dirname(os.path.dirname(__file__)) if __file__ else '.'
API_TEST_DIR = os.path.join(ROOT, 'api_test')
SUITES_DIR = os.path.join(API_TEST_DIR, 'suites')
ABC_PY = os.path.join(ROOT, 'abc.py')


def find_pyresttest():
    # prefer venv/bin/pyresttest if exists
    venv_bin = os.path.join(ROOT, 'venv', 'bin', 'pyresttest')
    if os.path.isfile(venv_bin):
        return venv_bin
    which = shutil.which('pyresttest')
    return which


def load_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def has_performance_block(yaml_obj):
    if not isinstance(yaml_obj, list):
        return False
    for item in yaml_obj:
        if 'test' in item and isinstance(item['test'], dict) and 'performance' in item['test']:
            return True
    return False


def scale_performance_yaml(yaml_obj, scale=0.1, cap=10):
    # scale down repeat values by scale factor, cap at `cap` for quick runs
    out = []
    for item in yaml_obj:
        if 'test' in item and isinstance(item['test'], dict):
            t = dict(item['test'])
            perf = t.get('performance')
            if isinstance(perf, dict) and 'repeat' in perf:
                try:
                    r = int(perf.get('repeat', 1))
                    newr = max(1, min(cap, max(1, int(r * scale))))
                    perf['repeat'] = newr
                    t['performance'] = perf
                except Exception:
                    pass
            out.append({'test': t})
        else:
            out.append(item)
    return out


def run_abc_on_file(testfile, quick=False, async_mode=False):
    # If quick, write a temp YAML with scaled repeats
    yaml_obj = load_yaml(testfile)
    tmpfile = None
    if quick and has_performance_block(yaml_obj):
        scaled = scale_performance_yaml(yaml_obj, scale=0.05, cap=10)
        fd, tmpfile = tempfile.mkstemp(suffix='.yaml', prefix='tmp_suite_')
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            yaml.dump(scaled, f, sort_keys=False)
        runfile = tmpfile
    else:
        runfile = testfile

    cmd = [sys.executable, ABC_PY, runfile, '--perf']
    if async_mode:
        cmd.append('--async')

    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    out = proc.stdout

    if tmpfile:
        try:
            os.remove(tmpfile)
        except Exception:
            pass

    # Parse abc.py output lines
    results = defaultdict(list)  # testname -> list of elapsed_ms
    current_test = None
    for line in out.splitlines():
        line = line.strip()
        if line.startswith('Test:'):
            current_test = line.split(':', 1)[1].strip()
        elif 'Time(ms):' in line:
            # URL: ..., Status: X, Passed: True, Time(ms): 123.45
            m = re.search(r'Time\(ms\):\s*([0-9.]+)', line)
            if m and current_test:
                results[current_test].append(float(m.group(1)))

    return results, out


def run_pyresttest_on_file(pyresttest_cmd, url, testfile):
    cmd = [pyresttest_cmd, url, testfile]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    out = proc.stdout
    # parse pass/fail counts
    passed = 0
    total = 0
    # look for lines like: Test Group Default SUCCEEDED: : 5/5 Tests Passed!
    for line in out.splitlines():
        m = re.search(r'SUCCEEDED:.*?(\d+)/(\d+)', line)
        if m:
            passed += int(m.group(1))
            total += int(m.group(2))
    # fallback: count 'Test Succeeded:' lines
    if total == 0:
        passed = sum(1 for l in out.splitlines() if 'Test Succeeded' in l)
        total = sum(1 for l in out.splitlines() if l.strip().startswith('Test:'))
    return {'passed': passed, 'total': total, 'raw': out}


def summarize_perf(results):
    # results: testname -> list of ms
    summary = {}
    for tname, values in results.items():
        if not values:
            continue
        values_sorted = sorted(values)
        total = sum(values)
        count = len(values)
        avg = total / count
        p50 = median(values)
        p95 = quantiles(values, n=100)[94] if len(values) >= 2 else values_sorted[-1]
        p99 = quantiles(values, n=100)[98] if len(values) >= 2 else values_sorted[-1]
        summary[tname] = {
            'count': count,
            'min_ms': values_sorted[0],
            'max_ms': values_sorted[-1],
            'avg_ms': avg,
            'p50_ms': p50,
            'p95_ms': p95,
            'p99_ms': p99,
        }
    return summary


def human_print_report(report):
    print('\n=== Test Suites Report ===\n')
    for suite in report['suites']:
        print(f"Suite: {suite['file']}")
        print(f"  Type: {suite['type']}")
        if suite['type'] == 'performance':
            for tname, s in suite['summary'].items():
                print(f"    Test: {tname}")
                print(f"      count: {s['count']}, min: {s['min_ms']:.2f} ms, avg: {s['avg_ms']:.2f} ms, max: {s['max_ms']:.2f} ms, p95: {s['p95_ms']:.2f} ms")
        else:
            print(f"    Passed/Total: {suite['passed']}/{suite['total']}")
        print('')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', default=os.environ.get('BASE_URL', 'http://localhost:8000'))
    ap.add_argument('--quick', action='store_true', help='Scale down performance repeats for fast validation')
    ap.add_argument('--output', help='Write JSON report to file')
    ap.add_argument('--async', dest='async_mode', action='store_true', help='Force async runner for performance suites')
    args = ap.parse_args()

    pyresttest_cmd = find_pyresttest()
    if not pyresttest_cmd:
        print('pyresttest not found in PATH or venv. Please install or set up venv.')

    suites = sorted(glob.glob(os.path.join(SUITES_DIR, '*.yaml')))
    report = {'suites': []}

    for suite in suites:
        try:
            yaml_obj = load_yaml(suite)
        except Exception as e:
            print(f'Failed reading {suite}: {e}')
            continue

        if has_performance_block(yaml_obj):
            print(f'Running performance suite: {os.path.basename(suite)}')
            results, raw = run_abc_on_file(suite, quick=args.quick, async_mode=args.async_mode)
            summary = summarize_perf(results)
            report['suites'].append({'file': os.path.basename(suite), 'type': 'performance', 'summary': summary, 'raw': raw})
        else:
            print(f'Running functional suite: {os.path.basename(suite)}')
            if not pyresttest_cmd:
                print('Skipping pyresttest run (not found)')
                continue
            res = run_pyresttest_on_file(pyresttest_cmd, args.url, suite)
            report['suites'].append({'file': os.path.basename(suite), 'type': 'functional', 'passed': res['passed'], 'total': res['total'], 'raw': res['raw']})

    human_print_report(report)
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)


if __name__ == '__main__':
    main()
