#!/usr/bin/env python3
"""
Build Checker - Verifica se o projeto compila e faz build corretamente

Usage:
    python build_checker.py <project_path>

Checks:
    - Next.js build (npm run build)
    - Verifica se todas as rotas compilam
    - Detecta warnings de build
"""

import subprocess
import sys
import json
import re
from pathlib import Path
from datetime import datetime


def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()

    print(f"\n{'='*60}")
    print("[BUILD CHECKER] Verificando build do projeto")
    print(f"{'='*60}")
    print(f"Projeto: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)

    package_json = project_path / "package.json"
    if not package_json.exists():
        print("[SKIP] Nenhum package.json encontrado")
        output = {"script": "build_checker", "passed": True, "message": "No package.json"}
        print(json.dumps(output, indent=2))
        sys.exit(0)

    try:
        pkg = json.loads(package_json.read_text(encoding="utf-8"))
        build_script = pkg.get("scripts", {}).get("build")
        if not build_script:
            print("[SKIP] Nenhum script de build definido no package.json")
            output = {"script": "build_checker", "passed": True, "message": "No build script"}
            print(json.dumps(output, indent=2))
            sys.exit(0)
    except Exception as e:
        print(f"[ERRO] Não foi possível ler package.json: {e}")
        sys.exit(1)

    # Executa o build
    print("\n▶ Executando: npm run build\n")
    start = datetime.now()

    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=str(project_path),
        capture_output=True,
        text=True,
        timeout=300,
    )

    duration = (datetime.now() - start).total_seconds()

    # Análise do output
    output_lines = result.stdout.split("\n")
    error_lines = result.stderr.split("\n")

    # Verifica se o build foi bem-sucedido
    build_success = "✓ Compiled successfully" in result.stdout or "✓ Generating" in result.stdout
    build_success = build_success or result.returncode == 0

    # Extrai warnings relevantes
    warnings = []
    for line in output_lines + error_lines:
        if "warn" in line.lower() or "warning" in line.lower():
            if "node_modules" not in line:
                warnings.append(line.strip())

    # Extrai rotas compiladas
    routes = []
    route_section = False
    for line in output_lines:
        if "Route (app)" in line:
            route_section = True
            continue
        if route_section and line.strip().startswith("┌") or line.strip().startswith("├") or line.strip().startswith("└"):
            routes.append(line.strip())
            continue
        if route_section and not line.strip().startswith("○") and not line.strip().startswith("ƒ") and not line.strip().startswith("┌") and not line.strip().startswith("├") and not line.strip().startswith("└") and route_section:
            if line.strip() == "":
                route_section = False

    # Resultado
    if build_success:
        print(f"\n✅ BUILD: SUCESSO ({duration:.1f}s)")
        print(f"   Rotas compiladas: {len(routes)}")
        if warnings:
            print(f"   ⚠ Avisos: {len(warnings)}")
            for w in warnings[:5]:
                print(f"     - {w}")
    else:
        print(f"\n❌ BUILD: FALHOU ({duration:.1f}s)")
        # Mostra os últimos erros
        errors = [l for l in output_lines + error_lines if "error" in l.lower() or "Error" in l]
        for e in errors[-10:]:
            print(f"   {e}")

    print("-" * 60)
    print(f"Resumo: {'✅ PASSOU' if build_success else '❌ FALHOU'}")

    output = {
        "script": "build_checker",
        "project": str(project_path),
        "build_script": build_script,
        "duration_seconds": round(duration, 1),
        "routes_found": len(routes),
        "warning_count": len(warnings),
        "passed": build_success,
    }
    print("\n" + json.dumps(output, indent=2))
    sys.exit(0 if build_success else 1)


if __name__ == "__main__":
    main()
