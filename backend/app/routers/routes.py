from fastapi import APIRouter, HTTPException
import app.database.connection as db
import heapq
from collections import defaultdict
from app.routers import jobs as jobs_router

router = APIRouter()


# ---------- Parte 1: carregar grafo e jobs do banco ----------

def load_graph_from_db():
    """
    Retorna (nodes, adj)
    adj: node_id -> [(vizinho, peso), ...]
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
    conn = db.get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, type, node_id FROM jobs ORDER BY id")
    job_rows = cur.fetchall()
    if not job_rows:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Nenhum job encontrado em 'jobs'. Faça upload do dataset primeiro."
        )

    jobs = [row[0] for row in job_rows]
    job_nodes = {row[0]: row[2] for row in job_rows}

    cur.execute("SELECT job_before, job_after FROM precedences")
    prec_rows = cur.fetchall()

    conn.close()
    return jobs, job_nodes, prec_rows


# ---------- Parte 2: Dijkstra e Recuperação de Caminho (MODIFICADO) ----------

def dijkstra_with_path(adj: dict[int, list[tuple[int, float]]], start: int):
    """
    Retorna (dist, parents).
    parents[v] = nó anterior a v no caminho mínimo vindo de start.
    """
    INF = float("inf")
    dist = {v: INF for v in adj.keys()}
    parents = {v: None for v in adj.keys()}  # Para reconstrução do caminho

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
                parents[v] = u  # Guardamos de onde viemos
                heapq.heappush(heap, (nd, v))

    return dist, parents


def compute_costs_and_paths(adj: dict[int, list[tuple[int, float]]], relevant_nodes: set[int]):
    """
    Pré-calcula custos E pais para reconstrução.
    Retorna (costs, all_parents).
    costs[u][v] = custo float
    all_parents[u][v] = predecessor de v partindo de u
    """
    costs: dict[int, dict[int, float]] = {}
    all_parents: dict[int, dict[int, int | None]] = {}

    for u in relevant_nodes:
        dist, parents = dijkstra_with_path(adj, u)
        costs[u] = dist
        all_parents[u] = parents
        
    return costs, all_parents


def get_path_edges(parents: dict[int, int | None], start: int, end: int) -> list[tuple[int, int]]:
    """
    Reconstrói a lista de arestas [(n1, n2), (n2, n3), ...] do start até o end
    usando o dicionário de parents.
    """
    if start == end:
        return []
    
    path = []
    curr = end
    while curr != start:
        prev = parents.get(curr)
        if prev is None:
            # Sem caminho possível
            return []
        path.append((prev, curr))
        curr = prev
    
    # O caminho foi montado do fim pro começo, então invertemos
    return path[::-1]


# ---------- Parte 3: modelagem das precedências ----------

def build_prereqs(jobs: list[int], precedences: list[tuple[int, int]]):
    prereqs: dict[int, set[int]] = {j: set() for j in jobs}
    succs: dict[int, set[int]] = {j: set() for j in jobs}

    for before, after in precedences:
        if before not in prereqs or after not in prereqs:
            continue
        prereqs[after].add(before)
        succs[before].add(after)

    return prereqs, succs


# ---------- Parte 4: algoritmo GULOSO (MODIFICADO) ----------

def greedy_route(start_node: int):
    # 1. carregar
    nodes, adj = load_graph_from_db()
    jobs, job_nodes, prec_rows = load_jobs_and_precedences()

    if start_node not in nodes:
        raise HTTPException(status_code=404, detail=f"start_node {start_node} não existe.")

    # 2. ciclo
    has_cycle, _ = jobs_router.topological_sort(jobs, prec_rows) # type: ignore
    if has_cycle:
        raise HTTPException(status_code=400, detail="Ciclo detectado nas precedências.")

    # 3. prereqs
    prereqs, _ = build_prereqs(jobs, prec_rows)

    # 4. pré-calcular custos e paths
    relevant_nodes: set[int] = set(job_nodes.values())
    relevant_nodes.add(start_node)

    # MODIFICADO: Pegamos também os parents
    costs, all_parents = compute_costs_and_paths(adj, relevant_nodes)

    # 5. loop guloso
    completed: set[int] = set()
    remaining: set[int] = set(jobs)
    current_node = start_node
    total_cost = 0.0
    job_order: list[int] = []
    
    full_path_edges: list[tuple[int, int]] = []  # Lista final de arestas

    while remaining:
        available = [j for j in remaining if prereqs[j].issubset(completed)]

        if not available:
            raise HTTPException(status_code=400, detail="Sem jobs disponíveis (precedências).")

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
            raise HTTPException(status_code=400, detail="Caminho inalcançável no grafo.")

        # Executar job e gravar arestas
        target_node = job_nodes[best_job]
        
        # Recupera o caminho físico
        parents_from_curr = all_parents[current_node]
        segment_edges = get_path_edges(parents_from_curr, current_node, target_node)
        full_path_edges.extend(segment_edges)

        total_cost += best_cost
        current_node = target_node
        completed.add(best_job)
        remaining.remove(best_job)
        job_order.append(best_job)

    return job_order, total_cost, start_node, full_path_edges


@router.get("/greedy")
def get_greedy_route(start_node: int = 1):
    job_order, total_cost, start, path_edges = greedy_route(start_node)

    return {
        "strategy": "greedy",
        "start_node": start,
        "job_order": job_order,
        "total_cost": total_cost,
        "path_edges": path_edges  # Nova chave no JSON
    }


# ---------- Parte 5: algoritmo ÓTIMO (MODIFICADO) ----------

def optimal_route(start_node: int):
    nodes, adj = load_graph_from_db()
    jobs, job_nodes, prec_rows = load_jobs_and_precedences()

    if start_node not in nodes:
        raise HTTPException(status_code=404, detail=f"start_node {start_node} não existe.")

    has_cycle, _ = jobs_router.topological_sort(jobs, prec_rows) # type: ignore
    if has_cycle:
        raise HTTPException(status_code=400, detail="Ciclo detectado nas precedências.")

    prereqs, _ = build_prereqs(jobs, prec_rows)

    n = len(jobs)
    job_index = {job_id: i for i, job_id in enumerate(jobs)}

    relevant_nodes: set[int] = set(job_nodes.values())
    relevant_nodes.add(start_node)
    
    # MODIFICADO: Agora calculamos parents também para usar no final
    costs_nodes, all_parents = compute_costs_and_paths(adj, relevant_nodes)

    # --- Setup DP (igual ao anterior) ---
    start_to_job = [float("inf")] * n
    for job_id, idx in job_index.items():
        node_j = job_nodes[job_id]
        d = costs_nodes[start_node].get(node_j, float("inf"))
        start_to_job[idx] = d

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

    INF = float("inf")
    size = 1 << n
    dp = [[INF] * n for _ in range(size)]
    parent_state: dict[tuple[int, int], tuple[int, int] | None] = {}

    # Inicialização DP
    for job_id, idx in job_index.items():
        if prereqs[job_id]:
            continue
        cost = start_to_job[idx]
        if cost == INF:
            continue
        mask = 1 << idx
        dp[mask][idx] = cost
        parent_state[(mask, idx)] = None 

    # Transições DP
    for mask in range(size):
        for last in range(n):
            cur_cost = dp[mask][last]
            if cur_cost == INF:
                continue

            last_job_id = jobs[last]

            for k in range(n):
                if mask & (1 << k):
                    continue 

                next_job_id = jobs[k]
                
                # Check precedences
                jobs_done_in_mask = {jobs[i] for i in range(n) if mask & (1 << i)}
                if not prereqs[next_job_id].issubset(jobs_done_in_mask):
                    continue

                move_cost = job_to_job[last][k]
                if move_cost == INF:
                    continue

                next_mask = mask | (1 << k)
                new_cost = cur_cost + move_cost
                if new_cost < dp[next_mask][k]:
                    dp[next_mask][k] = new_cost
                    parent_state[(next_mask, k)] = (mask, last)

    # Recuperar solução
    full_mask = (1 << n) - 1
    best_cost = INF
    best_last = -1

    for last in range(n):
        if dp[full_mask][last] < best_cost:
            best_cost = dp[full_mask][last]
            best_last = last

    if best_cost == INF or best_last == -1:
        raise HTTPException(status_code=400, detail="Rota ótima impossível.")

    job_order_indices: list[int] = []
    cur_state = (full_mask, best_last)
    while cur_state is not None:
        mask, last = cur_state
        job_order_indices.append(last)
        cur_state = parent_state.get(cur_state)

    job_order_indices.reverse()
    job_order = [jobs[i] for i in job_order_indices]

    # --- MODIFICADO: Reconstruir caminho físico ---
    full_path_edges = []
    current_node = start_node
    
    for job_id in job_order:
        target_node = job_nodes[job_id]
        
        # Pega o mapa de pais partindo de current_node
        parents_from_curr = all_parents[current_node]
        
        # Gera arestas
        segment_edges = get_path_edges(parents_from_curr, current_node, target_node)
        full_path_edges.extend(segment_edges)
        
        current_node = target_node

    return job_order, best_cost, start_node, full_path_edges


@router.get("/optimal")
def get_optimal_route(start_node: int = 1):
    job_order, total_cost, start, path_edges = optimal_route(start_node)

    return {
        "strategy": "optimal",
        "start_node": start,
        "job_order": job_order,
        "total_cost": total_cost,
        "path_edges": path_edges # Nova chave no JSON
    }
@router.get("/adjacency")
def get_adjacency_list():
    """
    Retorna o grafo viário como lista de adjacência,
    pronto pra consumir no frontend.

    Formato de resposta:
    {
      "nodes": [1, 2, 3, ...],
      "adjacency": [
        {
          "node": 1,
          "neighbors": [
            {"to": 2, "weight": 2.3},
            {"to": 8, "weight": 3.0}
          ]
        },
        {
          "node": 2,
          "neighbors": [
            {"to": 3, "weight": 2.0},
            {"to": 9, "weight": 2.2}
          ]
        },
        ...
      ]
    }
    """
    # reaproveita a função que você já tem
    nodes, adj = load_graph_from_db()

    adjacency = []
    for node_id in nodes:
        neighbors = [
            {"to": neighbor_id, "weight": weight}
            for (neighbor_id, weight) in adj[node_id]
        ]
        adjacency.append({
            "node": node_id,
            "neighbors": neighbors
        })

    return {
        "nodes": nodes,
        "adjacency": adjacency
    }
