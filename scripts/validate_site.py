import json
from datetime import date, datetime
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'docs/data.json').read_text(encoding='utf-8'))
learning = json.loads((root / 'docs/learning-map.json').read_text(encoding='utf-8'))
app_js = (root / 'docs/assets/app.js').read_text(encoding='utf-8')
chapters_js = (root / 'docs/assets/chapters-v2.js').read_text(encoding='utf-8')
learning_js = (root / 'docs/assets/learning-tools.js').read_text(encoding='utf-8')
chapters_css = (root / 'docs/assets/chapters.css').read_text(encoding='utf-8')
learning_css = (root / 'docs/assets/learning-tools.css').read_text(encoding='utf-8')
index_html = (root / 'docs/index.html').read_text(encoding='utf-8')
errors = []
themes = data.get('themes', [])

if len(themes) < 15:
    errors.append(f'esperados pelo menos 15 temas, encontrados {len(themes)}')

ids = set()
focus_total = 0
for theme in themes:
    tid = theme.get('id')
    if not tid:
        errors.append('tema sem id')
        continue
    if tid in ids:
        errors.append(f'id duplicado: {tid}')
    ids.add(tid)

    for field in ('focus', 'decisions', 'labs', 'references'):
        if not isinstance(theme.get(field), list):
            errors.append(f'{tid}: {field} precisa ser uma lista')
    if 'tags' in theme and not isinstance(theme.get('tags'), list):
        errors.append(f'{tid}: tags precisa ser uma lista quando informado')

    if len(theme.get('summary', '')) < 70:
        errors.append(f'{tid}: resumo superficial')
    focus = theme.get('focus', [])
    focus_total += len(focus)
    if len(focus) < 8:
        errors.append(f'{tid}: menos de 8 tópicos de aprofundamento')
    for idx, topic in enumerate(focus):
        if not isinstance(topic, str) or len(topic.strip()) < 8:
            errors.append(f'{tid}: tópico {idx + 1} inválido ou superficial')
    if len(theme.get('decisions', [])) < 4:
        errors.append(f'{tid}: menos de 4 decisões/trade-offs')
    if len(theme.get('labs', [])) < 4:
        errors.append(f'{tid}: menos de 4 laboratórios')
    if len(theme.get('references', [])) < 4:
        errors.append(f'{tid}: menos de 4 referências')
    source = theme.get('source')
    if not source:
        errors.append(f'{tid}: sem Codex fonte')
    elif not (root / source).exists():
        errors.append(f'{tid}: Codex fonte não existe: {source}')

method = data.get('meta', {}).get('method', [])
if not isinstance(method, list) or len(method) < 4:
    errors.append('meta.method precisa conter pelo menos quatro etapas')

for marker in ('function topicGuide(', 'function topicDetailsHtml(', 'data-topic-toggle=', 'STUDY_LENSES', 'TOPIC_HINTS'):
    if marker not in app_js:
        errors.append(f'camada de profundidade ausente no app.js: {marker}')

chapter_markers = (
    'function chapterHtml(',
    'function renderChapter(',
    'function decorate(',
    'Prática progressiva',
    'Failure modes',
    'Perguntas de domínio',
    'chapterDone',
    '#/chapter/'
)
for marker in chapter_markers:
    if marker not in chapters_js:
        errors.append(f'capítulo profundo incompleto: {marker}')

if chapters_js.count('match: /') < 15:
    errors.append('esperados pelo menos 15 aprofundamentos técnicos específicos no motor de capítulos')

for marker in ('.chapter-layout', '.chapter-diagram', '.chapter-code', '.exercise-grid', '.chapter-pager'):
    if marker not in chapters_css:
        errors.append(f'estilo de capítulo ausente: {marker}')

# Learning graph, tracks and editorial metadata.
tracks = learning.get('tracks', [])
if len(tracks) < 5:
    errors.append('esperadas pelo menos cinco trilhas de estudo')
for track in tracks:
    if len(track.get('themes', [])) < 5:
        errors.append(f'trilha {track.get("id")}: curta demais')
    unknown = set(track.get('themes', [])) - ids
    if unknown:
        errors.append(f'trilha {track.get("id")}: temas inexistentes {sorted(unknown)}')

for relation_name in ('prerequisites', 'related'):
    relations = learning.get(relation_name, {})
    for source_id, targets in relations.items():
        if source_id not in ids:
            errors.append(f'{relation_name}: origem inexistente {source_id}')
        for target in targets:
            if target not in ids:
                errors.append(f'{relation_name}: destino inexistente {target}')
            if target == source_id:
                errors.append(f'{relation_name}: auto-relação em {source_id}')

editorial = learning.get('editorial', {})
for tid in ids:
    meta = editorial.get(tid)
    if not meta:
        errors.append(f'{tid}: sem metadados editoriais')
        continue
    if meta.get('status') not in {'draft', 'reviewed', 'verified'}:
        errors.append(f'{tid}: status editorial inválido')
    try:
        reviewed = datetime.strptime(meta['lastReviewed'], '%Y-%m-%d').date()
        cadence = int(meta.get('reviewEveryDays', 0))
        if cadence <= 0:
            errors.append(f'{tid}: reviewEveryDays inválido')
        if (date.today() - reviewed).days > cadence:
            errors.append(f'{tid}: revisão editorial vencida em {meta["lastReviewed"]}')
    except Exception:
        errors.append(f'{tid}: lastReviewed inválido')

learning_markers = (
    'Trilhas', 'Grafo de conhecimento', 'Busca global', 'Minhas notas',
    'Consigo explicar', 'Consigo implementar', 'Consigo diagnosticar',
    'mermaid.esm.min.mjs', 'referenceLinks'
)
for marker in learning_markers:
    if marker not in learning_js:
        errors.append(f'learning-tools.js incompleto: {marker}')

for marker in ('.track-grid', '.graph-node', '.global-search-results', '.mastery-grid', '.mermaid-host'):
    if marker not in learning_css:
        errors.append(f'estilo de aprendizagem ausente: {marker}')

required_labs = [
    'labs/postgres-write-skew/README.md',
    'labs/kafka-idempotency/README.md',
    'labs/kubernetes-probes/README.md',
    'labs/otel-pipeline/README.md',
    'labs/rag-eval/README.md',
    'labs/agent-circuit-breaker/README.md',
]
for lab in required_labs:
    path = root / lab
    if not path.exists() or path.stat().st_size < 700:
        errors.append(f'laboratório ausente ou superficial: {lab}')

for asset in ('./assets/chapters-v2.js', './assets/chapters.css', './assets/learning-tools.js', './assets/learning-tools.css'):
    if asset not in index_html:
        errors.append(f'index.html não carrega {asset}')

print(f'Temas: {len(themes)}')
print(f'Tópicos de aprofundamento: {focus_total}')
print(f'Laboratórios sugeridos no catálogo: {sum(len(t.get("labs", [])) for t in themes)}')
print(f'Capítulos completos disponíveis: {focus_total}')
print(f'Aprofundamentos técnicos específicos: {chapters_js.count("match: /")}')
print(f'Trilhas: {len(tracks)}')
print(f'Labs reproduzíveis versionados: {len(required_labs)}')
print(f'Temas com metadados editoriais: {len(editorial)}')

if errors:
    print('\nFalhas de profundidade/estrutura:')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)

print('Mapa temático, grafo, trilhas, capítulos, labs e auditoria editorial válidos.')
