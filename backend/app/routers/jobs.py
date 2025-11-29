from fastapi import APIRouter, HTTPException
import app.database.connection as db
from collections import deque

router = APIRouter()


def load_jobs_and_precedences():
    """
    Carrega do banco:
    - todos os ids de jobs
    - todas as precedências (job_before -> job_after)
    """
    conn = db.get_connection()
    cur = conn.cursor()

    # pega todos os jobs
    cur.execute("SELECT id FROM jobs ORDER BY id")
    job_rows = cur.fetchall()
    if not job_rows:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Nenhum job encontrado no banco. Faça upload do dataset primeiro."
        )

    jobs = [r[0] for r in job_rows]

    # pega todas as precedências
    cur.execute("SELECT job_before, job_after FROM precedences")
    prec_rows = cur.fetchall()

    conn.close()
    return jobs, prec_rows


def topological_sort(jobs: list[int], precedences: list[tuple[int, int]]):
    """
    Ordenação topológica usando algoritmo de Kahn.
    jobs: lista de ids de jobs (vértices)
    precedences: lista de pares (a, b) significando a -> b
    Retorna (has_cycle, order)
    """
    # inicializa grafo e grau de entrada
    adj: dict[int, list[int]] = {j: [] for j in jobs}
    indegree: dict[int, int] = {j: 0 for j in jobs}

    # constroi grafo de precedências
    for before, after in precedences:
        # se por algum motivo existir precedência para job que não está na tabela jobs,
        # ignoramos silenciosamente (FK deveria evitar isso, mas por segurança).
        if before not in adj or after not in adj:
            continue
        adj[before].append(after)
        indegree[after] += 1

    # fila com todos os vértices de grau de entrada 0
    q = deque([j for j in jobs if indegree[j] == 0])

    order: list[int] = []

    while q:
        u = q.popleft()
        order.append(u)

        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                q.append(v)

    # se não conseguimos ordenar todos, há ciclo
    if len(order) != len(jobs):
        return True, []  # has_cycle = True, sem ordem válida

    return False, order


@router.get("/topo")
def get_topological_order():
    """
    Retorna a ordenação topológica dos jobs com base nas precedências.
    Se houver ciclo, sinaliza has_cycle = true e não retorna ordem.
    """
    jobs, precs = load_jobs_and_precedences()
    has_cycle, order = topological_sort(jobs, precs)

    if has_cycle:
        return {
            "has_cycle": True,
            "order": [],
            "message": "Foram detectadas precedências cíclicas no grafo de jobs."
        }

    return {
        "has_cycle": False,
        "order": order
    }
