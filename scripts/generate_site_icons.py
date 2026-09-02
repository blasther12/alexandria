from pathlib import Path
import cairosvg

root = Path(__file__).resolve().parents[1]
source = root / 'docs/icons/alexandria-mark.svg'
for filename, size in [
    ('icon-32.png', 32),
    ('apple-touch-icon.png', 180),
    ('icon-192.png', 192),
    ('icon-512.png', 512),
]:
    target = root / 'docs/icons' / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(url=str(source), write_to=str(target), output_width=size, output_height=size)
    print(f'generated {target.name} ({size}x{size})')