CREATE TABLE nodes (
    id INTEGER PRIMARY KEY,
    name TEXT,
    -- coordenadas
    x REAL,
    y REAL
);

CREATE TABLE edges (
    id INTEGER PRIMARY KEY,
    from_node INTEGER NOT NULL,
    to_node INTEGER NOT NULL,
    weight REAL NOT NULL,
    FOREIGN KEY (from_node) REFERENCES nodes(id),
    FOREIGN KEY (to_node) REFERENCES nodes(id)
);
-- tabela para retiradas ou entregras pickup e dropoff
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY,
    type TEXT CHECK(type IN ('pickup', 'dropoff')),
    node_id INTEGER NOT NULL,
    FOREIGN KEY (node_id) REFERENCES nodes(id)
);

--precendencias, o job a deve ocorrer antes do job b
CREATE TABLE precedences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_before INTEGER NOT NULL,
    job_after  INTEGER NOT NULL,
    FOREIGN KEY (job_before) REFERENCES jobs(id),
    FOREIGN KEY (job_after)  REFERENCES jobs(id)
);
