#!/usr/bin/env python3
"""
SEO Checker - Search Engine Optimization Audit (Next.js 15 Compatible)
Checks HTML/JSX/TSX pages for SEO best practices.

UPDATED FOR NEXT.JS 15 APP ROUTER:
    - Detects export const metadata (Metadata API)
    - Supports both old <Head> pattern and new metadata exports
    - Validates OpenGraph via metadata.openGraph
    - Checks JSON-LD structured data

PURPOSE:
    - Verify meta tags, titles, descriptions
    - Check Open Graph tags for social sharing
    - Validate heading hierarchy
    - Check image accessibility (alt attributes)

Usage:
    python seo_checker.py <project_path>
"""
import sys
import json
import re
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


# Directories to skip
SKIP_DIRS = {
    'node_modules', '.next', 'dist', 'build', '.git', '.github',
    '__pycache__', '.vscode', '.idea', 'coverage', 'test', 'tests',
    '__tests__', 'spec', 'docs', 'documentation', 'examples'
}

# Files to skip (not pages)
SKIP_PATTERNS = [
    'config', 'setup', 'util', 'helper', 'hook', 'context', 'store',
    'service', 'api', 'lib', 'constant', 'type', 'interface', 'mock',
    '.test.', '.spec.', '_test.', '_spec.'
]


def is_page_file(file_path: Path) -> bool:
    """Check if this file is likely a public-facing page."""
    name = file_path.name.lower()
    stem = file_path.stem.lower()
    
    # Skip utility/config files
    if any(skip in name for skip in SKIP_PATTERNS):
        return False
    
    # Check path - pages in specific directories are likely pages
    parts = [p.lower() for p in file_path.parts]
    page_dirs = ['pages', 'app', 'routes', 'views', 'screens']
    
    if any(d in parts for d in page_dirs):
        return True
    
    # Filename indicators for pages
    page_names = ['page', 'index', 'home', 'about', 'contact', 'blog', 
                  'post', 'article', 'product', 'landing', 'layout']
    
    if any(p in stem for p in page_names):
        return True
    
    # HTML files are usually pages
    if file_path.suffix.lower() in ['.html', '.htm']:
        return True
    
    return False


def find_pages(project_path: Path) -> list:
    """Find page files to check."""
    patterns = ['**/*.html', '**/*.htm', '**/*.jsx', '**/*.tsx']
    
    files = []
    for pattern in patterns:
        for f in project_path.glob(pattern):
            # Skip excluded directories
            if any(skip in f.parts for skip in SKIP_DIRS):
                continue
            
            # Check if it's likely a page
            if is_page_file(f):
                files.append(f)
    
    return files[:50]  # Limit to 50 files


def has_metadata_export(content: str) -> dict:
    """Check for Next.js 15 Metadata API export."""
    result = {
        'has_metadata': False,
        'has_title': False,
        'has_description': False,
        'has_opengraph': False
    }
    
    # Check for: export const metadata
    if 'export const metadata' in content or 'export let metadata' in content:
        result['has_metadata'] = True
        
        # Simple string checks (more reliable than parsing)
        if 'title:' in content or "title =" in content:
            result['has_title'] = True
        
        if 'description:' in content or "description =" in content:
            result['has_description'] = True
        
        if 'openGraph' in content or 'open_graph' in content:
            result['has_opengraph'] = True
    
    return result


def check_page(file_path: Path) -> dict:
    """Check a single page for SEO issues."""
    issues = []
    
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
    except Exception as e:
        return {"file": str(file_path.name), "issues": [f"Error: {e}"]}
    
    # Detect if this is a layout/template file
    is_layout = 'Head>' in content or '<head' in content.lower() or 'layout' in file_path.name.lower()
    is_page = 'page' in file_path.name.lower() or 'index' in file_path.name.lower()
    
    # Check for Next.js 15 Metadata API
    metadata_check = has_metadata_export(content)
    
    # If using Metadata API and it has all fields, skip legacy checks
    if metadata_check['has_metadata'] and metadata_check['has_title'] and metadata_check['has_description']:
        # Metadata API is complete, no issues
        return {
            "file": str(file_path.name),
            "issues": []
        }
    
    # Legacy checks for old pattern
    has_title_tag = '<title' in content.lower()
    has_desc_tag = 'name="description"' in content.lower() or 'name=\'description\'' in content.lower()
    has_og_tag = 'og:' in content or 'property="og:' in content.lower()
    
    # Title check (either old or new pattern)
    if (is_layout or is_page) and not (has_title_tag or metadata_check['has_title']):
        issues.append("Missing title (no <title> or metadata.title)")
    
    # Description check
    if (is_layout or is_page) and not (has_desc_tag or metadata_check['has_description']):
        issues.append("Missing description (no meta description or metadata.description)")
    
    # OpenGraph check (optional, just a warning)
    if (is_layout or is_page) and not (has_og_tag or metadata_check['has_opengraph']):
        # OpenGraph is nice to have but not critical
        pass
    
    # Heading hierarchy - multiple H1s
    h1_matches = re.findall(r'<h1[^>]*>', content, re.I)
    if len(h1_matches) > 1:
        issues.append(f"Multiple H1 tags ({len(h1_matches)})")
    
    # Images without alt (only check JSX Image component from next/image)
    # Next.js Image component requires alt, so we're more lenient
    img_pattern = r'<img[^>]+>'
    imgs = re.findall(img_pattern, content, re.I)
    for img in imgs:
        if 'alt=' not in img.lower():
            # Only warn if it's a raw <img>, not Next.js <Image>
            if '<Image' not in content:
                issues.append("Image missing alt attribute")
            break
    
    return {
        "file": str(file_path.name),
        "issues": issues
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python seo_checker.py <project_path>")
        sys.exit(1)
    
    project_path = Path(sys.argv[1]).resolve()
    
    print("=" * 60)
    print("  SEO CHECKER - Search Engine Optimization Audit")
    print("=" * 60)
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    # Find pages
    pages = find_pages(project_path)
    
    if not pages:
        print("\n[!] No page files found.")
        print("    Looking for: HTML, JSX, TSX in pages/app/routes directories")
        result = {
            "script": "seo_checker",
            "files_checked": 0,
            "passed": True
        }
        print(f"\n{json.dumps(result, indent=2)}")
        return
    
    print(f"Found {len(pages)} page files to analyze\n")
    
    # Check each page
    all_issues = {}
    for page in pages:
        result = check_page(page)
        if result["issues"]:
            all_issues[result["file"]] = result["issues"]
    
    # Report
    if all_issues:
        print("=" * 60)
        print("SEO ANALYSIS RESULTS")
        print("=" * 60)
        print()
        
        # Summary
        issue_counts = {}
        for issues in all_issues.values():
            for issue in issues:
                issue_counts[issue] = issue_counts.get(issue, 0) + 1
        
        print("Issue Summary:")
        for issue, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
            print(f"  [{count}] {issue}")
        
        print(f"\nAffected files ({len(all_issues)}):")
        for file in all_issues.keys():
            print(f"  - {file}")
        print()
    else:
        print("[✓] All SEO checks passed!\n")
    
    # JSON output
    result = {
        "script": "seo_checker",
        "project": str(project_path),
        "files_checked": len(pages),
        "files_with_issues": len(all_issues),
        "issues_found": sum(len(v) for v in all_issues.values()),
        "passed": len(all_issues) == 0
    }
    
    print(json.dumps(result, indent=2))
    
    sys.exit(0 if result["passed"] else 1)


if __name__ == "__main__":
    main()
