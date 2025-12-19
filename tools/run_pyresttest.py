#!/usr/bin/env python3
"""
Simple helper to inspect pyresttest suites and optionally run pyresttest.

Usage:
  python tools/run_pyresttest.py path/to/suite.yaml         # prints requests and runs pyresttest
  python tools/run_pyresttest.py --print-only suite.yaml   # only prints parsed requests
  python tools/run_pyresttest.py --pyresttest-args="--workers=4" suite.yaml  # pass extra args to pyresttest

What it does:
- Tries to parse YAML/JSON suite and prints each `test` and `benchmark` entries (method, url, headers, body)
- If --print-only is not set, attempts to run the `pyresttest` CLI with the suite path (will fail if pyresttest not installed)

Requirements:
- Python 3.8+
- (optional) PyYAML to parse YAML. If missing the script will tell you how to install it.
- pyresttest CLI if you want to execute the suite: `pip install pyresttest` (or install globally).

"""

import argparse
import json
import shlex
import shutil
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except Exception:
    yaml = None


def parse_suite(path: Path):
    text = path.read_text()
    # Determine JSON or YAML
    if path.suffix.lower() in (".json",):
        data = json.loads(text)
    else:
        if yaml is None:
            raise RuntimeError("PyYAML is required to parse YAML suites. Install with: pip install pyyaml")
        data = yaml.safe_load(text)
    if not isinstance(data, list):
        raise RuntimeError("Expected suite to be a list of entries (config/test/benchmark).")
    return data


def extract_requests(suite):
    out = []
    for entry in suite:
        if not isinstance(entry, dict):
            continue
        if 'test' in entry:
            t = entry['test']
            out.append({
                'type': 'test',
                'name': t.get('name'),
                'method': t.get('method', 'GET'),
                'url': t.get('url'),
                'headers': t.get('headers'),
                'body': t.get('body'),
                'expected_status': t.get('expected_status'),
            })
        if 'benchmark' in entry:
            b = entry['benchmark']
            out.append({
                'type': 'benchmark',
                'name': b.get('name'),
                'method': b.get('method', 'GET'),
                'url': b.get('url'),
                'mode': b.get('mode'),
                'benchmark_runs': b.get('benchmark_runs') or b.get('repeat'),
                'concurrency': b.get('concurrency'),
                'throttle_ms': b.get('throttle_ms'),
                'ramp_up_seconds': b.get('ramp_up_seconds'),
            })
    return out


def print_requests(requests):
    for idx, r in enumerate(requests, start=1):
        print(f"[{idx}] {r['type'].upper()}: {r.get('name')}")
        print(f"     METHOD: {r.get('method')}")
        print(f"     URL:    {r.get('url')}")
        if r.get('mode'):
            print(f"     MODE:   {r.get('mode')}")
        if 'concurrency' in r and r.get('concurrency') is not None:
            print(f"     CONC:   {r.get('concurrency')}")
        if 'benchmark_runs' in r and r.get('benchmark_runs') is not None:
            print(f"     RUNS:   {r.get('benchmark_runs')}")
        if r.get('headers'):
            print(f"     HEADERS: {json.dumps(r.get('headers'))}")
        if r.get('body'):
            print(f"     BODY:   {r.get('body')}")
        if r.get('expected_status') is not None:
            print(f"     EXPECT: {r.get('expected_status')}")
        print()


def run_pyresttest(suite_path: Path, extra_args: str | None = None):
    pyresttest_bin = shutil.which('pyresttest')
    if pyresttest_bin is None:
        print("pyresttest binary not found in PATH. Install with: pip install pyresttest")
        return 2
    cmd = [pyresttest_bin, str(suite_path)]
    if extra_args:
        # split extra args safely
        cmd.extend(shlex.split(extra_args))
    print("Running:", ' '.join(shlex.quote(p) for p in cmd))
    proc = subprocess.run(cmd)
    return proc.returncode


