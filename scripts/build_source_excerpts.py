import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
data = json.loads((DOCS / "data.json").read_text(encoding="utf-8"))

STOP = {"para", "como", "entre", "sobre", "versus", "mais", "menos", "uma", "das", "dos", "que", "por", "com", "sem", "este", "esta", "isso", "sistema", "sistemas"}
LOW_VALUE_HEADINGS = re.compile(r"refer[eê]ncias|bibliografia|checklist|exerc[ií]cios|laborat[oó]rio|labs?|roadmap|projeto", re.I)


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


def sentence_chunks(text: str):
    sentences = [s.strip() for s in re.findall(r"[^.!?]+[.!?]+|[^.!?]+$", text) if s.strip()]
    if len(sentences) < 3:
        return [text]
    chunks = []
    current = []
    words = 0
    for sentence in sentences:
        count = len(sentence.split())
        if current and (len(current) >= 2 or words + count > 42):
            chunks.append(" ".join(current))
            current = []
            words = 0
        current.append(sentence)
        words += count
    if current:
        chunks.append(" ".join(current))
    return chunks


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
        if not block or block.startswith("|"):
            continue
        for chunk in sentence_chunks(block):
            if 55 <= len(chunk) <= 720:
                output.append(chunk)
    return output


def score(section, topic, theme_title, index):
    heading = normalize(section["heading"])
    body = normalize(" ".join(section["body"])[:5000])
    topic_terms = terms(topic)
    value = sum(10 for term in topic_terms if term in heading)
    value += sum(3 for term in topic_terms if term in body)
    value += sum(1 for term in terms(theme_title) if term in body)
    if re.match(rf"^{index + 1}[. ):\-]", section["heading"]):
        value += 12
    if normalize(topic) in heading or heading in normalize(topic):
        value += 14
    if LOW_VALUE_HEADINGS.search(section["heading"]):
        value -= 15
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
        items = paragraphs(best)[:5]

        if sum(len(item) for item in items) < 220:
            for candidate in ranked[1:4]:
                for item in paragraphs(candidate):
                    if item not in items:
                        items.append(item)
                    if sum(len(x) for x in items) >= 320 or len(items) >= 5:
                        break
                if sum(len(x) for x in items) >= 320 or len(items) >= 5:
                    break

        if sum(len(item) for item in items) < 180 and sections:
            for item in paragraphs(sections[0]):
                if item not in items:
                    items.append(item)
                if sum(len(x) for x in items) >= 280 or len(items) >= 5:
                    break

        result["themes"][theme["id"]].append({
            "topic": topic,
            "heading": best["heading"],
            "paragraphs": items[:5],
            "source": source,
        })

(DOCS / "source-excerpts.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
count = sum(len(items) for items in result["themes"].values())
print(f"Source excerpts generated for {count} topics across {len(result['themes'])} themes.")
