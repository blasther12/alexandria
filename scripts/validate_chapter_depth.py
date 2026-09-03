#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "docs" / "data.json"
DEPTH = ROOT / "docs" / "chapter-depth.json"

REQUIRED = {"lens", "mechanism", "evidence", "failure", "workedExample", "signals"}
MIN_LENGTH = {
    "lens": 12,
    "mechanism": 40,
    "evidence": 30,
    "failure": 30,
    "workedExample": 100,
}


def fail(message: str) -> None:
    raise SystemExit(f"chapter-depth: {message}")


def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    depth = json.loads(DEPTH.read_text(encoding="utf-8"))

    themes = data.get("themes", [])
    contexts = depth.get("themes", {})
    ids = {theme.get("id") for theme in themes}
    context_ids = set(contexts)

    missing = sorted(ids - context_ids)
    extra = sorted(context_ids - ids)
    if missing:
        fail(f"temas sem contrato de profundidade: {', '.join(missing)}")
    if extra:
        fail(f"contratos sem tema correspondente: {', '.join(extra)}")

    total_chapters = 0
    for theme in themes:
        theme_id = theme["id"]
        focus = theme.get("focus", [])
        if not focus:
            fail(f"tema {theme_id} não possui capítulos")
        total_chapters += len(focus)

        config = contexts[theme_id]
        missing_fields = sorted(REQUIRED - set(config))
        if missing_fields:
            fail(f"tema {theme_id} sem campos: {', '.join(missing_fields)}")

        for field, min_length in MIN_LENGTH.items():
            value = config.get(field)
            if not isinstance(value, str) or len(value.strip()) < min_length:
                fail(f"tema {theme_id} possui campo raso ou inválido: {field}")

        signals = config.get("signals")
        if not isinstance(signals, list) or len(signals) < 4 or any(not str(item).strip() for item in signals):
            fail(f"tema {theme_id} precisa de pelo menos quatro sinais de diagnóstico")

    if total_chapters < 100:
        fail(f"cobertura inesperadamente baixa: {total_chapters} capítulos")

    print(f"chapter-depth: {len(themes)} temas e {total_chapters} capítulos cobertos")


if __name__ == "__main__":
    main()
