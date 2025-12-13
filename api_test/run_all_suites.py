#!/usr/bin/env python3
"""
Comprehensive Test Suite Runner with Performance Benchmarking
Runs all test suites in api_test/suites/ with full metrics collection
"""

import os
import sys
import yaml
import json
import time
import statistics
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess

# Add pyresttest to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'venv', 'lib', 'python3.12', 'site-packages'))

from pyresttest import resttest
from pyresttest.binding import Context
from pyresttest.contenthandling import ContentHandler

class BenchmarkRunner:
    """Handles actual performance benchmarking with metrics collection"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.context = Context()
        self.context.bind_variable('base_url', base_url)
        
    def run_single_test(self, test_config: Dict) -> Dict[str, Any]:
        """Run a single test and return timing + result"""
        try:
            mytest = resttest.Test()
            mytest.url = test_config.get('url', '')
            mytest.method = test_config.get('method', 'GET').upper()
            
            # Set headers
            if 'headers' in test_config:
                mytest.headers = test_config['headers']
            
            # Set body
            if 'body' in test_config:
                mytest.body = test_config['body']
            
            # Set validators
            if 'validators' in test_config:
                mytest.validators = test_config['validators']
            
            start_time = time.time()
            result = resttest.run_test(mytest, context=self.context)
            elapsed_ms = (time.time() - start_time) * 1000
            
            return {
                'success': result.passed if hasattr(result, 'passed') else True,
                'elapsed_ms': elapsed_ms,
                'status_code': result.response_code if hasattr(result, 'response_code') else None
            }
        except Exception as e:
            return {
                'success': False,
                'elapsed_ms': 0,
                'error': str(e)
            }
    
    def run_performance_test(self, test_config: Dict, perf_config: Dict) -> Dict[str, Any]:
        """Run performance test with repeat and concurrency"""
        repeat = perf_config.get('repeat', 50)
        concurrency = perf_config.get('concurrency', 5)
        mode = perf_config.get('mode', 'sync')
        
        results = []
        errors = []
        
        if mode == 'async' or concurrency > 1:
            # Use ThreadPoolExecutor for concurrency
            with ThreadPoolExecutor(max_workers=concurrency) as executor:
                futures = [executor.submit(self.run_single_test, test_config) for _ in range(repeat)]
                
                for future in as_completed(futures):
                    result = future.result()
                    if result['success']:
                        results.append(result['elapsed_ms'])
                    else:
                        errors.append(result.get('error', 'Unknown error'))
        else:
            # Synchronous mode
            for i in range(repeat):
                result = self.run_single_test(test_config)
                if result['success']:
                    results.append(result['elapsed_ms'])
                else:
                    errors.append(result.get('error', 'Unknown error'))
        
        # Calculate metrics
        if results:
            sorted_results = sorted(results)
            metrics = {
                'total_requests': repeat,
                'successful': len(results),
                'failed': len(errors),
                'min_ms': min(results),
                'max_ms': max(results),
                'avg_ms': statistics.mean(results),
                'median_ms': statistics.median(results),
                'p95_ms': sorted_results[int(len(sorted_results) * 0.95)] if len(sorted_results) > 1 else sorted_results[0],
                'p99_ms': sorted_results[int(len(sorted_results) * 0.99)] if len(sorted_results) > 1 else sorted_results[0],
                'std_dev': statistics.stdev(results) if len(results) > 1 else 0,
                'mode': mode,
                'concurrency': concurrency,
                'repeat': repeat
            }
            
            # Calculate threshold pass/fail if specified
            if 'threshold_ms' in perf_config:
                threshold = perf_config['threshold_ms']
                metrics['threshold_ms'] = threshold
                metrics['threshold_passed'] = metrics['avg_ms'] <= threshold
            
            return metrics
        else:
            return {
                'total_requests': repeat,
                'successful': 0,
                'failed': len(errors),
                'errors': errors[:5]  # First 5 errors
            }

class SuiteRunner:
    """Main suite runner orchestrating all tests"""
    
    def __init__(self, suites_dir: str, base_url: str = "http://localhost:8000"):
        self.suites_dir = Path(suites_dir)
        self.base_url = base_url
        self.benchmark_runner = BenchmarkRunner(base_url)
        self.results = {
            'functional': [],
            'performance': [],
            'concurrency': [],
            'retry': []
        }
        
    def load_suite(self, suite_file: Path) -> Dict:
        """Load YAML suite file"""
        with open(suite_file, 'r') as f:
            return yaml.safe_load(f)
    
    def categorize_suite(self, suite_name: str) -> str:
        """Determine suite category"""
        name_lower = suite_name.lower()
        if 'performance' in name_lower or 'bench' in name_lower:
            return 'performance'
        elif 'concurrency' in name_lower:
            return 'concurrency'
        elif 'retry' in name_lower:
            return 'retry'
        else:
            return 'functional'
    
    def run_suite(self, suite_file: Path, quick_mode: bool = False) -> Dict:
        """Run a single suite file"""
        print(f"\n{'='*80}")
        print(f"Running: {suite_file.name}")
        print(f"{'='*80}")
        
        suite_data = self.load_suite(suite_file)
        category = self.categorize_suite(suite_file.stem)
        
        suite_result = {
            'suite_name': suite_file.stem,
            'suite_file': suite_file.name,
            'category': category,
            'tests': [],
            'summary': {}
        }
        
        # PyRestTest YAML is a list of items with 'test' or 'config' keys
        tests = []
        if isinstance(suite_data, list):
            tests = [item.get('test', {}) for item in suite_data if 'test' in item]
        else:
            tests = suite_data.get('tests', [])
        
        for idx, test_config in enumerate(tests, 1):
            test_name = test_config.get('name', f'Test_{idx}')
            print(f"\n  [{idx}/{len(tests)}] {test_name}")
            
            # Check if this is a performance test
            perf_config = test_config.get('performance', {})
            
            if perf_config and category == 'performance':
                # Reduce repeat in quick mode
                if quick_mode:
                    perf_config['repeat'] = min(perf_config.get('repeat', 50), 10)
                    perf_config['concurrency'] = min(perf_config.get('concurrency', 5), 2)
                
                print(f"    Mode: {perf_config.get('mode', 'sync')} | "
                      f"Repeat: {perf_config.get('repeat', 50)} | "
                      f"Concurrency: {perf_config.get('concurrency', 5)}")
                
                metrics = self.benchmark_runner.run_performance_test(test_config, perf_config)
                
                print(f"    ✓ Completed: {metrics.get('successful', 0)}/{metrics.get('total_requests', 0)} requests")
                if 'avg_ms' in metrics:
                    print(f"    ⏱  Min: {metrics['min_ms']:.2f}ms | "
                          f"Avg: {metrics['avg_ms']:.2f}ms | "
                          f"Max: {metrics['max_ms']:.2f}ms | "
                          f"P95: {metrics['p95_ms']:.2f}ms")
                    
                    if 'threshold_passed' in metrics:
                        status = "✓ PASS" if metrics['threshold_passed'] else "✗ FAIL"
                        print(f"    Threshold: {metrics['threshold_ms']}ms → {status}")
                
                suite_result['tests'].append({
                    'name': test_name,
                    'type': 'performance',
                    'metrics': metrics
                })
            else:
                # Functional test - run once with pyresttest
                result = self.run_functional_test(suite_file)
                suite_result['tests'].append({
                    'name': test_name,
                    'type': 'functional',
                    'result': result
                })
        
        # Generate summary
        suite_result['summary'] = self.generate_suite_summary(suite_result['tests'])
        
        return suite_result
    
    def run_functional_test(self, suite_file: Path) -> Dict:
        """Run functional test using pyresttest command"""
        try:
            cmd = [
                sys.executable,
                '-m', 'pyresttest',
                self.base_url,
                str(suite_file)
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Parse output
            output = result.stdout + result.stderr
            passed = 'FAILED' not in output and result.returncode == 0
            
            return {
                'passed': passed,
                'output': output[:500]  # Truncate
            }
        except Exception as e:
            return {
                'passed': False,
                'error': str(e)
            }
    
    def generate_suite_summary(self, tests: List[Dict]) -> Dict:
        """Generate summary statistics for a suite"""
        summary = {
            'total_tests': len(tests),
            'performance_tests': 0,
            'functional_tests': 0,
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0
        }
        
        for test in tests:
            if test['type'] == 'performance':
                summary['performance_tests'] += 1
                metrics = test.get('metrics', {})
                summary['total_requests'] += metrics.get('total_requests', 0)
                summary['successful_requests'] += metrics.get('successful', 0)
                summary['failed_requests'] += metrics.get('failed', 0)
            else:
                summary['functional_tests'] += 1
        
        return summary
    
    def run_all_suites(self, quick_mode: bool = False, pattern: str = "*.yaml"):
        """Run all suites matching pattern"""
        suite_files = sorted(self.suites_dir.glob(pattern))
        
        if not suite_files:
            print(f"❌ No suite files found in {self.suites_dir}")
            return
        
        print(f"\n🚀 Found {len(suite_files)} test suites")
        print(f"📁 Directory: {self.suites_dir}")
        print(f"🌐 Base URL: {self.base_url}")
        print(f"⚡ Quick Mode: {'ON (reduced iterations)' if quick_mode else 'OFF'}")
        
        start_time = time.time()
        
        for suite_file in suite_files:
            try:
                result = self.run_suite(suite_file, quick_mode)
                category = result['category']
                self.results[category].append(result)
            except Exception as e:
                print(f"\n❌ Error running {suite_file.name}: {e}")
        
        elapsed_time = time.time() - start_time
        
        # Print final report
        self.print_report(elapsed_time)
        
        # Save detailed results
        self.save_results()
    
    def print_report(self, elapsed_time: float):
        """Print comprehensive final report"""
        print(f"\n\n{'='*80}")
        print(f"{'FINAL REPORT':^80}")
        print(f"{'='*80}\n")
        
        total_suites = sum(len(self.results[cat]) for cat in self.results)
        print(f"📊 Total Suites Run: {total_suites}")
        print(f"⏱️  Total Time: {elapsed_time:.2f}s\n")
        
        # Category breakdown
        for category in ['functional', 'performance', 'concurrency', 'retry']:
            suites = self.results[category]
            if not suites:
                continue
            
            print(f"\n{category.upper()} TESTS")
            print("-" * 80)
            
            for suite in suites:
                print(f"\n  📝 {suite['suite_name']}")
                summary = suite['summary']
                print(f"     Tests: {summary['total_tests']} "
                      f"(Perf: {summary['performance_tests']}, "
                      f"Functional: {summary['functional_tests']})")
                
                if summary['total_requests'] > 0:
                    success_rate = (summary['successful_requests'] / summary['total_requests']) * 100
                    print(f"     Requests: {summary['successful_requests']}/{summary['total_requests']} "
                          f"({success_rate:.1f}% success)")
                
                # Show performance metrics
                for test in suite['tests']:
                    if test['type'] == 'performance' and 'metrics' in test:
                        m = test['metrics']
                        if 'avg_ms' in m:
                            print(f"     └─ {test['name']}: "
                                  f"Avg {m['avg_ms']:.2f}ms | "
                                  f"P95 {m['p95_ms']:.2f}ms | "
                                  f"Min {m['min_ms']:.2f}ms | "
                                  f"Max {m['max_ms']:.2f}ms")
        
        print(f"\n{'='*80}")
        print(f"✅ Report complete!")
        print(f"📄 Detailed results saved to: api_test/reports/all_suites_results.json")
        print(f"{'='*80}\n")
    
    def save_results(self):
        """Save detailed results to JSON file"""
        reports_dir = Path(self.suites_dir).parent / 'reports'
        reports_dir.mkdir(exist_ok=True)
        
        output_file = reports_dir / 'all_suites_results.json'
        
        with open(output_file, 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'results': self.results
            }, f, indent=2)
        
        print(f"\n💾 Results saved to: {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Run all test suites with performance benchmarking')
    parser.add_argument('--quick', action='store_true', 
                       help='Quick mode: reduce iterations for faster testing')
    parser.add_argument('--base-url', default='http://localhost:8000',
                       help='Base URL for API (default: http://localhost:8000)')
    parser.add_argument('--pattern', default='*.yaml',
                       help='File pattern to match (default: *.yaml)')
    parser.add_argument('--suites-dir', 
                       default=os.path.join(os.path.dirname(__file__), 'suites'),
                       help='Directory containing test suites')
    
    args = parser.parse_args()
    
    runner = SuiteRunner(args.suites_dir, args.base_url)
    runner.run_all_suites(quick_mode=args.quick, pattern=args.pattern)

if __name__ == '__main__':
    main()
