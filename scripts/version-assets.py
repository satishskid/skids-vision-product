"""Refresh the static script/style URLs before deployment."""
import hashlib
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
index = ROOT / 'public/index.html'
html = index.read_text()
for asset in ('css/app.css', 'js/data.js', 'js/app.js'):
    digest = hashlib.sha256((ROOT / 'public' / asset).read_bytes()).hexdigest()[:12]
    html = re.sub(r'/' + re.escape(asset) + r'(?:\?v=[a-f0-9]+)?', '/' + asset + '?v=' + digest, html)
index.write_text(html)
print('Static asset versions refreshed.')
