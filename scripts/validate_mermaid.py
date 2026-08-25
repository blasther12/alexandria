#!/usr/bin/env python3
"""Render every Mermaid block with mermaid-cli."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from .markdown_fences import Fence, closes_fence, opening_fence
except ImportError:  # Direct execution: python3 scripts/validate_mermaid.py
    from markdown_fences import Fence, closes_fence, opening_fence


ROOT = Path(__file__).resolve().parents[1]


def mermaid_blocks(text: str) -> list[tuple[int, str]]:
    """Return line/body pairs for complete Mermaid fenced blocks."""
    blocks: list[tuple[int, str]] = []
    active_fence: Fence | None = None
    language = ""
    start_line = 0
    body: list[str] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        if active_fence:
            if closes_fence(line, active_fence):
                if language == "mermaid":
                    blocks.append((start_line, "\n".join(body) + "\n"))
                active_fence = None
            else:
                body.append(line)
            continue
        active_fence = opening_fence(line)
        if active_fence:
            language = active_fence.info.split(maxsplit=1)[0].lower() if active_fence.info else ""
            start_line = line_number
            body = []
    return blocks


def render_command(executable: str, source: Path, output: Path) -> list[str]:
    """Build the mmdc command, optionally using an explicit Puppeteer config."""
    command = [executable, "--quiet"]
    puppeteer_config = os.environ.get("MERMAID_PUPPETEER_CONFIG")
    if puppeteer_config:
        command.extend(["--puppeteerConfigFile", puppeteer_config])
    command.extend(["-i", str(source), "-o", str(output)])
    return command


def render_failure_detail(result: subprocess.CompletedProcess[str]) -> str:
    """Return a useful rendering error without dumping noisy browser logs."""
    output_lines = [
        item.strip()
        for item in (result.stderr or result.stdout).splitlines()
        if item.strip()
    ]
    parse_error = next(
        (
            item
            for item in output_lines
            if "parse error" in item.lower()
            or "lexical error" in item.lower()
        ),
        None,
    )
    if parse_error:
        return parse_error

    error_line = next(
        (item for item in output_lines if item.lower().startswith("error:")),
        None,
    )
    if error_line:
        # Browser launch failures often put the actionable Chromium message on a
        # nearby line. Keep a small tail so CI does not collapse the root cause
        # into the generic "Failed to launch" message again.
        index = output_lines.index(error_line)
        context = output_lines[index : index + 5]
        return " | ".join(context)

    return output_lines[-1] if output_lines else "erro de renderização"


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
            for index, (line, body) in enumerate(mermaid_blocks(text), start=1):
                count += 1
                source = temp / f"diagram-{count}.mmd"
                output = temp / f"diagram-{count}.svg"
                source.write_text(body, encoding="utf-8")
                result = subprocess.run(
                    render_command(executable, source, output),
                    capture_output=True,
                    text=True,
                    check=False,
                )
                if result.returncode:
                    failures.append(
                        f"{document.relative_to(ROOT)}:{line} bloco {index}: "
                        f"{render_failure_detail(result)}"
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
