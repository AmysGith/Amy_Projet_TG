
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse, parse_qs
from DB_Access.db_access import DBAccess
from Helper.backend import Dijkstra, Coloriage

HOST = "localhost"
PORT = 8000

# --- Connexion à la base ---
db = DBAccess("localhost", "TG_Amy", "postgres", "EUs4BN%K6cPM")

# --- Construire graphes ---
sommets = db.fetch_sommets()
aretes = db.fetch_aretes()

# Graphe pour Dijkstra
graph_dijkstra = {s.nom_sommet: [] for s in sommets}
contrainte = {s.nom_sommet: {} for s in sommets}
for a in aretes:
    start = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptD)
    end   = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptA)
    graph_dijkstra[start].append((end, a.distance))
    contrainte[start][end] = a.contrainte

# Graphe pour Coloriage
graph_coloring = {s.nom_sommet: set() for s in sommets}
for a in aretes:
    s1 = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptD)
    s2 = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptA)
    graph_coloring[s1].add(s2)
    graph_coloring[s2].add(s1)
graph_coloring = {k: list(v) for k, v in graph_coloring.items()}


class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')  # CORS
        self.end_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/dijkstra":
            params = parse_qs(parsed_path.query)
            source = params.get("source", ["A"])[0]
            distances = Dijkstra(graph_dijkstra, contrainte, source)
            self._set_headers()
            self.wfile.write(json.dumps(distances).encode())

        elif parsed_path.path == "/coloriage":
            colors = Coloriage(graph_coloring)
            self._set_headers()
            self.wfile.write(json.dumps(colors).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())


def run():
    server = HTTPServer((HOST, PORT), RequestHandler)
    print(f"Server running on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()
    db.close()
    print("Server stopped")


if __name__ == "__main__":
    run()
