from pathlib import Path

root = Path(__file__).resolve().parents[1]
index = (root / 'docs/index.html').read_text(encoding='utf-8')
meta_js = (root / 'docs/assets/chapter-meta.js').read_text(encoding='utf-8')
meta_css = (root / 'docs/assets/chapter-meta.css').read_text(encoding='utf-8')
learning_js = (root / 'docs/assets/learning-tools.js').read_text(encoding='utf-8')
errors = []

for asset in ('./assets/chapter-meta.js', './assets/chapter-meta.css', './assets/learning-tools.js', './assets/learning-tools.css'):
    if asset not in index:
        errors.append(f'index.html não carrega {asset}')

for marker in ('Tempo estimado', 'Profundidade', 'Antes deste capítulo', 'prerequisites'):
    if marker not in meta_js:
        errors.append(f'chapter-meta.js incompleto: {marker}')

for marker in ('.chapter-meta', '.chapter-meta-grid', '.chapter-before'):
    if marker not in meta_css:
        errors.append(f'chapter-meta.css incompleto: {marker}')

for marker in ('Consigo explicar', 'Consigo implementar', 'Consigo diagnosticar', 'Busca global', 'Grafo de conhecimento', 'Trilhas', 'Minhas notas'):
    if marker not in learning_js:
        errors.append(f'learning-tools.js incompleto: {marker}')

if errors:
    print('Falhas na experiência de aprendizagem:')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)

print('Metadados de capítulo, busca, grafo, notas e níveis de domínio válidos.')
