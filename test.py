from DB_Access.db_access import DBAccess
from Helper.backend import Dijkstra

# --- Connexion à la base ---
db = DBAccess("localhost", "TG_Amy", "postgres", "EUs4BN%K6cPM")

# --- Récupérer les données ---
sommets = db.fetch_sommets()
aretes = db.fetch_aretes()

# --- Construire le graphe pour Dijkstra ---
graph = {s.nom_sommet: [] for s in sommets}
contrainte = {s.nom_sommet: {} for s in sommets}

for a in aretes:
    start = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptD)
    end   = next(s.nom_sommet for s in sommets if s.id_sommet == a.ptA)
    graph[start].append((end, a.distance))
    contrainte[start][end] = a.contrainte

print("=== DIJKSTRA ===")
distances = Dijkstra(graph, contrainte, "A")
print(distances)

db.close()
