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

print(f'Temas: {len(themes)}')
print(f'Tópicos de aprofundamento: {sum(len(t.get("focus", [])) for t in themes)}')
print(f'Laboratórios: {sum(len(t.get("labs", [])) for t in themes)}')
if errors:
    print('\nFalhas de profundidade:')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)
print('Mapa temático e profundidade válidos.')
