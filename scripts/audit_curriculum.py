#!/usr/bin/env python3
"""Audit Alexandria curriculum metadata and editorial depth.

This script deliberately treats depth as a heuristic signal, not as proof of
mastery. It validates the curriculum graph and highlights pages that deserve
editorial review according to their expected level and content profile.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CATALOG = ROOT / "curriculum" / "catalog.json"
DEFAULT_MATRIX = ROOT / "CURRICULUM.md"

WORD_RE = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9_+.#/'-]*", re.UNICODE)
CODE_BLOCK_RE = re.compile(r"```.*?```|~~~.*?~~~", re.DOTALL)

DIMENSIONS: dict[str, tuple[str, ...]] = {
    "problem": (
        r"\bproblema\b", r"\bobjetivo\b", r"\bpor que\b", r"\bquando usar\b",
        r"\bquando utilizar\b", r"\bquando evitar\b", r"\benquadr",
    ),
    "mental-model": (
        r"modelo mental", r"como funciona", r"arquitetura", r"fluxo",
        r"pipeline", r"caminho da requisi", r"lifecycle",
    ),
    "mechanics": (
        r"internals?", r"mecanismo", r"runtime", r"implementa", r"algoritmo",
        r"scheduler", r"replica", r"protocolo", r"execu", r"por dentro",
    ),
    "guarantees": (
        r"garantia", r"sem[aâ]ntica", r"consist", r"atomic", r"durabil",
        r"ordering", r"isolamento", r"limite", r"n[aã]o garante",
    ),
    "trade-offs": (
        r"trade-?offs?", r"compar", r"alternativ", r"quando evitar",
        r"custo", r"vantag", r"desvantag", r"decis",
    ),
    "failures": (
        r"falha", r"failure", r"incidente", r"troubleshoot", r"anti-?pattern",
        r"degrada", r"timeout", r"deadlock", r"recovery", r"recupera",
    ),
    "performance": (
        r"performance", r"lat[eê]ncia", r"throughput", r"capacidade",
        r"benchmark", r"cardinalidade", r"complexidade", r"mem[oó]ria",
        r"custo operacional", r"profil",
    ),
    "security": (
        r"seguran", r"security", r"threat", r"autentica", r"autoriza",
        r"secret", r"least privilege", r"rbac", r"csrf", r"xss", r"injection",
    ),
    "testing": (
        r"\bteste", r"testing", r"testes", r"fault injection",
        r"chaos", r"valida", r"contrato", r"regress",
    ),
    "observability": (
        r"observab", r"m[eé]trica", r"traces?", r"\blogs\b", r"monitor",
        r"telemetria", r"slo", r"alert", r"dashboard",
    ),
    "practice": (
        r"exerc[ií]cio", r"laborat[oó]rio", r"\blab\b", r"projeto",
        r"experimento", r"pr[aá]tica", r"reproduz", r"hands-?on",
    ),
    "references": (
        r"##+ refer", r"documenta[cç][aã]o oficial", r"papers?", r"rfcs?",
        r"https?://",
    ),
}

PROFILES: dict[str, tuple[str, ...]] = {
    "foundation": (
        "problem", "mental-model", "mechanics", "guarantees",
        "trade-offs", "practice", "references",
    ),
    "concept": (
        "problem", "mental-model", "mechanics", "guarantees",
        "trade-offs", "failures", "practice", "references",
    ),
    "implementation": (
        "problem", "mental-model", "mechanics", "guarantees",
        "trade-offs", "failures", "performance", "security",
        "testing", "observability", "practice", "references",
    ),
    "architecture": (
        "problem", "mental-model", "guarantees", "trade-offs",
        "failures", "performance", "security", "observability",
        "practice", "references",
    ),
    "operations": (
        "problem", "mental-model", "mechanics", "guarantees",
        "trade-offs", "failures", "performance", "security",
        "testing", "observability", "practice", "references",
    ),
    "comparison": (
        "problem", "guarantees", "trade-offs", "failures",
        "performance", "security", "references",
    ),
}

STATUS_RANK = {"shallow": 0, "developing": 1, "consolidated": 2}
STATUS_LABEL = {
    "shallow": "🔴 raso",
    "developing": "🟡 em expansão",
    "consolidated": "🟢 consolidado",
}


@dataclass(frozen=True)
class Finding:
    topic_id: str
    title: str
    path: str
    domain: str
    level: str
    profile: str
    words: int
    found: tuple[str, ...]
    missing: tuple[str, ...]
    coverage: float
    min_words: int
    min_coverage: float
    status: str


class CatalogError(ValueError):
    """Raised when curriculum metadata is structurally invalid."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate graph/files and return non-zero only for structural errors",
    )
    parser.add_argument(
        "--fail-on-shallow",
        action="store_true",
        help="also fail when at least one canonical topic is classified as shallow",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="write the depth-audit Markdown report to this path",
    )
    parser.add_argument(
        "--verify-matrix",
        type=Path,
        help="verify that the curriculum matrix matches the catalog",
    )
    return parser.parse_args()