def run_pyresttest_lib(suite_path: Path, extra_args: str | None = None):
    """
    Attempt to execute the suite using the pyresttest Python library (if installed).
    We try several possible entrypoints since pyresttest does not expose a single
    stable top-level API name across versions. If the import fails, return None
    to signal fallback to the CLI.
    """
    try:
        import pyresttest
        print("Found pyresttest package:", pyresttest.__file__ if hasattr(pyresttest, '__file__') else pyresttest)
    except Exception as e:
        # library not available
        return None

    argv = [str(suite_path)]
    if extra_args:
        argv.extend(shlex.split(extra_args))

    # Try a few plausible callables
    # 0) Direct entrypoint: pyresttest.resttest.run_test (common in some versions)
    try:
        try:
            from pyresttest.resttest import run_test
        except Exception:
            run_test = None
        if run_test and callable(run_test):
            print('Invoking pyresttest.resttest.run_test(...)')
            # run_test typically accepts argv list: [base_url, suite_path, ...]
            res = run_test(argv)
            return 0 if res is None else int(res)
    except Exception as e:
        print('pyresttest.resttest.run_test failed:', e)

    # 1) pyresttest.run (some versions)
    try:
        if hasattr(pyresttest, 'run') and callable(pyresttest.run):
            print('Invoking pyresttest.run(...)')
            # pyresttest.run may expect args similar to CLI
            res = pyresttest.run(argv)
            return 0 if res is None else int(res)
    except Exception as e:
        print('pyresttest.run failed:', e)

    # 2) pyresttest.main
    try:
        if hasattr(pyresttest, 'main') and callable(pyresttest.main):
            print('Invoking pyresttest.main(...)')
            res = pyresttest.main(argv)
            return 0 if res is None else int(res)
    except Exception as e:
        print('pyresttest.main failed:', e)

    # 3) module run entrypoints
    for modname in ('pyresttest.run', 'pyresttest.runner', 'pyresttest.core', 'pyresttest.resttest'):
        try:
            mod = __import__(modname, fromlist=['*'])
            if hasattr(mod, 'run') and callable(mod.run):
                print(f'Invoking {modname}.run(...)')
                res = mod.run(argv)
                return 0 if res is None else int(res)
            if hasattr(mod, 'main') and callable(mod.main):
                print(f'Invoking {modname}.main(...)')
                res = mod.main(argv)
                return 0 if res is None else int(res)
        except Exception as e:
            # continue to next candidate
            # print helpful debug line
            print(f"Attempt to call {modname} failed: {e}")
            continue

    # If none of the above worked, return None to indicate fallback
    print('pyresttest package found but no compatible entrypoint succeeded; falling back to CLI.')
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('suite', type=str, help='Path to pyresttest suite (yaml or json)')
    ap.add_argument('--print-only', action='store_true', help='Only parse+print requests, do not execute pyresttest')
    ap.add_argument('--pyresttest-args', type=str, default=None, help='Extra args to append to pyresttest when executing')
    args = ap.parse_args()

    suite_path = Path(args.suite)
    if not suite_path.exists():
        print(f"Suite not found: {suite_path}")
        sys.exit(2)

    try:
        suite = parse_suite(suite_path)
    except Exception as e:
        print("Failed to parse suite:", e)
        sys.exit(2)

    requests = extract_requests(suite)
    print(f"Parsed {len(requests)} request(s) from {suite_path}\n")
    print_requests(requests)

    if args.print_only:
        print("--print-only set; skipping execution of pyresttest.")
        return

    print("Attempting to execute pyresttest with the provided suite using library (preferred)...")
    rc_lib = run_pyresttest_lib(suite_path, args.pyresttest_args)
    if rc_lib is None:
        print("Falling back to pyresttest CLI...")
        rc = run_pyresttest(suite_path, args.pyresttest_args)
    else:
        rc = rc_lib
    sys.exit(rc)


if __name__ == '__main__':
    main()
