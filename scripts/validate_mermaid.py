#!/usr/bin/env python3
"""Render every Mermaid block with mermaid-cli."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOCK_RE = re.compile(r"^```mermaid\s*$\n(.*?)^```\s*$", re.MULTILINE | re.DOTALL)


def main() -> int:
    executable = shutil.which("mmdc")
    if not executable:
        print("mmdc não encontrado; instale @mermaid-js/mermaid-cli.", file=sys.stderr)
        return 2

    failures: list[str] = []
    count = 0
    with tempfile.TemporaryDirectory(prefix="alexandria-mermaid-") as temporary:
        temp = Path(temporary)
        for document in sorted(ROOT.rglob("*.md")):
            if any(part in {".git", "node_modules"} for part in document.relative_to(ROOT).parts):
                continue
            text = document.read_text(encoding="utf-8")
            for index, match in enumerate(BLOCK_RE.finditer(text), start=1):
                count += 1
                source = temp / f"diagram-{count}.mmd"
                output = temp / f"diagram-{count}.svg"
                source.write_text(match.group(1), encoding="utf-8")
                result = subprocess.run(
                    [executable, "--quiet", "-i", str(source), "-o", str(output)],
                    capture_output=True,
                    text=True,
                    check=False,
                )
                if result.returncode:
                    line = text.count("\n", 0, match.start()) + 1
                    output_lines = [
                        item.strip()
                        for item in (result.stderr or result.stdout).splitlines()
                        if item.strip()
                    ]
                    detail = next(
                        (
                            item
                            for item in output_lines
                            if "parse error" in item.lower()
                            or "lexical error" in item.lower()
                            or item.lower().startswith("error:")
                        ),
                        output_lines[-1] if output_lines else "erro de renderização",
                    )
                    failures.append(
                        f"{document.relative_to(ROOT)}:{line} bloco {index}: "
                        f"{detail}"
                    )

    if failures:
        print("Diagramas Mermaid inválidos:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1
    print(f"OK: {count} diagramas Mermaid renderizados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
