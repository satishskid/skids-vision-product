"""Local static server with SPA fallback: python3 scripts/serve.py."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1] / 'public'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        if not Path(self.translate_path(self.path)).is_file() and '.' not in urlparse(self.path).path:
            self.path = '/index.html'
        super().do_GET()

ThreadingHTTPServer(('127.0.0.1', 8080), Handler).serve_forever()
