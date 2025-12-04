import React, { useState, useEffect } from "react";
import {
  Play,
  AlertTriangle,
  CheckCircle,
  Map as MapIcon,
  BarChart2,
  List,
  Activity,
  Zap,
  Layers,
  Home,
  GitGraph,
  Truck,
} from "lucide-react";

const APP_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  #root {
    max-width: none !important;
    margin: 0 !important;
    text-align: left !important;
  }

  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
    background-color: #F2F6FA;
  }
  
  .app-container { 
    display: flex; 
    width: 100vw; 
    height: 100vh; 
    background-color: #F2F6FA; 
    color: #0D1B2A; 
    overflow: hidden; 
  }
  
  .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  .scroll-area { flex: 1; overflow-y: auto; padding: 32px; }
  
  .sidebar { width: 260px; background-color: #1E3A5F; color: white; display: flex; flex-direction: column; box-shadow: 4px 0 24px rgba(0,0,0,0.1); z-index: 20; flex-shrink: 0; }
  .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .sidebar-title { font-size: 1.5rem; font-weight: bold; display: flex; align-items: center; gap: 10px; }
  .sidebar-subtitle { font-size: 0.75rem; color: #A0C4E8; margin-top: 4px; opacity: 0.8; }
  .sidebar-nav { flex: 1; padding: 24px 12px; display: flex; flex-direction: column; gap: 8px; }
  .sidebar-status { margin: 12px; padding: 16px; background-color: rgba(0,0,0,0.2); border-radius: 8px; }
  
  .header { height: 70px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; flex-shrink: 0; }
  .header-title { font-size: 1.25rem; font-weight: bold; color: #1E3A5F; }
  .header-actions { display: flex; align-items: center; gap: 16px; }
  
  .btn { display: inline-flex; align-items: center; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s ease; gap: 8px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn:active { transform: scale(0.98); }
  
  .btn-nav { width: 100%; justify-content: flex-start; background: transparent; color: #DCE9F5; padding: 12px 16px; }
  .btn-nav:hover { background-color: rgba(255,255,255,0.1); color: white; }
  .btn-nav.active { background-color: #4F83C3; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transform: translateX(4px); }
  
  .btn-primary { background-color: #1E3A5F; color: white; box-shadow: 0 4px 14px rgba(30, 58, 95, 0.3); }
  .btn-primary:hover { background-color: #2c4f7c; }
  
  .btn-action { background-color: #f1f5f9; color: #475569; }
  .btn-action:hover { background-color: #e2e8f0; }
  
  .btn-greedy { background-color: #F4A261; color: white; }
  .btn-greedy:hover { opacity: 0.9; }
  
  .btn-optimal { background-color: #2A9D8F; color: white; }
  .btn-optimal:hover { opacity: 0.9; }
  
  .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 24px; }
  .card-title { font-size: 1.1rem; font-weight: bold; color: #1E3A5F; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .card-border-top-orange { border-top: 4px solid #F4A261; }
  .card-border-top-green { border-top: 4px solid #2A9D8F; }
  
  .grid-layout { display: grid; gap: 24px; }
  
  @media (min-width: 1024px) {
    .grid-layout-main { grid-template-columns: 1fr; }
    .grid-layout-compare { grid-template-columns: 1fr 1fr; }
    .col-span-2 { grid-column: span 2; }
  }
  
  .table-container { overflow-x: auto; }
  .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
  .custom-table th { padding: 12px 16px; color: #475569; font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; }
  .custom-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.9rem; }
  .custom-table tr:hover { background-color: #f8fafc; }
  
  .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; display: inline-block; }
  .badge-pickup { background-color: #fef3c7; color: #b45309; }
  .badge-dropoff { background-color: #dbeafe; color: #1d4ed8; }
  
  .map-weight-badge { font-size: 10px; font-weight: bold; fill: #475569; text-anchor: middle; alignment-baseline: middle; }
  .map-weight-bg { fill: #F1F5F9; stroke: #CBD5E1; stroke-width: 1px; rx: 4; }

  .flex-row { display: flex; flex-direction: row; }
  .flex-wrap { flex-wrap: wrap; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-4 { gap: 16px; }
  .mt-4 { margin-top: 16px; }
  .mb-4 { margin-bottom: 16px; }
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .text-slate-500 { color: #64748b; }
  .font-mono { font-family: monospace; }
  
  .status-badge { padding: 4px 12px; border-radius: 999px; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 6px; }
  .status-error { background-color: #fee2e2; color: #b91c1c; }
  .status-success { background-color: #dcfce7; color: #15803d; }
  
  .divider-v { width: 1px; height: 32px; background-color: #cbd5e1; margin: 0 12px; }
  
  .animate-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 50; }
  .avatar { width: 32px; height: 32px; background-color: #1E3A5F; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }

  .input-control { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; width: 100px; }
  .label-control { font-size: 0.85rem; color: #475569; font-weight: 600; margin-right: 8px; }
`;

const COLORS = {
  primary: "#1E3A5F",
  greedy: "#F4A261",
  optimal: "#2A9D8F",
  edgeStandard: "#7EA1D9",
  edgeRoute: "#118AB2",
};

const API_BASE = "http://localhost:8000";

const generateLayout = (nodesList) => {
  const count = nodesList.length;
  const radius = 250;
  const centerX = 300;
  const centerY = 300;

  return nodesList.map((id, index) => {
    const angle = (index / count) * 2 * Math.PI;
    return {
      id,
      name: `Nó ${id}`,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
};


const api = {
  async getGraph() {
    try {
      const res = await fetch(`${API_BASE}/routes/adjacency`);
      if (!res.ok) throw new Error("Erro ao buscar grafo");
      const data = await res.json();

      const nodesWithCoords = generateLayout(data.nodes || []);
      const edges = [];
      (data.adjacency || []).forEach((item) => {
        (item.neighbors || []).forEach((neighbor) => {
          edges.push({
            id: `${item.node}-${neighbor.to}`,
            from_node: item.node,
            to_node: neighbor.to,
            weight: neighbor.weight,
          });
        });
      });

      return { nodes: nodesWithCoords, edges };
    } catch (e) {
      console.error(e);
      return { nodes: [], edges: [] };
    }
  },

  async getJobs() {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      if (!res.ok) throw new Error("Erro ao buscar jobs");
      const data = await res.json();
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getTopo() {
    try {
      const res = await fetch(`${API_BASE}/jobs/topo`);
      if (!res.ok) throw new Error("Erro ao buscar topológica");
      return await res.json();
    } catch (e) {
      console.error(e);
      return { has_cycle: false, order: [] };
    }
  },

  async getGreedy(startNode) {
    try {
      const res = await fetch(`${API_BASE}/routes/greedy?start_node=${startNode}`);
      if (!res.ok) throw new Error("Erro ao calcular guloso");
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async getOptimal(startNode) {
    try {
      const res = await fetch(`${API_BASE}/routes/optimal?start_node=${startNode}`);
      if (!res.ok) throw new Error("Erro ao calcular ótimo");
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async getPath(from, to) {
    try {
      const res = await fetch(`${API_BASE}/graph/path/${from}/${to}`);
      if (!res.ok) throw new Error("Erro ao buscar caminho");
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },
};


const MapCanvas = ({
  nodes,
  edges,
  pathEdges = [],
  activeJobs = [],
  width = "100%",
  height = 500,
  strategyColor = COLORS.edgeRoute,
}) => {
  if (!nodes || nodes.length === 0)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height,
          color: "#94a3b8",
          background: "white",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        Carregando mapa...
      </div>
    );

  const padding = 60;
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const vbW = maxX - minX + padding * 2;
  const vbH = maxY - minY + padding * 2;
  const vbX = minX - padding;
  const vbY = minY - padding;

  const getJobAtNode = (nodeId) => activeJobs.find((j) => j.node_id === nodeId);

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width={width}
      height={height}
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill={COLORS.edgeStandard} />
        </marker>
        <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="16" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill={strategyColor} />
        </marker>
      </defs>

      {/* Todas as arestas */}
      {edges.map((e) => {
        const n1 = nodes.find((n) => n.id === e.from_node);
        const n2 = nodes.find((n) => n.id === e.to_node);
        if (!n1 || !n2) return null;

        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;

        return (
          <g key={`edge-${e.id}`}>
            <line
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
              stroke={COLORS.edgeStandard}
              strokeWidth="1.5"
              strokeOpacity="0.3"
              markerEnd="url(#arrow)"
            />
            <rect
              x={midX - 10}
              y={midY - 8}
              width="20"
              height="16"
              className="map-weight-bg"
            />
            <text x={midX} y={midY} className="map-weight-badge">
              {e.weight}
            </text>
          </g>
        );
      })}

      {/* Arestas da rota destacadas */}
      {pathEdges.map((pair, idx) => {
        const n1 = nodes.find((n) => n.id === pair[0]);
        const n2 = nodes.find((n) => n.id === pair[1]);
        if (!n1 || !n2) return null;
        return (
          <line
            key={`route-${idx}`}
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke={strategyColor}
            strokeWidth="3"
            strokeLinecap="round"
            markerEnd="url(#arrow-active)"
          />
        );
      })}

      {/* Nós */}
      {nodes.map((n) => {
        const job = getJobAtNode(n.id);
        return (
          <g key={`node-${n.id}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={14}
              fill={job ? "#FFD166" : "#4F83C3"}
              stroke="white"
              strokeWidth="2"
              style={{
                filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))",
                transition: "all 0.3s",
              }}
            />
            <text
              x={n.x}
              y={n.y}
              dy=".3em"
              textAnchor="middle"
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                fill: job ? "#1e293b" : "white",
                pointerEvents: "none",
              }}
            >
              {n.id}
            </text>
            {job && (
              <text
                x={n.x}
                y={n.y - 20}
                textAnchor="middle"
                style={{ fontSize: "9px", fontWeight: "bold", fill: "#475569" }}
              >
                JOB
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};


// Tabela de jobs
const JobsPage = ({ jobs, nodes }) => {
  return (
    <div className="card">
      <h2 className="card-title">
        <List className="text-slate-500" size={24} /> Tarefas Disponíveis
      </h2>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID Job</th>
              <th>Tipo</th>
              <th>Local (Nó)</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const node = nodes.find((n) => n.id === job.node_id);
              return (
                <tr key={job.id}>
                  <td className="font-mono">#{job.id}</td>
                  <td>
                    <span
                      className={`badge ${
                        job.type === "pickup" ? "badge-pickup" : "badge-dropoff"
                      }`}
                    >
                      {job.type}
                    </span>
                  </td>
                  <td>{node ? `Nó ${node.id}` : `Nó ${job.node_id}`}</td>
                </tr>
              );
            })}
            {jobs.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#94a3b8",
                  }}
                >
                  Nenhum job carregado do backend.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Painel "Dia de trabalho"
const WorkDayPage = ({
  dataset,
  onTopo,
  onGreedy,
  onOptimal,
  routeResult,
  topoResult,
  startNode,
  setStartNode,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Barra de Ações */}
      <div
        className="card flex-row flex-wrap items-center justify-between"
        style={{ marginBottom: "0" }}
      >
        <div className="flex-row gap-4 items-center">
          <div className="flex-row items-center">
            <span className="label-control">Nó Inicial:</span>
            <input
              type="number"
              className="input-control"
              value={startNode}
              onChange={(e) => setStartNode(Number(e.target.value))}
            />
          </div>

          <div className="divider-v"></div>

          <button onClick={onTopo} className="btn btn-action">
            <GitGraph size={18} /> Validar Precedências
          </button>

          <button
            onClick={onGreedy}
            disabled={!topoResult || topoResult.has_cycle}
            className="btn btn-greedy"
          >
            <Zap size={18} /> Gerar Guloso
          </button>
          <button
            onClick={onOptimal}
            disabled={!topoResult || topoResult.has_cycle}
            className="btn btn-optimal"
          >
            <CheckCircle size={18} /> Gerar Ótimo (PD)
          </button>
        </div>

        {topoResult && (
          <div
            className={`status-badge ${
              topoResult.has_cycle ? "status-error" : "status-success"
            }`}
          >
            {topoResult.has_cycle ? (
              <AlertTriangle size={14} />
            ) : (
              <CheckCircle size={14} />
            )}
            {topoResult.has_cycle ? "Ciclo Detectado!" : "Grafo Válido"}
          </div>
        )}
      </div>

      <div className="grid-layout grid-layout-main">
        <div className="card" style={{ margin: 0, gridColumn: "1 / -1" }}>
          <h3 className="card-title">
            <MapIcon size={20} /> Visualização da Rota
          </h3>
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #f1f5f9",
            }}
          >
            <MapCanvas
              nodes={dataset.nodes}
              edges={dataset.edges}
              activeJobs={dataset.jobs}
              pathEdges={routeResult?.path_edges || []}
              strategyColor={
                routeResult?.strategy === "optimal"
                  ? COLORS.optimal
                  : COLORS.greedy
              }
            />
          </div>
          {routeResult && (
            <div
              className="mt-4"
              style={{ padding: "16px", backgroundColor: "#F2F6FA", borderRadius: "8px" }}
            >
              <p className="text-sm text-slate-500 mb-4 font-bold">
                Resumo da execução ({routeResult.strategy}):
              </p>
              <div className="flex-row justify-between items-center">
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#1E3A5F",
                  }}
                >
                  {routeResult.total_cost.toFixed(1)}{" "}
                  <span
                    className="text-sm text-slate-500"
                    style={{ fontWeight: "normal" }}
                  >
                    unidades
                  </span>
                </span>
                <div style={{ textAlign: "right" }}>
                  <p
                    className="text-xs text-slate-500"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Ordem dos Jobs
                  </p>
                  <p className="font-mono" style={{ fontWeight: 500, color: "#334155" }}>
                    {routeResult.job_order.join(" → ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Página de comparação Guloso x Ótimo
const ComparisonPage = ({
  dataset,
  greedyRes,
  optimalRes,
  onRunComparison,
  startNode,
  setStartNode,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        className="card flex-row justify-between items-center"
        style={{ marginBottom: 0 }}
      >
        <div>
          <h2 className="card-title">Comparativo de Estratégias</h2>
          <p className="text-slate-500 text-sm">
            Analise o “gap de otimalidade” entre Guloso e Ótimo.
          </p>
        </div>
        <div className="flex-row gap-4 items-center">
          <div className="flex-row items-center">
            <span className="label-control">Nó Inicial:</span>
            <input
              type="number"
              className="input-control"
              value={startNode}
              onChange={(e) => setStartNode(Number(e.target.value))}
            />
          </div>
          <button onClick={onRunComparison} className="btn btn-primary">
            <Play size={18} /> Executar Comparação
          </button>
        </div>
      </div>

      {greedyRes && optimalRes ? (
        <div className="grid-layout grid-layout-compare">
          <div className="card card-border-top-orange" style={{ margin: 0 }}>
            <div className="flex-row justify-between items-center mb-4">
              <h3
                className="card-title"
                style={{ color: COLORS.greedy, marginBottom: 0 }}
              >
                <Zap size={20} /> Guloso
              </h3>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#334155",
                }}
              >
                {greedyRes.total_cost.toFixed(1)}{" "}
                <span className="text-xs text-slate-500">unid.</span>
              </span>
            </div>
            <div
              style={{
                height: "350px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #f1f5f9",
                marginBottom: "16px",
              }}
            >
              <MapCanvas
                nodes={dataset.nodes}
                edges={dataset.edges}
                activeJobs={dataset.jobs}
                pathEdges={greedyRes.path_edges || []}
                strategyColor={COLORS.greedy}
                height="100%"
              />
            </div>
            <div className="text-sm text-slate-500">
              <p>
                <strong>Ordem:</strong> {greedyRes.job_order.join(" → ")}
              </p>
            </div>
          </div>

          <div className="card card-border-top-green" style={{ margin: 0 }}>
            <div className="flex-row justify-between items-center mb-4">
              <h3
                className="card-title"
                style={{ color: COLORS.optimal, marginBottom: 0 }}
              >
                <Layers size={20} /> Ótimo (PD)
              </h3>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#334155",
                }}
              >
                {optimalRes.total_cost.toFixed(1)}{" "}
                <span className="text-xs text-slate-500">unid.</span>
              </span>
            </div>
            <div
              style={{
                height: "350px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #f1f5f9",
                marginBottom: "16px",
              }}
            >
              <MapCanvas
                nodes={dataset.nodes}
                edges={dataset.edges}
                activeJobs={dataset.jobs}
                pathEdges={optimalRes.path_edges || []}
                strategyColor={COLORS.optimal}
                height="100%"
              />
            </div>
            <div className="text-sm text-slate-500">
              <p>
                <strong>Ordem:</strong> {optimalRes.job_order.join(" → ")}
              </p>
            </div>
          </div>

          <div
            className="card col-span-2 flex-row items-center"
            style={{
              margin: 0,
              backgroundColor: "#eff6ff",
              borderColor: "#dbeafe",
            }}
          >
            <div
              style={{
                marginRight: "16px",
                padding: "8px",
                backgroundColor: "white",
                borderRadius: "50%",
                display: "flex",
              }}
            >
              <Activity color="#1E3A5F" />
            </div>
            <div>
              <h4
                style={{
                  fontWeight: "bold",
                  color: "#1E3A5F",
                  marginBottom: "4px",
                }}
              >
                Análise do Gap
              </h4>
              <p className="text-sm" style={{ color: "#1E3A5F" }}>
                O algoritmo Guloso foi{" "}
                <strong>
                  {(greedyRes.total_cost - optimalRes.total_cost).toFixed(1)}{" "}
                  unidades
                </strong>{" "}
                mais caro que o Ótimo.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px",
            borderStyle: "dashed",
          }}
        >
          <BarChart2
            size={48}
            style={{ color: "#cbd5e1", marginBottom: "16px" }}
          />
          <p className="text-slate-500">
            Clique em &quot;Executar Comparação&quot; para rodar os algoritmos.
          </p>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [dataset, setDataset] = useState({ nodes: [], edges: [], jobs: [] });
  const [startNode, setStartNode] = useState(1);
  const [topoResult, setTopoResult] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compGreedy, setCompGreedy] = useState(null);
  const [compOptimal, setCompOptimal] = useState(null);

  // carrega grafo + jobs ao montar
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const graph = await api.getGraph();
    const jobs = await api.getJobs();
    setDataset({
      nodes: graph.nodes,
      edges: graph.edges,
      jobs: jobs || [],
    });
    setLoading(false);
  };

  // helper que monta os segmentos da rota (path_edges) chamando /graph/path
  const computePathEdges = async (route, jobs, startNode) => {
    if (!route || !jobs || jobs.length === 0) return [];
    const jobNodeMap = new Map(jobs.map((j) => [j.id, j.node_id]));

    const nodeSeq = [startNode];
    for (const jobId of route.job_order) {
      const nodeId = jobNodeMap.get(jobId);
      if (nodeId != null) nodeSeq.push(nodeId);
    }

    const allEdges = [];
    for (let i = 0; i < nodeSeq.length - 1; i++) {
      const from = nodeSeq[i];
      const to = nodeSeq[i + 1];
      const pathRes = await api.getPath(from, to);
      if (!pathRes || !pathRes.reachable || !pathRes.path) continue;
      const p = pathRes.path;
      for (let j = 0; j < p.length - 1; j++) {
        allEdges.push([p[j], p[j + 1]]);
      }
    }
    return allEdges;
  };

  const handleTopo = async () => {
    setLoading(true);
    const res = await api.getTopo();
    setTopoResult(res);
    setLoading(false);
  };

  const handleRunStrategy = async (strategy) => {
    setLoading(true);
    const baseRoute =
      strategy === "greedy"
        ? await api.getGreedy(startNode)
        : await api.getOptimal(startNode);

    let withPaths = baseRoute;
    if (baseRoute && dataset.jobs.length > 0) {
      const edges = await computePathEdges(baseRoute, dataset.jobs, startNode);
      withPaths = { ...baseRoute, path_edges: edges };
    }

    setRouteResult(withPaths);
    setLoading(false);
  };

  const handleComparison = async () => {
    setLoading(true);
    const g = await api.getGreedy(startNode);
    const o = await api.getOptimal(startNode);

    let gWith = g;
    let oWith = o;

    if (g && dataset.jobs.length > 0) {
      const edgesG = await computePathEdges(g, dataset.jobs, startNode);
      gWith = { ...g, path_edges: edgesG };
    }
    if (o && dataset.jobs.length > 0) {
      const edgesO = await computePathEdges(o, dataset.jobs, startNode);
      oWith = { ...o, path_edges: edgesO };
    }

    setCompGreedy(gWith);
    setCompOptimal(oWith);
    setLoading(false);
  };

  return (
    <>
      <style>{APP_STYLES}</style>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <Truck size={24} /> RouteOpt
            </div>
            <div className="sidebar-subtitle">Otimizador Logístico</div>
          </div>
          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`btn btn-nav ${
                activeTab === "jobs" ? "active" : ""
              }`}
            >
              <Home size={20} /> Jobs
            </button>
            <button
              onClick={() => setActiveTab("workday")}
              className={`btn btn-nav ${
                activeTab === "workday" ? "active" : ""
              }`}
            >
              <Activity size={20} /> Dia de Trabalho
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`btn btn-nav ${
                activeTab === "compare" ? "active" : ""
              }`}
            >
              <BarChart2 size={20} /> Comparação
            </button>
          </nav>
          <div className="sidebar-status">
            <p
              className="text-xs"
              style={{ marginBottom: "8px", color: "#A0C4E8" }}
            >
              Status do Sistema
            </p>
            <div
              className="flex-row items-center text-xs font-mono"
              style={{ color: "#86efac" }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#4ade80",
                  borderRadius: "50%",
                  marginRight: "8px",
                }}
              ></div>
              Online
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="header">
            <h2 className="header-title">
              {activeTab === "jobs" && "Gerenciamento de Tarefas"}
              {activeTab === "workday" && "Painel Operacional"}
              {activeTab === "compare" && "Análise de Algoritmos"}
            </h2>
            <div className="header-actions">
              <div className="avatar">U</div>
            </div>
          </header>

          <div className="scroll-area">
            {activeTab === "jobs" && (
              <JobsPage jobs={dataset.jobs} nodes={dataset.nodes} />
            )}
            {activeTab === "workday" && (
              <WorkDayPage
                dataset={dataset}
                onTopo={handleTopo}
                onGreedy={() => handleRunStrategy("greedy")}
                onOptimal={() => handleRunStrategy("optimal")}
                routeResult={routeResult}
                topoResult={topoResult}
                startNode={startNode}
                setStartNode={setStartNode}
              />
            )}
            {activeTab === "compare" && (
              <ComparisonPage
                dataset={dataset}
                greedyRes={compGreedy}
                optimalRes={compOptimal}
                onRunComparison={handleComparison}
                startNode={startNode}
                setStartNode={setStartNode}
              />
            )}
          </div>

          {loading && (
            <div className="loading-overlay">
              <div
                style={{
                  padding: "24px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  className="animate-spin"
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f1f5f9",
                    borderTopColor: COLORS.primary,
                    borderRadius: "50%",
                    marginBottom: "16px",
                  }}
                ></div>
                <p style={{ fontWeight: "bold", color: COLORS.primary }}>
                  Processando...
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default App;
