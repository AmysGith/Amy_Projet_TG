# DB_Access/db_access.py

from Model.model import Sommet, Arete, Contrainte
import psycopg2

class DBAccess:
    def __init__(self, host, database, user, password):
        try:
            self.__conn = psycopg2.connect(
                host=host,
                database=database,
                user=user,
                password=password
            )
            self.__cursor = self.__conn.cursor()

        except Exception as e:
            print("Erreur de connexion :", e)
            self.__conn = None
            self.__cursor = None

    def fetch_sommets(self):
        if self.__cursor:
            self.__cursor.execute("SELECT IdSommet, NomSommet FROM Sommet;")
            return [Sommet(id_s, nom) for id_s, nom in self.__cursor.fetchall()]
        return []

    def fetch_aretes(self):
        if self.__cursor:
            self.__cursor.execute("SELECT IdArete, Distance, ptD, ptA FROM Arete;")
            return [Arete(id_a, dist, ptD, ptA) for id_a, dist, ptD, ptA in self.__cursor.fetchall()]
        return []

    def fetch_contraintes(self):
        if self.__cursor:
            self.__cursor.execute("SELECT IdContrainte, Value FROM Contrainte;")
            return [Contrainte(id_c, val) for id_c, val in self.__cursor.fetchall()]
        return []

    def close(self):
        if self.__cursor:
            self.__cursor.close()
        if self.__conn:
            self.__conn.close()



if __name__ == "__main__":
    db = DBAccess(host="localhost", database="TG_Amy", user="postgres", password="EUs4BN%K6cPM")

    if db._DBAccess__conn:  
        print("Connexion réussie")
    else:
        print("La connexion a échoué")

    db.close()
