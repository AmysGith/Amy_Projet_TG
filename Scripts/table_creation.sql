DROP TABLE IF EXISTS Arete CASCADE;
DROP TABLE IF EXISTS Sommet CASCADE;

CREATE TABLE Sommet (
    IdSommet SERIAL PRIMARY KEY,
    NomSommet CHAR(1) NOT NULL
);

CREATE TABLE Arete (
    IdArete SERIAL PRIMARY KEY,
    ptD INT NOT NULL,
    ptA INT NOT NULL,
    Distance INT NOT NULL,
    Contrainte INT DEFAULT 0,
    CONSTRAINT fk_ptD FOREIGN KEY (ptD) REFERENCES Sommet(IdSommet) ON DELETE CASCADE,
    CONSTRAINT fk_ptA FOREIGN KEY (ptA) REFERENCES Sommet(IdSommet) ON DELETE CASCADE
);

INSERT INTO Sommet (NomSommet) VALUES
('A'),
('B'),
('C'),
('D');

INSERT INTO Arete (ptD, ptA, Distance, Contrainte) VALUES
(1, 2, 2, 0),
(1, 3, 5, 0),
(2, 1, 2, 0),
(2, 3, 1, 0),
(2, 4, 4, 0),
(3, 1, 5, 0),
(3, 2, 1, 0),
(3, 4, 2, 0),
(4, 2, 4, 0),
(4, 3, 2, 0);


