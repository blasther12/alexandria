import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'docs/data.json').read_text(encoding='utf-8'))
app_js = (root / 'docs/assets/app.js').read_text(encoding='utf-8')
chapters_js = (root / 'docs/assets/chapters-v2.js').read_text(encoding='utf-8')
chapters_css = (root / 'docs/assets/chapters.css').read_text(encoding='utf-8')
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
    if not theme.get('source'):
        errors.append(f'{tid}: sem Codex fonte')

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

if './assets/chapters-v2.js' not in index_html or './assets/chapters.css' not in index_html:
    errors.append('index.html não carrega o motor/estilo de capítulos')

print(f'Temas: {len(themes)}')
print(f'Tópicos de aprofundamento: {focus_total}')
print(f'Laboratórios: {sum(len(t.get("labs", [])) for t in themes)}')
print(f'Guias expansíveis por tópico: {focus_total}')
print(f'Capítulos completos disponíveis: {focus_total}')
print(f'Aprofundamentos técnicos específicos: {chapters_js.count("match: /")}')

if errors:
    print('\nFalhas de profundidade/estrutura:')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)

print('Mapa temático, guias e capítulos profundos válidos.')
