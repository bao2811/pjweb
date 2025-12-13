# #!/usr/bin/env python3

import argparse
import yaml
from pyresttest.resttest import run_test


def main():
    parser = argparse.ArgumentParser(description='PyRestTest CLI with performance/async support')
    parser.add_argument('testfile', help='YAML file containing tests')
    parser.add_argument('--perf', action='store_true', help='Enable performance mode')
    parser.add_argument('--async', dest='async_mode', action='store_true', help='Use async engine')
    args = parser.parse_args()

    # Load tests from YAML
    with open(args.testfile, 'r', encoding='utf-8') as f:
        tests = yaml.safe_load(f)

    for t in tests:
        mytest = t.get('test')
        if not mytest:
            continue

        # CLI flags override YAML performance mode
        if args.perf:
            if 'performance' not in mytest:
                mytest['performance'] = {}
            mytest['performance']['mode'] = 'async' if args.async_mode else 'sync'

        # Run the test
        result = run_test(mytest)

        # Print results
        print(f"Test: {mytest.get('name', 'Unnamed')}")
        if isinstance(result, list):
            # Performance mode returns list of results
            for r in result:
                print(f"URL: {r['url']}, Status: {r['status_code']}, Passed: {r['passed']}, Time(ms): {r['elapsed_ms']:.2f}")
        else:
            # Normal test result
            print(result)


if __name__ == '__main__':
    main()


# python cli.py --perf --async test.yaml
# pyresttest --perf --async test.yaml
