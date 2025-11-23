from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse, parse_qs
from DB_Access.db_access import DBAccess
from Helper.backend import Dijkstra, Coloriage

HOST = "localhost"
PORT = 8000


db = DBAccess("localhost", "TG_Amy", "postgres", "EUs4BN%K6cPM")
sommets = db.fetch_sommets()
aretes = db.fetch_aretes()


graph_dijkstra = {s.nom_sommet: [] for s in sommets}
contrainte = {s.nom_sommet: {} for s in sommets}

for a in aretes:
    start = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptD)
    end   = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptA)

    # graphe non orienté
    graph_dijkstra[start].append((end, a.distance))
    graph_dijkstra[end].append((start, a.distance))

    contrainte[start][end] = a.contrainte
    contrainte[end][start] = a.contrainte

graph_coloring = {s.nom_sommet: set() for s in sommets}
for a in aretes:
    s1 = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptD)
    s2 = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptA)
    graph_coloring[s1].add(s2)
    graph_coloring[s2].add(s1)
graph_coloring = {k: list(v) for k,v in graph_coloring.items()}



class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == "/graph":
            #Retourner la structure complète du graphe
            nodes = [{"id": s.nom_sommet} for s in sommets]
            edges = []
            seen = set()
            
            for a in aretes:
                start = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptD)
                end = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptA)
                edge_key = tuple(sorted([start, end]))
                
                if edge_key not in seen:
                    edges.append({
                        "from": start,
                        "to": end,
                        "weight": a.distance,
                        "constraint": a.contrainte
                    })
                    seen.add(edge_key)
            
            self._set_headers()
            self.wfile.write(json.dumps({"nodes": nodes, "edges": edges}).encode())
        
        elif parsed_path.path == "/dijkstra":
            params = parse_qs(parsed_path.query)
            source = params.get("source", [sommets[0].nom_sommet])[0]
            dest   = params.get("dest", [None])[0]

            distances, chemins = Dijkstra(graph_dijkstra, contrainte, source)

            if dest is not None and dest in chemins:
                result = chemins[dest]  # chemin le moins coûteux vers la destination
            else:
                result = chemins  # sinon tous les chemins

            self._set_headers()
            self.wfile.write(json.dumps(result).encode())

        elif parsed_path.path == "/coloriage":
            colors = Coloriage(graph_coloring)
            self._set_headers()
            self.wfile.write(json.dumps(colors).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error":"Not found"}).encode())

    def do_POST(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/add_contrainte":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            data = json.loads(body)
            start = data.get("from")
            end = data.get("to")
            value = data.get("value", 0)
            source = data.get("source", sommets[0].nom_sommet)

            # Ajouter ou mettre à jour contrainte DANS LES DEUX SENS
            if start not in contrainte:
                contrainte[start] = {}
            if end not in contrainte:
                contrainte[end] = {}

            contrainte[start][end] = contrainte[start].get(end, 0) + value
            contrainte[end][start] = contrainte[end].get(start, 0) + value

            # Recalculer Dijkstra
            distances, chemins = Dijkstra(graph_dijkstra, contrainte, source)

            # On renvoie uniquement le chemin vers la destination "to"
            result = chemins[end] if end in chemins else []
            self._set_headers()
            self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


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