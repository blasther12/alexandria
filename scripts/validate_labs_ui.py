import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
labs_data = json.loads((root / 'docs/labs.json').read_text(encoding='utf-8'))
main_data = json.loads((root / 'docs/data.json').read_text(encoding='utf-8'))
index = (root / 'docs/index.html').read_text(encoding='utf-8')
js = (root / 'docs/assets/labs-tools.js').read_text(encoding='utf-8')
css = (root / 'docs/assets/labs-tools.css').read_text(encoding='utf-8')
errors = []

theme_ids = {theme['id'] for theme in main_data.get('themes', [])}
labs = labs_data.get('labs', [])
if len(labs) < 6:
    errors.append(f'esperados pelo menos 6 labs reproduzíveis, encontrados {len(labs)}')

ids = set()
for lab in labs:
    lid = lab.get('id')
    if not lid or lid in ids:
        errors.append(f'lab com id ausente/duplicado: {lid}')
    ids.add(lid)
    if lab.get('theme') not in theme_ids:
        errors.append(f'{lid}: tema inexistente {lab.get("theme")}')
    if len(lab.get('summary', '')) < 70:
        errors.append(f'{lid}: resumo superficial')
    href = lab.get('href', '')
    if not href.startswith('https://github.com/blasther12/alexandria/tree/main/labs/'):
        errors.append(f'{lid}: href não aponta para lab versionado')
    readme = root / 'labs' / lid / 'README.md'
    if not readme.exists() or readme.stat().st_size < 700:
        errors.append(f'{lid}: README de lab ausente ou superficial')

for marker in ('Laboratórios reproduzíveis', 'Faça funcionar. Quebre de propósito. Recupere com evidência.', 'data-theme-labs', "#/labs"):
    if marker not in js:
        errors.append(f'labs-tools.js incompleto: {marker}')

for marker in ('.labs-grid', '.lab-card', '.lab-callout'):
    if marker not in css:
        errors.append(f'labs-tools.css incompleto: {marker}')

for asset in ('./assets/labs-tools.js', './assets/labs-tools.css'):
    if asset not in index:
        errors.append(f'index.html não carrega {asset}')

print(f'Labs reproduzíveis publicados: {len(labs)}')
if errors:
    print('Falhas nos labs:')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)
print('Catálogo, documentação e interface de labs válidos.')
