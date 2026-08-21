#!/usr/bin/env python3
"""Validate local Markdown structure without third-party dependencies."""

from __future__ import annotations

import argparse
import html
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

try:
    from .markdown_fences import Fence, closes_fence, opening_fence
except ImportError:  # Direct execution: python3 scripts/validate_docs.py
    from markdown_fences import Fence, closes_fence, opening_fence


ROOT = Path(__file__).resolve().parents[1]
IGNORED_PARTS = {".git", "node_modules"}
LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
MERMAID_TYPES = (
    "flowchart",
    "graph",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "erDiagram",
    "journey",
    "gantt",
    "pie",
    "mindmap",
    "timeline",
    "quadrantChart",
    "gitGraph",
    "C4",
)


def markdown_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.md")
        if not any(part in IGNORED_PARTS for part in path.relative_to(ROOT).parts)
    )


def github_slug(value: str) -> str:
    value = html.unescape(re.sub(r"<[^>]+>", "", value)).strip().lower()
    chars: list[str] = []
    for char in value:
        category = unicodedata.category(char)
        if char in {" ", "-", "_"} or category[0] in {"L", "N", "M"}:
            chars.append(char)
    return "".join(chars).replace(" ", "-")


def anchors_for(path: Path) -> set[str]:
    counts: Counter[str] = Counter()
    anchors: set[str] = set()
    active_fence: Fence | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if active_fence:
            if closes_fence(line, active_fence):
                active_fence = None
            continue
        active_fence = opening_fence(line)
        if active_fence:
            continue
        heading = HEADING_RE.match(line)
        if not heading:
            continue
        base = github_slug(heading.group(2))
        if not base:
            continue
        suffix = counts[base]
        counts[base] += 1
        anchors.add(base if suffix == 0 else f"{base}-{suffix}")
    return anchors


def normalize_link(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("<") and ">" in raw:
        return raw[1 : raw.index(">")]
    # Optional Markdown title: (path "title"). Paths in Alexandria contain no spaces.
    return raw.split(maxsplit=1)[0]


def validate_links(path: Path, anchor_cache: dict[Path, set[str]]) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    active_fence: Fence | None = None
    for line_number, line in enumerate(text.splitlines(), start=1):
        if active_fence:
            if closes_fence(line, active_fence):
                active_fence = None
            continue
        active_fence = opening_fence(line)
        if active_fence:
            continue
        without_inline_code = re.sub(r"(`+).*?\1", "", line)
        for raw in LINK_RE.findall(without_inline_code):
            target = normalize_link(raw)
            if not target or target.startswith(("http://", "https://", "mailto:", "tel:")):
                continue
            target = unquote(target)
            target_path, _, fragment = target.partition("#")
            target_path = target_path.split("?", 1)[0]
            if not target_path:
                resolved = path
            elif target_path.startswith("/"):
                errors.append(f"{path.relative_to(ROOT)}:{line_number}: link local absoluto: {target}")
                continue
            else:
                resolved = (path.parent / target_path).resolve()
            try:
                resolved.relative_to(ROOT)
            except ValueError:
                errors.append(f"{path.relative_to(ROOT)}:{line_number}: link sai do repositório: {target}")
                continue
            if not resolved.exists():
                errors.append(f"{path.relative_to(ROOT)}:{line_number}: destino ausente: {target}")
                continue
            anchor_file = resolved / "README.md" if resolved.is_dir() else resolved
            if fragment and anchor_file.suffix.lower() == ".md":
                expected = github_slug(fragment)
                anchors = anchor_cache.setdefault(anchor_file, anchors_for(anchor_file))
                if expected not in anchors:
                    errors.append(
                        f"{path.relative_to(ROOT)}:{line_number}: anchor ausente "
                        f"em {anchor_file.relative_to(ROOT)}: #{fragment}"
                    )
    return errors


def validate_document(path: Path) -> tuple[list[str], int]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    relative = path.relative_to(ROOT)
    if text.startswith("\ufeff"):
        errors.append(f"{relative}: arquivo contém BOM UTF-8")
    if text and not text.endswith("\n"):
        errors.append(f"{relative}: arquivo deve terminar com newline")

    active_fence: Fence | None = None
    fence_start = 0
    language = ""
    block: list[str] = []
    mermaid_count = 0
    for line_number, line in enumerate(text.splitlines(), start=1):
        if active_fence:
            if closes_fence(line, active_fence):
                if language == "mermaid":
                    mermaid_count += 1
                    first = next((item.strip() for item in block if item.strip()), "")
                    if not first.startswith(MERMAID_TYPES):
                        errors.append(
                            f"{relative}:{fence_start}: diagrama Mermaid vazio ou tipo desconhecido"
                        )
                active_fence = None
            else:
                block.append(line)
            continue
        active_fence = opening_fence(line)
        if active_fence:
            fence_start = line_number
            language = active_fence.info.split(maxsplit=1)[0].lower() if active_fence.info else ""
            block = []
        elif line.endswith(" ") and not line.endswith("  "):
            errors.append(f"{relative}:{line_number}: whitespace final isolado")
    if active_fence:
        errors.append(f"{relative}:{fence_start}: fence sem fechamento")
    return errors, mermaid_count


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--require-navigation",
        action="store_true",
        help="Require a navigation footer on ordinary documentation pages.",
    )
    args = parser.parse_args()

    docs = markdown_files()
    errors: list[str] = []
    anchor_cache: dict[Path, set[str]] = {}
    mermaid_total = 0
    navigation_exempt = {
        Path("README.md"),
        Path(".github/PULL_REQUEST_TEMPLATE.md"),
        Path("skills/examples/code-review/SKILL.md"),
        Path("skills/examples/code-review/references/rubric.md"),
    }

    for path in docs:
        document_errors, mermaid_count = validate_document(path)
        errors.extend(document_errors)
        mermaid_total += mermaid_count
        errors.extend(validate_links(path, anchor_cache))
        if args.require_navigation:
            relative = path.relative_to(ROOT)
            is_skill_resource = (
                len(relative.parts) >= 2
                and relative.parts[:2] == ("skills", "examples")
            )
            if relative not in navigation_exempt and not is_skill_resource:
                tail = "\n".join(path.read_text(encoding="utf-8").splitlines()[-12:])
                if "---" not in tail or "↑" not in tail:
                    errors.append(f"{relative}: rodapé de navegação ausente")

    if errors:
        print("Falhas na documentação:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"OK: {len(docs)} arquivos Markdown, links internos válidos, {mermaid_total} diagramas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