def load_catalog(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise CatalogError(f"catálogo não encontrado: {path}") from exc
    except json.JSONDecodeError as exc:
        raise CatalogError(f"JSON inválido em {path}: {exc}") from exc


def validate_catalog(catalog: dict, root: Path) -> list[str]:
    errors: list[str] = []
    levels = catalog.get("levels", {})
    tracks = catalog.get("tracks", {})
    topics = catalog.get("topics", [])

    if catalog.get("version") != 1:
        errors.append("catalog.version precisa ser 1")
    if not isinstance(levels, dict) or not levels:
        errors.append("catalog.levels precisa ser um objeto não vazio")
    if not isinstance(tracks, dict) or not tracks:
        errors.append("catalog.tracks precisa ser um objeto não vazio")
    if not isinstance(topics, list) or not topics:
        errors.append("catalog.topics precisa ser uma lista não vazia")
        return errors

    level_order: dict[str, int] = {}
    for level_id, data in levels.items():
        try:
            level_order[level_id] = int(data["order"])
            int(data["min_words"])
            coverage = float(data["min_coverage"])
            if not 0 < coverage <= 1:
                errors.append(f"level {level_id}: min_coverage deve estar entre 0 e 1")
        except (KeyError, TypeError, ValueError):
            errors.append(
                f"level {level_id}: requer order, min_words e min_coverage válidos"
            )

    ids: dict[str, dict] = {}
    paths: set[str] = set()
    for topic in topics:
        topic_id = topic.get("id")
        path = topic.get("path")
        if not topic_id or not isinstance(topic_id, str):
            errors.append("todo tópico precisa de id string")
            continue
        if topic_id in ids:
            errors.append(f"id duplicado: {topic_id}")
        ids[topic_id] = topic

        if not path or not isinstance(path, str):
            errors.append(f"{topic_id}: path ausente")
        elif path in paths:
            errors.append(f"path canônico duplicado: {path}")
        else:
            paths.add(path)
            if not (root / path).is_file():
                errors.append(f"{topic_id}: arquivo não existe: {path}")

        level = topic.get("level")
        if level not in levels:
            errors.append(f"{topic_id}: level desconhecido: {level}")

        profile = topic.get("profile")
        if profile not in PROFILES:
            errors.append(f"{topic_id}: profile desconhecido: {profile}")

        for track in topic.get("tracks", []):
            if track not in tracks:
                errors.append(f"{topic_id}: track desconhecida: {track}")

    for topic_id, topic in ids.items():
        level = topic.get("level")
        for prerequisite in topic.get("prerequisites", []):
            if prerequisite not in ids:
                errors.append(f"{topic_id}: prerequisite inexistente: {prerequisite}")
                continue
            if prerequisite == topic_id:
                errors.append(f"{topic_id}: não pode depender de si mesmo")
            if level in level_order:
                prereq_level = ids[prerequisite].get("level")
                if prereq_level in level_order and level_order[prereq_level] > level_order[level]:
                    errors.append(
                        f"{topic_id}: pré-requisito {prerequisite} tem nível superior "
                        f"({prereq_level} > {level})"
                    )

    errors.extend(find_cycles(ids))

    required_levels = set(levels)
    for track_id in tracks:
        present = {
            topic["level"]
            for topic in topics
            if track_id in topic.get("tracks", []) and topic.get("level") in levels
        }
        missing = required_levels - present
        if missing:
            errors.append(
                f"track {track_id}: não cobre todos os níveis; faltam "
                + ", ".join(sorted(missing, key=lambda x: level_order.get(x, 99)))
            )

    return errors


def find_cycles(ids: dict[str, dict]) -> list[str]:
    state: dict[str, int] = {}
    stack: list[str] = []
    errors: list[str] = []

    def visit(topic_id: str) -> None:
        current = state.get(topic_id, 0)
        if current == 1:
            try:
                start = stack.index(topic_id)
            except ValueError:
                start = 0
            cycle = stack[start:] + [topic_id]
            errors.append("ciclo de pré-requisitos: " + " → ".join(cycle))
            return
        if current == 2:
            return

        state[topic_id] = 1
        stack.append(topic_id)
        for prerequisite in ids[topic_id].get("prerequisites", []):
            if prerequisite in ids:
                visit(prerequisite)
        stack.pop()
        state[topic_id] = 2

    for topic_id in ids:
        visit(topic_id)
    return errors


def normalized_text(text: str) -> str:
    without_code = CODE_BLOCK_RE.sub(" ", text)
    return without_code.casefold()


def word_count(text: str) -> int:
    return len(WORD_RE.findall(CODE_BLOCK_RE.sub(" ", text)))


def dimension_matches(text: str, dimension: str) -> bool:
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in DIMENSIONS[dimension])


