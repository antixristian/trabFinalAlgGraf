from fastapi import APIRouter, HTTPException
import app.database.connection as db

router = APIRouter()


def load_jobs_and_precedences():
    """
    Carrega do banco:

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
    # monta lista de adjacência
    adj: dict[int, list[int]] = {j: [] for j in jobs}
    for before, after in precedences:
        if before not in adj or after not in adj:
            continue
        adj[before].append(after)

    visited: dict[int, int] = {j: 0 for j in jobs}
    order: list[int] = []
    has_cycle = False

    def dfs(u: int):
        nonlocal has_cycle
        if has_cycle:
            return

        visited[u] = 1 
        for v in adj[u]:
            if visited[v] == 0:         
                dfs(v)
            elif visited[v] == 1:       
                has_cycle = True
                return

        visited[u] = 2  
        order.append(u)

    # roda DFS em todos os componentes
    for j in jobs:
        if visited[j] == 0:
            dfs(j)

    if has_cycle:
        return True, []  

    order.reverse()      
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

@router.get("/")
def list_jobs():
    """
    Retorna todos os jobs com id, type e node_id.
    Usado pelo frontend para mostrar a tabela e montar as rotas no mapa.
    """
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, type, node_id FROM jobs ORDER BY id")
    rows = cur.fetchall()
    conn.close()

    return [{"id": r[0], "type": r[1], "node_id": r[2]} for r in rows]