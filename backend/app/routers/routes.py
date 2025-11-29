from fastapi import APIRouter, HTTPException
import app.database.connection as db
import heapq
from collections import defaultdict
from app.routers import jobs as jobs_router  # reutilizar topológica

router = APIRouter()


# ---------- Parte 1: carregar grafo e jobs do banco ----------

def load_graph_from_db():
    """
    Reaproveita a ideia do graph.py:
    retorna (nodes, adj) onde:
      - nodes é a lista de ids de nós
      - adj é um dict: node_id -> [(vizinho, peso), ...]
    """
    conn = db.get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM nodes ORDER BY id")
    rows = cur.fetchall()
    if not rows:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Nenhum nó encontrado em 'nodes'. Faça upload do dataset primeiro."
        )

    nodes = [r[0] for r in rows]

    adj: dict[int, list[tuple[int, float]]] = {nid: [] for nid in nodes}
    cur.execute("SELECT from_node, to_node, weight FROM edges")
    for from_node, to_node, weight in cur.fetchall():
        if from_node in adj:
            adj[from_node].append((to_node, weight))

    conn.close()
    return nodes, adj


def load_jobs_and_precedences():
    """
    Similar ao que fizemos em jobs.py, mas aqui também pegamos o node_id de cada job.
    """
    conn = db.get_connection()
    cur = conn.cursor()

    # jobs: id, type, node_id
    cur.execute("SELECT id, type, node_id FROM jobs ORDER BY id")
    job_rows = cur.fetchall()
    if not job_rows:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Nenhum job encontrado em 'jobs'. Faça upload do dataset primeiro."
        )

    jobs = [row[0] for row in job_rows]
    job_nodes = {row[0]: row[2] for row in job_rows}  # job_id -> node_id

    # precedences: job_before, job_after
    cur.execute("SELECT job_before, job_after FROM precedences")
    prec_rows = cur.fetchall()

    conn.close()
    return jobs, job_nodes, prec_rows


# ---------- Parte 2: Dijkstra e custos entre nós ----------

def dijkstra(adj: dict[int, list[tuple[int, float]]], start: int):
    """
    Dijkstra simples com heapq.
    Retorna dist: node -> custo mínimo a partir de start.
    """
    INF = float("inf")
    dist = {v: INF for v in adj.keys()}

    if start not in adj:
        raise HTTPException(status_code=404, detail=f"Nó {start} não existe no grafo.")

    dist[start] = 0.0
    heap: list[tuple[float, int]] = [(0.0, start)]

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))

    return dist


def compute_costs_for_nodes(adj: dict[int, list[tuple[int, float]]], relevant_nodes: set[int]):
    """
    Pré-calcula custos mínimos entre todos os nós relevantes.
    Retorna: costs[u][v] = custo mínimo de u até v (ou inf se não tiver caminho).
    """
    costs: dict[int, dict[int, float]] = {}
    for u in relevant_nodes:
        dist = dijkstra(adj, u)
        costs[u] = dist
    return costs


# ---------- Parte 3: modelagem das precedências ----------

def build_prereqs(jobs: list[int], precedences: list[tuple[int, int]]):
    """
    Constrói:
      - prereqs[j] = conjunto de jobs que precisam ocorrer antes de j
      - succs[j]   = conjunto de jobs que dependem de j (não é usado no guloso, mas útil se quiser estender)
    """
    prereqs: dict[int, set[int]] = {j: set() for j in jobs}
    succs: dict[int, set[int]] = {j: set() for j in jobs}

    for before, after in precedences:
        if before not in prereqs or after not in prereqs:
            # FK deveria evitar isso; ignoramos por segurança.
            continue
        prereqs[after].add(before)
        succs[before].add(after)

    return prereqs, succs


# ---------- Parte 4: algoritmo GULOSO ----------

