import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'docs/data.json').read_text(encoding='utf-8'))
errors = []
themes = data.get('themes', [])
if len(themes) < 15:
    errors.append(f'esperados pelo menos 15 temas, encontrados {len(themes)}')
ids = set()
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
    if len(theme.get('focus', [])) < 8:
        errors.append(f'{tid}: menos de 8 tópicos de aprofundamento')
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

print(f'Temas: {len(themes)}')
print(f'Tópicos de aprofundamento: {sum(len(t.get("focus", [])) for t in themes)}')
print(f'Laboratórios: {sum(len(t.get("labs", [])) for t in themes)}')
if errors:
    print('\nFalhas de profundidade/estrutura:')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)
print('Mapa temático, estrutura e profundidade válidos.')
