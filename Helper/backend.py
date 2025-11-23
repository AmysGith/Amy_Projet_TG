
def Dijkstra(graph, contrainte, source):
    """
    graph : {sommet: [(voisin, distance), ...]}
    contrainte : {sommet: {voisin: valeur_contrainte}}
    source : sommet de départ
    Retourne : 
      - dist : distances minimales depuis la source
      - paths : chemins les plus courts depuis la source vers chaque sommet
    """
    dist = {node: float('inf') for node in graph}
    dist[source] = 0
    prev = {node: None for node in graph}  # pour reconstruire le chemin
    unvisited = set(graph.keys())

    while unvisited:
        # sommet non visité avec la plus petite distance
        current = min(unvisited, key=lambda node: dist[node])
        if dist[current] == float('inf'):
            break  # sommets inaccessibles
        unvisited.remove(current)

        for neighbor, weight in graph[current]:
            c = contrainte.get(current, {}).get(neighbor, 0)
            new_dist = dist[current] + weight + c
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = current

    # reconstruire les chemins
    paths = {}
    for node in graph:
        path = []
        cur = node
        if dist[cur] < float('inf'):
            while cur is not None:
                path.insert(0, cur)
                cur = prev[cur]
        paths[node] = path

    return dist, paths


def Coloriage(graph):
    degres = {node: len(graph[node]) for node in graph}
    couleurs = ["rouge", "bleu", "vert", "jaune", "violet", "orange", "rose", "cyan"]
    color_assignment = {}

    for node in sorted(graph, key=lambda x: degres[x], reverse=True):
        voisins = graph[node]
        couleurs_voisins = {color_assignment[v] for v in voisins if v in color_assignment}
        for couleur in couleurs:
            if couleur not in couleurs_voisins:
                color_assignment[node] = couleur
                break

    return color_assignment
