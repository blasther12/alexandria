import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
data = json.loads((DOCS / "data.json").read_text(encoding="utf-8"))

STOP = {"para", "como", "entre", "sobre", "versus", "mais", "menos", "uma", "das", "dos", "que", "por", "com", "sem", "este", "esta", "isso", "sistema", "sistemas"}


def normalize(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9áéíóúâêôãõç ]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def terms(value: str):
    return [word for word in normalize(value).split() if len(word) >= 4 and word not in STOP]


def parse_sections(markdown: str):
    sections = []
    current = {"heading": "Introdução", "body": []}
    in_code = False
    for line in markdown.splitlines():
        if line.strip().startswith("```"):
            in_code = not in_code
            current["body"].append(line)
            continue
        match = None if in_code else re.match(r"^(#{1,3})\s+(.+)$", line)
        if match:
            if current["body"] or current["heading"] != "Introdução":
                sections.append(current)
            current = {"heading": match.group(2).replace("`", ""), "body": []}
        else:
            current["body"].append(line)
    if current["body"] or current["heading"] != "Introdução":
        sections.append(current)
    return sections


def paragraphs(section):
    text = "\n".join(section["body"])
    text = re.sub(r"```[\s\S]*?```", "\n", text)
    output = []
    for block in re.split(r"\n\s*\n", text):
        block = re.sub(r"^>\s?", "", block, flags=re.M)
        block = re.sub(r"^[-*]\s+", "• ", block, flags=re.M)
        block = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", block)
        block = re.sub(r"[*_`]", "", block)
        block = re.sub(r"\s+", " ", block).strip()
        if 70 <= len(block) <= 1400 and not block.startswith("|"):
            output.append(block)
    return output


def score(section, topic, theme_title, index):
    hay = normalize(section["heading"] + " " + " ".join(section["body"])[:5000])
    value = sum(5 for term in terms(topic) if term in hay)
    value += sum(1 for term in terms(theme_title) if term in hay)
    if re.match(rf"^{index + 1}[. ):\-]", section["heading"]):
        value += 5
    return value


result = {"themes": {}}
for theme in data.get("themes", []):
    source = theme.get("source")
    if not source or not (ROOT / source).exists():
        continue
    sections = parse_sections((ROOT / source).read_text(encoding="utf-8"))
    result["themes"][theme["id"]] = []
    for index, topic in enumerate(theme.get("focus", [])):
        ranked = sorted(sections, key=lambda section: score(section, topic, theme["title"], index), reverse=True)
        best = ranked[0] if ranked else {"heading": theme["title"], "body": []}
        items = paragraphs(best)[:4]
        if sum(len(item) for item in items) < 180 and sections:
            for item in paragraphs(sections[0]):
                if item not in items:
                    items.append(item)
                if sum(len(x) for x in items) >= 300 or len(items) >= 4:
                    break
        result["themes"][theme["id"]].append({
            "topic": topic,
            "heading": best["heading"],
            "paragraphs": items[:4],
            "source": source,
        })

(DOCS / "source-excerpts.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
count = sum(len(items) for items in result["themes"].values())
print(f"Source excerpts generated for {count} topics across {len(result['themes'])} themes.")