def classify(
    *,
    words: int,
    coverage: float,
    min_words: int,
    min_coverage: float,
) -> str:
    if words >= min_words and coverage >= min_coverage:
        return "consolidated"
    if words >= int(min_words * 0.65) and coverage >= max(0.40, min_coverage - 0.18):
        return "developing"
    return "shallow"


def audit(catalog: dict, root: Path) -> list[Finding]:
    findings: list[Finding] = []
    for topic in catalog["topics"]:
        level = topic["level"]
        level_cfg = catalog["levels"][level]
        path = root / topic["path"]
        text = path.read_text(encoding="utf-8")
        normalized = normalized_text(text)
        profile = topic["profile"]
        expected = PROFILES[profile]
        found = tuple(
            dimension for dimension in expected if dimension_matches(normalized, dimension)
        )
        missing = tuple(dimension for dimension in expected if dimension not in found)
        coverage = len(found) / len(expected) if expected else 1.0
        min_words = int(level_cfg["min_words"])
        min_coverage = float(level_cfg["min_coverage"])
        status = classify(
            words=word_count(text),
            coverage=coverage,
            min_words=min_words,
            min_coverage=min_coverage,
        )
        findings.append(
            Finding(
                topic_id=topic["id"],
                title=topic["title"],
                path=topic["path"],
                domain=topic["domain"],
                level=level,
                profile=profile,
                words=word_count(text),
                found=found,
                missing=missing,
                coverage=coverage,
                min_words=min_words,
                min_coverage=min_coverage,
                status=status,
            )
        )
    return findings


def render_matrix(catalog: dict) -> str:
    topics = catalog["topics"]
    levels = catalog["levels"]
    by_id = {topic["id"]: topic for topic in topics}

    lines = [
        "# Matriz curricular",
        "",
        "Esta é a visão canônica de **nível, pré-requisitos e trilhas** da Alexandria.",
        "O nível descreve a capacidade esperada ao concluir o assunto, não senioridade",
        "profissional nem uma promessa de expertise obtida apenas por leitura.",
        "",
        "## Níveis",
        "",
        "| Nível | Capacidade esperada |",
        "| --- | --- |",
    ]
    for _, cfg in sorted(levels.items(), key=lambda item: int(item[1]["order"])):
        lines.append(f"| **{cfg['label']}** | {cfg['capability']} |")

    lines.extend(
        [
            "",
            "## Regra de progressão",
            "",
            "Uma página não é concluída só porque foi lida. A progressão esperada é:",
            "",
            "`compreender → reproduzir → construir → quebrar → observar → recuperar → decidir`",
            "",
            "O [auditor de currículo](scripts/audit_curriculum.py) usa sinais editoriais",
            "para apontar páginas que ainda parecem rasas para o nível declarado. O resultado",
            "é uma fila de revisão, não uma nota sobre o leitor.",
            "",
            "## Assuntos canônicos",
            "",
        ]
    )

    domains: list[str] = []
    for topic in topics:
        if topic["domain"] not in domains:
            domains.append(topic["domain"])

    for domain in domains:
        lines.extend(
            [
                f"### {domain}",
                "",
                "| Assunto | Nível | Pré-requisitos | Trilhas |",
                "| --- | --- | --- | --- |",
            ]
        )
        for topic in topics:
            if topic["domain"] != domain:
                continue
            prereq_links = []
            for prereq_id in topic["prerequisites"]:
                prereq = by_id[prereq_id]
                prereq_links.append(f"[{prereq['title']}]({prereq['path']})")
            prereqs = ", ".join(prereq_links) if prereq_links else "Nenhum"
            track_labels = [
                catalog["tracks"][track]["label"] for track in topic.get("tracks", [])
            ]
            lines.append(
                f"| [{topic['title']}]({topic['path']}) | "
                f"{levels[topic['level']]['label']} | {prereqs} | "
                f"{', '.join(track_labels)} |"
            )
        lines.append("")

    lines.extend(
        [
            "## Como usar esta matriz",
            "",
            "1. Escolha uma trilha no [Atlas](atlas/README.md).",
            "2. Faça o diagnóstico de entrada da trilha.",
            "3. Use esta matriz para resolver pré-requisitos antes de saltar para tópicos avançados.",
            "4. Execute exercícios e projetos do nível correspondente.",
            "5. Consulte a auditoria do CI para localizar conteúdo que ainda precisa de aprofundamento.",
            "",
            "A fonte estruturada desta matriz é [`curriculum/catalog.json`](curriculum/catalog.json).",
            "Mudanças manuais neste arquivo são detectadas pelo CI para evitar drift.",
            "",
            "---",
            "",
            "[← Início](README.md) · [↑ Atlas](atlas/README.md) · [Pinakes →](PINAKES.md)",
            "",
        ]
    )
    return "\n".join(lines)


