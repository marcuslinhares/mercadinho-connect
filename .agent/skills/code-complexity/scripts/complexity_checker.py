#!/usr/bin/env python3
"""
Code Complexity Checker - Análise de complexidade ciclomática e qualidade

Usage:
    python complexity_checker.py <project_path>

Métricas:
    - Complexidade ciclomática por função
    - Tamanho de função (linhas)
    - Tamanho de arquivo
    - Profundidade de aninhamento
    - Duplicação de código (básica)
    - Complexidade de componente React
"""

import sys
import re
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple

# Diretórios para ignorar
SKIP_DIRS = {"node_modules", ".next", "dist", "build", ".git", "__pycache__", ".agent"}

# Extensões para analisar
ANALYZE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}

# Limiares (thresholds)
THRESHOLDS = {
    "max_function_lines": 200,       # Componentes JSX/TSX são naturalmente maiores
    "max_function_complexity": 20,   # Complexidade ciclomática aceitável
    "max_file_lines": 600,           # Arquivos de página podem ser longos
    "max_nesting_depth": 10,         # JSX tem aninhamento profundo por natureza
    "max_file_complexity": 80,
    "max_params": 8,
    "max_component_lines": 350,      # Componentes de página podem ser grandes
}


def count_lines(content: str) -> int:
    return len(content.splitlines())


def estimate_cyclomatic_complexity(code_block: str) -> int:
    """Estima complexidade ciclomática: 1 + número de pontos de decisão."""
    complexity = 1
    patterns = [
        r"\bif\s*\(", r"\belse\s+if\b", r"\bfor\s*\(", r"\bwhile\s*\(",
        r"\bcase\s+", r"\bcatch\s*\(", r"\b\?\s*", r"\b\|\|\b", r"\b&&\b",
        r"\bswitch\s*\(", r"\bdefault\s*:",
    ]
    for pat in patterns:
        complexity += len(re.findall(pat, code_block))
    return complexity


def get_nesting_depth(code_block: str) -> int:
    """Calcula a profundidade máxima de aninhamento."""
    max_depth = 0
    current = 0
    for char in code_block:
        if char in "{(":
            current += 1
            max_depth = max(max_depth, current)
        elif char in "})":
            current = max(0, current - 1)
    return max_depth


def extract_functions(content: str) -> List[Dict]:
    """Extrai funções e métricas."""
    functions = []

    # Padrões para detectar funções/ métodos
    patterns = [
        r"(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)",
        r"(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\))\s*(?:=>)?",
        r"(?:export\s+)?default\s+(?:async\s+)?function\s+(\w*)\s*\(([^)]*)\)",
        r"(\w+)\s*[=:]\s*(?:async\s+)?\([^)]*\)\s*=>",
        r"class\s+(\w+)[^{]*{",
    ]

    for pat in patterns:
        for match in re.finditer(pat, content, re.MULTILINE):
            name = match.group(1) if match.lastindex and match.lastindex >= 1 else "anonymous"
            params = match.group(2) if match.lastindex and match.lastindex >= 2 else ""

            # Extrai o corpo da função até o fechamento
            start = match.start()
            end = find_block_end(content, match.end())
            if end == -1:
                end = len(content)

            body = content[start:end]
            func_lines = count_lines(body)
            complexity = estimate_cyclomatic_complexity(body)
            nesting = get_nesting_depth(body)
            param_count = len([p.strip() for p in params.split(",") if p.strip()])

            functions.append({
                "name": name,
                "params": param_count,
                "lines": func_lines,
                "complexity": complexity,
                "nesting_depth": nesting,
                "start_line": content[:start].count("\n") + 1,
            })

    return functions


def find_block_end(content: str, start_pos: int) -> int:
    """Encontra o final de um bloco de código."""
    depth = 0
    in_block = False
    for i in range(start_pos, len(content)):
        if content[i] == "{":
            depth += 1
            in_block = True
        elif content[i] == "}":
            depth -= 1
            if in_block and depth == 0:
                return i + 1
    return -1


def extract_react_components(content: str, filename: str) -> List[Dict]:
    """Detecta componentes React e suas métricas."""
    components = []

    # Detecta componentes React: export default function Component ou export function Component
    pat = r"(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Z]\w*)\s*\([^)]*\)"
    for match in re.finditer(pat, content):
        name = match.group(1)
        start = match.start()
        end = find_block_end(content, match.end())
        if end == -1:
            end = len(content)

        body = content[start:end]
        lines = count_lines(body)

        # Conta JSX elements como indicador de complexidade visual
        jsx_count = len(re.findall(r"<[A-Z]\w+[^>]*>", body))
        hook_count = len(re.findall(r"use\w+\s*\(", body))
        state_vars = len(re.findall(r"useState\s*\(", body))
        effects = len(re.findall(r"useEffect\s*\(", body))

        components.append({
            "name": name,
            "lines": lines,
            "jsx_elements": jsx_count,
            "hooks": hook_count,
            "state_vars": state_vars,
            "effects": effects,
        })

    return components


