#!/usr/bin/env python3
"""Validate the source-controlled metadata used by Release Please."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CHANGELOG_ENTRY_RE = re.compile(r"^## (?:v|\[)?\d", re.MULTILINE)
PRERELEASE_IDENTIFIER = (
    r"(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)"
)
SEMVER_RE = re.compile(
    r"^(0|[1-9]\d*)\."
    r"(0|[1-9]\d*)\."
    r"(0|[1-9]\d*)"
    rf"(?:-{PRERELEASE_IDENTIFIER}(?:\.{PRERELEASE_IDENTIFIER})*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)


def load_json(path: Path, errors: list[str]) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        errors.append(f"{path.name}: JSON inválido ou ausente: {error}")
        return None


def main() -> int:
    errors: list[str] = []
    config = load_json(ROOT / "release-please-config.json", errors)
    manifest = load_json(ROOT / ".release-please-manifest.json", errors)

    version_path = ROOT / "version.txt"
    try:
        version = version_path.read_text(encoding="utf-8").strip()
    except OSError as error:
        errors.append(f"version.txt: arquivo ausente: {error}")
        version = ""

    changelog_path = ROOT / "CHANGELOG.md"
    try:
        changelog = changelog_path.read_text(encoding="utf-8")
    except OSError as error:
        errors.append(f"CHANGELOG.md: arquivo ausente: {error}")
        changelog = ""

    if not version:
        errors.append("version.txt: versão vazia")
    elif not SEMVER_RE.fullmatch(version):
        errors.append(f"version.txt: versão não segue SemVer: {version}")

    if not isinstance(config, dict):
        errors.append("release-please-config.json: raiz deve ser um objeto")
    else:
        packages = config.get("packages")
        root_package = packages.get(".") if isinstance(packages, dict) else None
        if not isinstance(root_package, dict):
            errors.append("release-please-config.json: package raiz '.' ausente")
        elif root_package.get("release-type") != "simple":
            errors.append("release-please-config.json: release-type raiz deve ser 'simple'")

    if not changelog.strip():
        errors.append("CHANGELOG.md: arquivo vazio")
    elif not CHANGELOG_ENTRY_RE.search(changelog):
        errors.append("CHANGELOG.md: entrada de versão inicial ausente")

    if not isinstance(manifest, dict):
        errors.append(".release-please-manifest.json: raiz deve ser um objeto")
    elif "." in manifest:
        released = manifest["."]
        if not isinstance(released, str) or not SEMVER_RE.fullmatch(released):
            errors.append(".release-please-manifest.json: versão raiz inválida")
        elif version and released != version:
            errors.append(
                ".release-please-manifest.json e version.txt divergem: "
                f"{released} != {version}"
            )
    elif version and version != "0.0.0":
        errors.append("manifesto vazio só é válido durante o bootstrap 0.0.0")

    if errors:
        print("Falhas no versionamento:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"OK: metadados de release válidos; versão local {version}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
