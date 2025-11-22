class Sommet:
    def __init__(self, id_sommet=None, nom_sommet=None):
        self.__id_sommet = id_sommet
        self.__nom_sommet = nom_sommet

    @property
    def id_sommet(self):
        return self.__id_sommet

    @id_sommet.setter
    def id_sommet(self, value):
        self.__id_sommet = value

    @property
    def nom_sommet(self):
        return self.__nom_sommet

    @nom_sommet.setter
    def nom_sommet(self, value):
        self.__nom_sommet = value


class Arete:
    def __init__(self, id_arete=None, distance=None, ptD=None, ptA=None):
        self.__id_arete = id_arete
        self.__distance = distance
        self.__ptD = ptD
        self.__ptA = ptA

    @property
    def id_arete(self):
        return self.__id_arete

    @id_arete.setter
    def id_arete(self, value):
        self.__id_arete = value

    @property
    def distance(self):
        return self.__distance

    @distance.setter
    def distance(self, value):
        self.__distance = value

    @property
    def ptD(self):
        return self.__ptD

    @ptD.setter
    def ptD(self, value):
        self.__ptD = value

    @property
    def ptA(self):
        return self.__ptA

    @ptA.setter
    def ptA(self, value):
        self.__ptA = value


class Contrainte:
    def __init__(self, id_contrainte=None, value=None):
        self.__id_contrainte = id_contrainte
        self.__value = value

    @property
    def id_contrainte(self):
        return self.__id_contrainte

    @id_contrainte.setter
    def id_contrainte(self, value):
        self.__id_contrainte = value

    @property
    def value(self):
        return self.__value

    @value.setter
    def value(self, value):
        self.__value = value
