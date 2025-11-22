import psycopg2
from Model.model import Sommet, Arete

class DBAccess:
    def __init__(self, host, database, user, password):
        try:
            self.conn = psycopg2.connect(
                host=host, database=database, user=user, password=password
            )
            self.cursor = self.conn.cursor()
            print("✓ Connexion réussie")
        except Exception as e:
            print(f"✗ Erreur : {e}")
            self.conn = None
            self.cursor = None

    def fetch_sommets(self):
        self.cursor.execute("SELECT IdSommet, NomSommet FROM Sommet;")
        return [Sommet(id_s, nom.strip()) for id_s, nom in self.cursor.fetchall()]

    def fetch_aretes(self):
        self.cursor.execute("SELECT IdArete, Distance, ptD, ptA, Contrainte FROM Arete;")
        return [
            Arete(id_a, dist, ptD, ptA, contrainte)
            for id_a, dist, ptD, ptA, contrainte in self.cursor.fetchall()
        ]

    def close(self):
        if self.cursor: self.cursor.close()
        if self.conn: self.conn.close()
        print("✓ Connexion fermée")