def greedy_route(start_node: int):
    """
    Implementa a estratégia gulosa:
      - começa em start_node
      - em cada passo escolhe o job liberado cujo node_id é mais barato
        para alcançar a partir do nó atual.
      - respeita precedências (DAG de jobs).
    Retorna (job_order, total_cost).
    """
    # 1. carregar grafo e jobs
    nodes, adj = load_graph_from_db()
    jobs, job_nodes, prec_rows = load_jobs_and_precedences()

    if start_node not in nodes:
        raise HTTPException(status_code=404, detail=f"start_node {start_node} não existe em 'nodes'.")

    # 2. verificar se há ciclo usando a mesma lógica da ordenação topológica
    has_cycle, _ = jobs_router.topological_sort(jobs, prec_rows)  # type: ignore[attr-defined]
    if has_cycle:
        raise HTTPException(
            status_code=400,
            detail="Não é possível gerar rota: foram detectadas precedências cíclicas."
        )

    # 3. construir prereqs por job
    prereqs, _ = build_prereqs(jobs, prec_rows)

    # 4. pré-calcular custos entre nós relevantes
    relevant_nodes: set[int] = set(job_nodes.values())
    relevant_nodes.add(start_node)

    costs = compute_costs_for_nodes(adj, relevant_nodes)

    # 5. loop guloso
    completed: set[int] = set()
    remaining: set[int] = set(jobs)

    current_node = start_node
    total_cost = 0.0
    job_order: list[int] = []

    while remaining:
        # jobs liberados = cujas prereqs estão todas em completed
        available = [j for j in remaining if prereqs[j].issubset(completed)]

        if not available:
            # em teoria não devia acontecer se não há ciclo
            raise HTTPException(
                status_code=400,
                detail="Não há jobs disponíveis respeitando precedências. Verifique o dataset."
            )

        # escolher entre os disponíveis o de menor custo de deslocamento
        best_job = None
        best_cost = float("inf")

        for j in available:
            target_node = job_nodes[j]
            dist_map = costs.get(current_node)
            if dist_map is None:
                continue
            d = dist_map.get(target_node, float("inf"))
            if d < best_cost:
                best_cost = d
                best_job = j

        if best_job is None or best_cost == float("inf"):
            raise HTTPException(
                status_code=400,
                detail="Não foi possível encontrar caminho para jobs liberados. Verifique o grafo viário."
            )

        # "executar" o job escolhido
        total_cost += best_cost
        current_node = job_nodes[best_job]
        completed.add(best_job)
        remaining.remove(best_job)
        job_order.append(best_job)

    return job_order, total_cost, start_node


@router.get("/greedy")
def get_greedy_route(start_node: int = 1):
    """
    Endpoint /routes/greedy:
      - calcula uma rota gulosa a partir de um start_node (default = 1)
      - respeita precedências
      - retorna ordem dos jobs e custo total de deslocamento.
    """
    job_order, total_cost, start = greedy_route(start_node)

    return {
        "strategy": "greedy",
        "start_node": start,
        "job_order": job_order,
        "total_cost": total_cost
    }


# ---------- Parte 5: algoritmo ÓTIMO (Programação Dinâmica) ----------

