from fastapi import APIRouter, HTTPException
import heapq
import app.database.connection as db

router = APIRouter()


def load_graph_from_db():
    """
    Carrega os nodes e edges do banco e monta:
    - lista de nós (ordenada por id)
    - grafo em forma de lista de adjacência.
    """
    conn = db.get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM nodes ORDER BY id")
    rows = cur.fetchall()

    if not rows:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Nenhum nó encontrado no banco. Faça upload do dataset primeiro."
        )

    nodes = [r[0] for r in rows]

    # monta adjacência
    adj = {nid: [] for nid in nodes}
    cur.execute("SELECT from_node, to_node, weight FROM edges")
    for from_node, to_node, weight in cur.fetchall():
        if from_node in adj:
            adj[from_node].append((to_node, weight))

    conn.close()
    return nodes, adj


def dijkstra(adj: dict[int, list[tuple[int, float]]], start: int):
    INF = float("inf")
    dist = {v: INF for v in adj.keys()}
    prev = {v: None for v in adj.keys()}

    if start not in adj:
        raise HTTPException(status_code=404, detail=f"Nó {start} não encontrado no grafo.")

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
                prev[v] = u
                heapq.heappush(heap, (nd, v))

    return dist, prev


def reconstruct_path(prev: dict[int, int | None], start: int, end: int) -> list[int]:
    """
    Reconstrói o caminho mínimo de start até end usando prev.
    Se não houver caminho, retorna lista vazia.
    """
    if start == end:
        return [start]

    path: list[int] = []
    cur = end
    while cur is not None:
        path.append(cur)
        if cur == start:
            break
        cur = prev[cur]

    if path[-1] != start:
        return []

    path.reverse()
    return path


@router.get("/path/{start_id}/{end_id}")
def get_shortest_path(start_id: int, end_id: int):
    """
    Retorna o caminho mínimo e a distância entre dois nós usando Dijkstra.
    """
    nodes, adj = load_graph_from_db()

    if start_id not in nodes:
        raise HTTPException(status_code=404, detail=f"Nó inicial {start_id} não existe.")
    if end_id not in nodes:
        raise HTTPException(status_code=404, detail=f"Nó final {end_id} não existe.")

    dist, prev = dijkstra(adj, start_id)
    if dist[end_id] == float("inf"):
        return {
            "start": start_id,
            "end": end_id,
            "distance": None,
            "path": [],
            "reachable": False,
        }

    path = reconstruct_path(prev, start_id, end_id)
    return {
        "start": start_id,
        "end": end_id,
        "distance": dist[end_id],
        "path": path,
        "reachable": True,
    }


@router.get("/cost_matrix")
def get_cost_matrix():
    """
    Gera a matriz de custos C[i][j] entre todos os pares de nós.
    Usa Dijkstra com cada nó como origem.
    """
    nodes, adj = load_graph_from_db()

    matrix: list[list[float | None]] = []

    for start in nodes:
        dist, _ = dijkstra(adj, start)
        row: list[float | None] = []
        for end in nodes:
            d = dist[end]
            if d == float("inf"):
                row.append(None)  # sem caminho
            else:
                row.append(d)
        matrix.append(row)

    return {
        "nodes": nodes,
        "matrix": matrix,
    }