def analyze_file(filepath: Path) -> Dict:
    """Analisa um único arquivo."""
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return {"file": str(filepath), "error": "Não foi possível ler"}

    lines = count_lines(content)
    functions = extract_functions(content)
    components = extract_react_components(content, filepath.name)

    # Métricas do arquivo
    total_complexity = sum(f["complexity"] for f in functions) if functions else 0
    max_complexity = max((f["complexity"] for f in functions), default=0)
    max_func_lines = max((f["lines"] for f in functions), default=0)
    max_nesting = max((f["nesting_depth"] for f in functions), default=0)
    max_params = max((f["params"] for f in functions), default=0)
    total_functions = len(functions)

    issues = []

    if lines > THRESHOLDS["max_file_lines"]:
        issues.append(f"Arquivo muito grande: {lines} linhas (max: {THRESHOLDS['max_file_lines']})")

    for func in functions:
        if func["lines"] > THRESHOLDS["max_function_lines"]:
            issues.append(f"Função longa: {func['name']} tem {func['lines']} linhas (max: {THRESHOLDS['max_function_lines']})")
        if func["complexity"] > THRESHOLDS["max_function_complexity"]:
            issues.append(f"Alta complexidade: {func['name']} tem complexidade {func['complexity']} (max: {THRESHOLDS['max_function_complexity']})")
        if func["nesting_depth"] > THRESHOLDS["max_nesting_depth"]:
            issues.append(f"Aninhamento profundo: {func['name']} tem profundidade {func['nesting_depth']} (max: {THRESHOLDS['max_nesting_depth']})")
        if func["params"] > THRESHOLDS["max_params"]:
            issues.append(f"Muitos parâmetros: {func['name']} tem {func['params']} parâmetros (max: {THRESHOLDS['max_params']})")

    for comp in components:
        if comp["lines"] > THRESHOLDS["max_component_lines"]:
            issues.append(f"Componente grande: {comp['name']} tem {comp['lines']} linhas (max: {THRESHOLDS['max_component_lines']})")
        if comp["hooks"] > 5:
            issues.append(f"Muitos hooks: {comp['name']} tem {comp['hooks']} hooks (considere extrair lógica)")

    score = _calculate_score(lines, max_complexity, max_func_lines, max_nesting, total_functions, issues)

    return {
        "file": str(filepath.relative_to(filepath.parents[2]) if len(filepath.parents) > 2 else filepath.name),
        "lines": lines,
        "functions": len(functions),
        "components": len(components),
        "total_complexity": total_complexity,
        "max_complexity": max_complexity,
        "max_function_lines": max_func_lines,
        "max_nesting": max_nesting,
        "max_params": max_params,
        "issues": issues,
        "score": score,
    }


def _calculate_score(lines, max_complexity, max_func_lines, max_nesting, total_funcs, issues):
    """Calcula score de 0-100 baseado nas métricas."""
    deductions = len(issues) * 15

    if lines > THRESHOLDS["max_file_lines"]:
        deductions += 10
    if max_complexity > THRESHOLDS["max_function_complexity"]:
        deductions += 10
    if max_func_lines > THRESHOLDS["max_function_lines"]:
        deductions += 10
    if max_nesting > THRESHOLDS["max_nesting_depth"]:
        deductions += 10

    return max(0, min(100, 100 - deductions))


def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()

    print(f"\n{'='*60}")
    print("[COMPLEXITY CHECKER] Análise de Complexidade e Qualidade")
    print(f"{'='*60}")
    print(f"Projeto: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Limiares: {json.dumps(THRESHOLDS, indent=2)}")
    print("-" * 60)

    # Encontra arquivos fonte
    source_files = []
    for ext in ANALYZE_EXTENSIONS:
        for f in project_path.rglob(f"*{ext}"):
            parts = f.parts
            if not any(skip in parts for skip in SKIP_DIRS):
                # Ignora node_modules, .next, etc.
                if not any(part.startswith("node_modules") or part.startswith(".next") or part.startswith("dist") or part.startswith("build") for part in f.relative_to(project_path).parts):
                    source_files.append(f)

    print(f"Arquivos fonte encontrados: {len(source_files)}")

    # Analisa cada arquivo
    all_issues = []
    file_results = []
    total_score_sum = 0
    analyzed_count = 0

    for f in source_files[:100]:  # Limite de 100 arquivos
        result = analyze_file(f)
        file_results.append(result)
        analyzed_count += 1

        if result["issues"]:
            all_issues.extend(result["issues"])
            for issue in result["issues"]:
                print(f"  ⚠ [{result['file']}] {issue}")

        total_score_sum += result["score"]

    avg_score = round(total_score_sum / analyzed_count) if analyzed_count > 0 else 100

    print("-" * 60)
    print(f"Score médio: {avg_score}%")
    print(f"Total de issues: {len(all_issues)}")
    print(f"Arquivos analisados: {analyzed_count}")
    print(f"Funções totais: {sum(r['functions'] for r in file_results)}")

    # Resumo
    passed = avg_score >= 80
    print(f"Resultado: {'✅ PASSOU' if passed else '❌ PRECISA REVISAR'}")

    output = {
        "script": "complexity_checker",
        "project": str(project_path),
        "files_analyzed": analyzed_count,
        "average_score": avg_score,
        "total_issues": len(all_issues),
        "issues": all_issues[:20],
        "passed": passed,
    }
    print("\n" + json.dumps(output, indent=2))
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
