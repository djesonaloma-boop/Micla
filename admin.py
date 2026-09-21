# MI.C.L.A — serveur Python minimal
# Le code secret est géré côté interface pour le mode statique.
# Pour une vraie sécurité de production, utiliser une authentification serveur.

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8000"))

class Handler(SimpleHTTPRequestHandler):
    pass

if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent)
    print(f"MI.C.L.A Cité de Refuge: http://localhost:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