def render_audit(catalog: dict, findings: Iterable[Finding]) -> str:
    findings = list(findings)
    levels = catalog["levels"]
    ordered_levels = sorted(levels, key=lambda key: int(levels[key]["order"]))

    totals = {status: sum(1 for item in findings if item.status == status) for status in STATUS_RANK}
    lines = [
        "# Auditoria de profundidade curricular",
        "",
        "> Heurística editorial: identifica candidatos a revisão. Não substitui revisão",
        "> factual, execução dos laboratórios nem avaliação humana da aprendizagem.",
        "",
        "## Resumo",
        "",
        f"- Tópicos canônicos auditados: **{len(findings)}**",
        f"- 🟢 consolidados: **{totals['consolidated']}**",
        f"- 🟡 em expansão: **{totals['developing']}**",
        f"- 🔴 rasos para o nível declarado: **{totals['shallow']}**",
        "",
        "## Cobertura por nível",
        "",
        "| Nível | Tópicos | Consolidados | Em expansão | Rasos |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for level in ordered_levels:
        items = [item for item in findings if item.level == level]
        lines.append(
            f"| {levels[level]['label']} | {len(items)} | "
            f"{sum(item.status == 'consolidated' for item in items)} | "
            f"{sum(item.status == 'developing' for item in items)} | "
            f"{sum(item.status == 'shallow' for item in items)} |"
        )

    needs_work = sorted(
        (item for item in findings if item.status != "consolidated"),
        key=lambda item: (STATUS_RANK[item.status], item.coverage, item.words, item.path),
    )
    lines.extend(
        [
            "",
            "## Fila editorial",
            "",
            "| Status | Assunto | Nível | Palavras | Cobertura | Dimensões ausentes |",
            "| --- | --- | --- | ---: | ---: | --- |",
        ]
    )
    if not needs_work:
        lines.append("| 🟢 | Nenhuma lacuna heurística detectada | — | — | — | — |")
    else:
        for item in needs_work:
            missing = ", ".join(item.missing) if item.missing else "volume abaixo do esperado"
            lines.append(
                f"| {STATUS_LABEL[item.status]} | [{item.title}]({item.path}) | "
                f"{levels[item.level]['label']} | {item.words} | "
                f"{item.coverage:.0%} | {missing} |"
            )

    lines.extend(
        [
            "",
            "## Critério",
            "",
            "A auditoria combina duas coisas:",
            "",
            "1. **volume mínimo proporcional ao nível**, apenas como proteção contra páginas",
            "   que ainda são resumos;",
            "2. **cobertura de dimensões editoriais** adequadas ao perfil do tema, como",
            "   mecanismo, garantias, trade-offs, falhas, performance, segurança, testes,",
            "   observabilidade, prática e referências.",
            "",
            "Uma página curta pode estar correta quando é índice. Ela só entra nesta auditoria",
            "se estiver cadastrada como assunto canônico em `curriculum/catalog.json`.",
            "",
        ]
    )
    return "\n".join(lines)


def verify_matrix(catalog: dict, path: Path) -> list[str]:
    expected = render_matrix(catalog)
    if not path.is_file():
        return [f"matriz curricular não encontrada: {path}"]
    actual = path.read_text(encoding="utf-8")
    if actual != expected:
        return [
            f"{path} está fora de sincronia com curriculum/catalog.json; "
            "regenere a matriz com scripts/audit_curriculum.py"
        ]
    return []


def emit_report(report: str, output: Path | None) -> None:
    print(report)
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(report, encoding="utf-8")
    step_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        with Path(step_summary).open("a", encoding="utf-8") as handle:
            handle.write(report)
            handle.write("\n")


def main() -> int:
    args = parse_args()
    try:
        catalog = load_catalog(args.catalog)
    except CatalogError as exc:
        print(f"Erro de currículo: {exc}", file=sys.stderr)
        return 2

    errors = validate_catalog(catalog, args.root)
    if args.verify_matrix:
        errors.extend(verify_matrix(catalog, args.verify_matrix))
    if errors:
        print("Currículo inválido:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 2

    findings = audit(catalog, args.root)
    report = render_audit(catalog, findings)
    emit_report(report, args.output)

    shallow = [finding for finding in findings if finding.status == "shallow"]
    if args.fail_on_shallow and shallow:
        print(
            f"Falha editorial: {len(shallow)} tópico(s) ainda rasos para o nível declarado.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
