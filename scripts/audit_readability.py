import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

data = json.loads((DOCS / "data.json").read_text(encoding="utf-8"))
guides = json.loads((DOCS / "theme-guides.json").read_text(encoding="utf-8"))
excerpts = json.loads((DOCS / "source-excerpts.json").read_text(encoding="utf-8"))

errors = []
warnings = []
paragraphs = 0
long_sentences = 0
dense_paragraphs = 0
excerpt_count = 0

def sentence_parts(text):
    return [p.strip() for p in re.findall(r"[^.!?]+[.!?]+|[^.!?]+$", str(text)) if p.strip()]

def word_count(text):
    return len(str(text).split())

ids = set()
for theme in data.get("themes", []):
    theme_id = theme.get("id")
    if not theme_id or theme_id in ids:
        errors.append(f"tema ausente/duplicado: {theme_id}")
    ids.add(theme_id)

    guide = guides.get(theme_id)
    if not guide:
        errors.append(f"{theme_id}: sem theme-guides.json")
    else:
        if len(str(guide.get("plain", ""))) < 120:
            errors.append(f"{theme_id}: explicação inicial curta demais")
        if len(guide.get("questions", [])) < 3:
            errors.append(f"{theme_id}: menos de 3 perguntas orientadoras")
        if len(guide.get("watch", [])) < 3:
            errors.append(f"{theme_id}: menos de 3 alertas de leitura")
        if len(guide.get("start", [])) < 3:
            errors.append(f"{theme_id}: ordem inicial superficial")

    source = ROOT / theme.get("source", "")
    if not source.exists():
        errors.append(f"{theme_id}: Codex fonte inexistente: {theme.get('source')}")

    items = excerpts.get("themes", {}).get(theme_id, [])
    if len(items) != len(theme.get("focus", [])):
        errors.append(f"{theme_id}: {len(items)} excerpts para {len(theme.get('focus', []))} tópicos")

    for index, topic in enumerate(theme.get("focus", [])):
        excerpt_count += 1
        entry = items[index] if index < len(items) else {}
        ps = entry.get("paragraphs", [])
        total = sum(len(str(p)) for p in ps)
        if total < 180:
            errors.append(f"{theme_id}/{index}: explicação Codex curta para {topic}")
        for paragraph in ps:
            paragraphs += 1
            if len(str(paragraph)) > 800:
                dense_paragraphs += 1
                warnings.append(f"{theme_id}/{index}: parágrafo denso ({len(str(paragraph))} caracteres)")
            for sentence in sentence_parts(paragraph):
                wc = word_count(sentence)
                if wc > 52:
                    long_sentences += 1
                    warnings.append(f"{theme_id}/{index}: frase longa ({wc} palavras)")

print(f"Temas auditados: {len(data.get('themes', []))}")
print(f"Tópicos auditados: {excerpt_count}")
print(f"Parágrafos Codex auditados: {paragraphs}")
print(f"Parágrafos densos sinalizados: {dense_paragraphs}")
print(f"Frases longas sinalizadas: {long_sentences}")

if warnings:
    print("\nAvisos editoriais (não bloqueiam publicação):")
    for item in warnings[:30]:
        print(f"- {item}")
    if len(warnings) > 30:
        print(f"- ... e mais {len(warnings) - 30} aviso(s)")

if errors:
    print("\nFalhas editoriais:")
    for item in errors:
        print(f"- {item}")
    raise SystemExit(1)

print("\nAuditoria de legibilidade do Alexandria concluída.")
