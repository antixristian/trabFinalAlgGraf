from fastapi import APIRouter
from pydantic import BaseModel
import app.database.connection as db

router = APIRouter()

class Node(BaseModel):
    id: int
    name: str
    x: float
    y: float

class Edge(BaseModel):
    id: int
    from_node: int
    to_node: int
    weight: float

class Job(BaseModel):
    id: int
    type: str
    node_id: int

class Precedence(BaseModel):
    job_before: int
    job_after: int

class Dataset(BaseModel):
    nodes: list[Node]
    edges: list[Edge]
    jobs: list[Job]
    precedences: list[Precedence]


@router.post("/upload_dataset")
def upload_dataset(data: Dataset):
    conn = db.get_connection()
    cur = conn.cursor()

    # limpar tabelas
    cur.execute("DELETE FROM precedences")
    cur.execute("DELETE FROM jobs")
    cur.execute("DELETE FROM edges")
    cur.execute("DELETE FROM nodes")

    # inserir nodes
    for n in data.nodes:
        cur.execute(
            "INSERT INTO nodes (id, name, x, y) VALUES (?, ?, ?, ?)",
            (n.id, n.name, n.x, n.y)
        )

    # inserir edges
    for e in data.edges:
        cur.execute(
            "INSERT INTO edges (id, from_node, to_node, weight) VALUES (?, ?, ?, ?)",
            (e.id, e.from_node, e.to_node, e.weight)
        )

    # inserir jobs
    for j in data.jobs:
        cur.execute(
            "INSERT INTO jobs (id, type, node_id) VALUES (?, ?, ?)",
            (j.id, j.type, j.node_id)
        )

    # inserir precedences
    for p in data.precedences:
        cur.execute(
            "INSERT INTO precedences (job_before, job_after) VALUES (?, ?)",
            (p.job_before, p.job_after)
        )

    conn.commit()
    conn.close()

    return {"message": "Dataset inserido com sucesso!"}