def optimal_route(start_node: int):
    """
    Estratégia ÓTIMA usando Programação Dinâmica em subconjuntos (bitmask).
    - estados: (mask, last_idx) onde:
        mask = subconjunto de jobs já feitos
        last_idx = índice do último job executado
    - respeita precedências
    Retorna (job_order, total_cost, start_node).
    """
    nodes, adj = load_graph_from_db()
    jobs, job_nodes, prec_rows = load_jobs_and_precedences()

    if start_node not in nodes:
        raise HTTPException(status_code=404, detail=f"start_node {start_node} não existe em 'nodes'.")

    # checa ciclo com mesma função da topológica
    has_cycle, _ = jobs_router.topological_sort(jobs, prec_rows)  # type: ignore[attr-defined]
    if has_cycle:
        raise HTTPException(
            status_code=400,
            detail="Não é possível gerar rota ótima: foram detectadas precedências cíclicas."
        )

    # constrói prereqs
    prereqs, _ = build_prereqs(jobs, prec_rows)

    # mapeia job_id -> índice [0..n-1]
    n = len(jobs)
    job_index = {job_id: i for i, job_id in enumerate(jobs)}

    # pré-calcular custos entre nós relevantes
    relevant_nodes: set[int] = set(job_nodes.values())
    relevant_nodes.add(start_node)
    costs_nodes = compute_costs_for_nodes(adj, relevant_nodes)

    # verifica custo start_node -> cada job
    start_to_job = [float("inf")] * n
    for job_id, idx in job_index.items():
        node_j = job_nodes[job_id]
        d = costs_nodes[start_node].get(node_j, float("inf"))
        start_to_job[idx] = d

    # custo entre jobs: de job_i até job_j
    job_to_job = [[float("inf")] * n for _ in range(n)]
    for i, job_i in enumerate(jobs):
        node_i = job_nodes[job_i]
        dist_map = costs_nodes.get(node_i)
        if dist_map is None:
            continue
        for j, job_j in enumerate(jobs):
            node_j = job_nodes[job_j]
            d = dist_map.get(node_j, float("inf"))
            job_to_job[i][j] = d

    # DP: dp[mask][last] = custo mínimo para fazer subconjunto "mask"
    # terminando no job de índice last
    INF = float("inf")
    size = 1 << n
    dp = [[INF] * n for _ in range(size)]
    parent: dict[tuple[int, int], tuple[int, int] | None] = {}

    # inicialização: estados com apenas 1 job
    for job_id, idx in job_index.items():
        # só pode começar por job cujas prereqs estão vazias
        if prereqs[job_id]:
            continue
        cost = start_to_job[idx]
        if cost == INF:
            continue
        mask = 1 << idx
        dp[mask][idx] = cost
        parent[(mask, idx)] = None  # estado inicial

    # transições
    for mask in range(size):
        for last in range(n):
            cur_cost = dp[mask][last]
            if cur_cost == INF:
                continue

            last_job_id = jobs[last]

            # tentar adicionar um novo job k
            for k in range(n):
                if mask & (1 << k):
                    continue  # já está no subconjunto

                next_job_id = jobs[k]

                # checar se todas as prereqs do próximo job estão em "mask"
                if not prereqs[next_job_id].issubset(
                    {jobs[i] for i in range(n) if mask & (1 << i)}
                ):
                    continue

                move_cost = job_to_job[last][k]
                if move_cost == INF:
                    continue

                next_mask = mask | (1 << k)
                new_cost = cur_cost + move_cost
                if new_cost < dp[next_mask][k]:
                    dp[next_mask][k] = new_cost
                    parent[(next_mask, k)] = (mask, last)

    # solução: melhor estado com todos os jobs feitos
    full_mask = (1 << n) - 1
    best_cost = INF
    best_last = -1

    for last in range(n):
        if dp[full_mask][last] < best_cost:
            best_cost = dp[full_mask][last]
            best_last = last

    if best_cost == INF or best_last == -1:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível encontrar rota ótima respeitando precedências e o grafo viário."
        )

    # reconstruir sequência de jobs a partir de parent
    job_order_indices: list[int] = []
    cur_state = (full_mask, best_last)
    while cur_state is not None:
        mask, last = cur_state
        job_order_indices.append(last)
        cur_state = parent.get(cur_state)

    job_order_indices.reverse()
    job_order = [jobs[i] for i in job_order_indices]

    return job_order, best_cost, start_node


@router.get("/optimal")
def get_optimal_route(start_node: int = 1):
    """
    Endpoint /routes/optimal:
      - calcula rota ÓTIMA (Programação Dinâmica em subconjuntos)
      - respeita precedências
      - usa mesma modelagem de custo do guloso
      - adequado para instâncias pequenas (como descrito no PDF).
    """
    job_order, total_cost, start = optimal_route(start_node)

    return {
        "strategy": "optimal",
        "start_node": start,
        "job_order": job_order,
        "total_cost": total_cost
    }
