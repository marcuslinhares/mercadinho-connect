#!/usr/bin/env python3
"""
Bundle Analyzer - Performance Monitoring for Next.js Projects.
Checks the size of the compiled JavaScript and CSS files in .next/static.
"""
import sys
import os
import json
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except:
    pass

# Thresholds in MB
MAX_JS_BUNDLE_MB = 1.0  # Total JS chunks should be manageable
MAX_CSS_BUNDLE_MB = 0.5  # Total CSS should be lightweight

def get_directory_size(directory: Path, pattern: str) -> int:
    """Calculate the total size of files matching the pattern in the directory."""
    total_size = 0
    for f in directory.rglob(pattern):
        if f.is_file():
            total_size += f.stat().st_size
    return total_size

def analyze_bundle(project_path: Path) -> dict:
    """Analyze the bundle size in .next directory."""
    issues = []
    passed = []
    
    # Ensure .next directory exists
    next_dir = project_path / ".next"
    static_dir = next_dir / "static"
    
    if not next_dir.exists():
        return {"passed": True, "skipped": True, "reason": "No .next folder found (need build)"}
    
    if not static_dir.exists():
        return {"passed": True, "skipped": True, "reason": "No .next/static folder found"}
    
    print(f"Analyzing bundle size in {project_path.name}/.next/static...")
    
    # JS Chunks
    js_size = get_directory_size(static_dir, "*.js")
    js_mb = js_size / (1024 * 1024)
    
    # CSS Chunks
    css_size = get_directory_size(static_dir, "*.css")
    css_mb = css_size / (1024 * 1024)
    
    # Results
    if js_mb <= MAX_JS_BUNDLE_MB:
        passed.append(f"[OK] Total JS bundle size: {js_mb:.2f} MB")
    else:
        issues.append(f"[!] Large JS bundle detected: {js_mb:.2f} MB (optimize imports!)")
        
    if css_mb <= MAX_CSS_BUNDLE_MB:
        passed.append(f"[OK] Total CSS bundle size: {css_mb:.2f} MB")
    else:
        issues.append(f"[!] Large CSS bundle detected: {css_mb:.2f} MB")
        
    return {
        "passed": js_mb < (MAX_JS_BUNDLE_MB * 1.5),  # Fail only if significantly larger
        "issues": issues,
        "passed_checks": passed,
        "stats": {
            "js_mb": round(js_mb, 2),
            "css_mb": round(css_mb, 2)
        }
    }

def main():
    if len(sys.argv) < 2:
        print("Usage: python bundle_analyzer.py <project_path>")
        sys.exit(1)
    
    project_path = Path(sys.argv[1]).resolve()
    
    print("=" * 60)
    print("  BUNDLE ANALYZER - Performance Monitoring")
    print("=" * 60)
    
    result = analyze_bundle(project_path)
    
    if result.get("skipped"):
        print(f"\n[SKIP] {result['reason']}")
        sys.exit(0)
        
    print("\nSummary:")
    for check in result.get("passed_checks", []):
        print(f"  {check}")
    
    for issue in result.get("issues", []):
        print(f"  {issue}")
        
    print("\n" + "=" * 60)
    if result["passed"]:
        print("[OK] PERFORMANCE AUDIT: ACCEPTABLE")
        sys.exit(0)
    else:
        print(f"[X] PERFORMANCE AUDIT: FAILED ({len(result['issues'])} critical issues)")
        sys.exit(1)

if __name__ == "__main__":
    main()
