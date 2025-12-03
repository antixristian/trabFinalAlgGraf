import React, { useState, useEffect } from "react";
import {
  Upload,
  Play,
  AlertTriangle,
  CheckCircle,
  Map as MapIcon,
  BarChart2,
  List,
  Layout,
  Activity,
  Zap,
  Layers,
  Home,
  GitGraph,
} from "lucide-react";

/**
 * =============================================================================
 * 🎨 CSS STYLES (Vanilla CSS)
 * Layout idêntico ao original, sem dependências de Tailwind.
 * =============================================================================
 */
const APP_STYLES = `
  /* Reset & Base Globals */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  /* Garante que html, body e root ocupem todo o espaço disponível */
  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  /* Remove estilos padrões do Vite que podem centralizar ou limitar o #root */
  #root {
    max-width: none !important;
    margin: 0 !important;
    text-align: left !important;
  }

  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
    background-color: #F2F6FA;
  }
  
  /* Layout Containers */
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
  
  /* Sidebar */
  .sidebar { width: 260px; background-color: #1E3A5F; color: white; display: flex; flex-direction: column; box-shadow: 4px 0 24px rgba(0,0,0,0.1); z-index: 20; flex-shrink: 0; }
  .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .sidebar-title { font-size: 1.5rem; font-weight: bold; display: flex; align-items: center; gap: 10px; }
  .sidebar-subtitle { font-size: 0.75rem; color: #A0C4E8; margin-top: 4px; opacity: 0.8; }
  .sidebar-nav { flex: 1; padding: 24px 12px; display: flex; flex-direction: column; gap: 8px; }
  .sidebar-status { margin: 12px; padding: 16px; background-color: rgba(0,0,0,0.2); border-radius: 8px; }
  
  /* Header */
  .header { height: 70px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; flex-shrink: 0; }
  .header-title { font-size: 1.25rem; font-weight: bold; color: #1E3A5F; }
  .header-actions { display: flex; align-items: center; gap: 16px; }
  
  /* Components: Buttons */
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
  
  /* Components: Cards & Layouts */
  .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 24px; }
  .card-title { font-size: 1.1rem; font-weight: bold; color: #1E3A5F; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .card-border-top-orange { border-top: 4px solid #F4A261; }
  .card-border-top-green { border-top: 4px solid #2A9D8F; }
  
  .grid-layout { display: grid; gap: 24px; }
  
  /* Responsive Grid */
  @media (min-width: 1024px) {
    .grid-layout-main { grid-template-columns: 2fr 1fr; }
    .grid-layout-compare { grid-template-columns: 1fr 1fr; }
    .col-span-2 { grid-column: span 2; }
  }
  
  /* Table Styles */
  .table-container { overflow-x: auto; }
  .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
  .custom-table th { padding: 12px 16px; color: #475569; font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; }
  .custom-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.9rem; }
  .custom-table tr:hover { background-color: #f8fafc; }
  
  .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; display: inline-block; }
  .badge-pickup { background-color: #fef3c7; color: #b45309; }
  .badge-dropoff { background-color: #dbeafe; color: #1d4ed8; }
  
  /* Matrix Grid */
  .matrix-cell { padding: 8px; border: 1px solid #f1f5f9; text-align: center; cursor: pointer; transition: background 0.2s; font-size: 0.85rem; }
  .matrix-cell:hover { background-color: #eff6ff; }
  .matrix-cell-header { background-color: #f1f5f9; font-weight: bold; color: #475569; }
  .matrix-cell-empty { background-color: #f8fafc; color: #cbd5e1; }
  
  /* Utilities */
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
  
  .text-link { color: #4F83C3; font-weight: 500; cursor: pointer; text-decoration: none; display: flex; align-items: center; font-size: 0.9rem; }
  .text-link:hover { text-decoration: underline; }
  .avatar { width: 32px; height: 32px; background-color: #1E3A5F; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
`;

/**
 * =============================================================================
 * 📂 UTILS / CONSTANTS
 * =============================================================================
 */
const COLORS = {
  primary: "#1E3A5F",
  secondary: "#4F83C3",
  bg: "#F2F6FA",
  card: "#FFFFFF",

  // Grafos
  nodeNormal: "#4F83C3",
  nodeAction: "#FFD166",
  nodeViolation: "#EF476F",
  edgeStandard: "#7EA1D9",
  edgeRoute: "#118AB2",
  edgePath: "#06D6A0",

  // Estratégias
  greedy: "#F4A261",
  optimal: "#2A9D8F",
};

const MOCK_DATASET = {
  nodes: [
    { id: 1, name: "Portaria", x: 50, y: 50 },
    { id: 2, name: "Bloco A", x: 200, y: 50 },
    { id: 3, name: "Bloco B", x: 350, y: 150 },
    { id: 4, name: "Refeitório", x: 200, y: 250 },
    { id: 5, name: "Biblioteca", x: 50, y: 250 },
    { id: 6, name: "Admin", x: 125, y: 150 },
  ],
  edges: [
    { id: 1, from_node: 1, to_node: 2, weight: 10 },
    { id: 2, from_node: 2, to_node: 3, weight: 15 },
    { id: 3, from_node: 3, to_node: 4, weight: 12 },
    { id: 4, from_node: 4, to_node: 5, weight: 10 },
    { id: 5, from_node: 5, to_node: 1, weight: 8 },
    { id: 6, from_node: 1, to_node: 6, weight: 5 },
    { id: 7, from_node: 6, to_node: 2, weight: 5 },
    { id: 8, from_node: 6, to_node: 4, weight: 7 },
    { id: 9, from_node: 2, to_node: 4, weight: 20 },
  ],
  jobs: [
    { id: 101, type: "Pickup", node_id: 2 },
    { id: 102, type: "Dropoff", node_id: 5 },
    { id: 103, type: "Pickup", node_id: 3 },
    { id: 104, type: "Dropoff", node_id: 4 },
  ],
  precedences: [
    { job_before: 101, job_after: 102 },
    { job_before: 103, job_after: 104 },
  ],
};

/**
 * =============================================================================
 * 📂 SERVICES / API
 * =============================================================================
 */
const API_BASE = "http://localhost:8000";

const api = {
  async uploadDataset(data) {
    try {
      const res = await fetch(`${API_BASE}/dataset/upload_dataset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha no upload");
      return await res.json();
    } catch (e) {
      console.warn("API Error (Upload), using mock:", e);
      return { message: "Dataset carregado (MOCK)" };
    }
  },
  async getTopo() {
    try {
      const res = await fetch(`${API_BASE}/jobs/topo`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return { has_cycle: false, order: [101, 103, 102, 104] };
    }
  },
  async getGreedy(startNode) {
    try {
      const res = await fetch(
        `${API_BASE}/routes/greedy?start_node=${startNode}`
      );
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return {
        strategy: "greedy",
        start_node: startNode,
        job_order: [101, 103, 102, 104],
        total_cost: 45.0,
        path_edges: [
          [1, 6],
          [6, 2],
          [2, 3],
          [3, 4],
          [4, 5],
        ],
      };
    }
  },
  async getOptimal(startNode) {
    try {
      const res = await fetch(
        `${API_BASE}/routes/optimal?start_node=${startNode}`
      );
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return {
        strategy: "optimal",
        start_node: startNode,
        job_order: [103, 101, 104, 102],
        total_cost: 38.0,
        path_edges: [
          [1, 6],
          [6, 2],
          [2, 3],
          [3, 2],
          [2, 4],
          [4, 5],
        ],
      };
    }
  },
  async getMatrix() {
    try {
      const res = await fetch(`${API_BASE}/graph/cost_matrix`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return {
        nodes: [1, 2, 3, 4, 5, 6],
        matrix: [
          [0, 10, 25, 12, 18, 5],
          [10, 0, 15, 20, 28, 5],
          [25, 15, 0, 12, 22, 18],
          [12, 20, 12, 0, 10, 7],
          [18, 28, 22, 10, 0, 15],
          [5, 5, 18, 7, 15, 0],
        ],
      };
    }
  },
};

/**
 * =============================================================================
 * 📂 COMPONENTS / SHARED
 * =============================================================================
 */
const MapCanvas = ({
  nodes,
  edges,
  pathEdges = [],
  activeJobs = [],
  width = "100%",
  height = 350,
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
        }}
      >
        Sem dados de mapa
      </div>
    );

  const padding = 40;
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
        <marker
          id="arrow"
          markerWidth="6"
          markerHeight="6"
          refX="15"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={COLORS.edgeStandard} />
        </marker>
        <marker
          id="arrow-active"
          markerWidth="6"
          markerHeight="6"
          refX="15"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={strategyColor} />
        </marker>
      </defs>

      {edges.map((e) => {
        const n1 = nodes.find((n) => n.id === e.from_node);
        const n2 = nodes.find((n) => n.id === e.to_node);
        if (!n1 || !n2) return null;
        return (
          <line
            key={`edge-${e.id}`}
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke={COLORS.edgeStandard}
            strokeWidth="2"
            strokeOpacity="0.4"
            markerEnd="url(#arrow)"
          />
        );
      })}

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
            strokeWidth="4"
            strokeLinecap="round"
            markerEnd="url(#arrow-active)"
          />
        );
      })}

      {nodes.map((n) => {
        const job = getJobAtNode(n.id);
        return (
          <g key={`node-${n.id}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={job ? 12 : 8}
              fill={job ? COLORS.nodeAction : COLORS.nodeNormal}
              stroke="white"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))" }}
            />
            <text
              x={n.x}
              y={n.y - (job ? 18 : 14)}
              textAnchor="middle"
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                fill: "#334155",
                pointerEvents: "none",
              }}
            >
              {n.name}
            </text>
            {job && (
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  fill: "#1e293b",
                  pointerEvents: "none",
                }}
              >
                {job.type[0]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/**
 * =============================================================================
 * 📂 PAGES
 * =============================================================================
 */

// --- JOBS PAGE ---
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
              <th>ID</th>
              <th>Tipo</th>
              <th>Local</th>
              <th>Coords</th>
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
                        job.type === "Pickup" ? "badge-pickup" : "badge-dropoff"
                      }`}
                    >
                      {job.type}
                    </span>
                  </td>
                  <td>{node ? node.name : `Nó ${job.node_id}`}</td>
                  <td className="text-slate-500 text-xs">
                    ({node?.x}, {node?.y})
                  </td>
                </tr>
              );
            })}
            {jobs.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#94a3b8",
                  }}
                >
                  Sem dados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- WORK DAY PAGE ---
const WorkDayPage = ({
  dataset,
  onTopo,
  onGreedy,
  onOptimal,
  routeResult,
  topoResult,
  matrix,
}) => {
  const [activeCell, setActiveCell] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Barra de Ações */}
      <div
        className="card flex-row flex-wrap items-center justify-between"
        style={{ marginBottom: "0" }}
      >
        <div className="flex-row gap-4 items-center">
          <button onClick={onTopo} className="btn btn-action">
            <GitGraph size={18} /> Validar Precedências
          </button>

          <div className="divider-v"></div>

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
        {/* Mapa */}
        <div className="card" style={{ margin: 0 }}>
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
              style={{
                padding: "16px",
                backgroundColor: "#F2F6FA",
                borderRadius: "8px",
              }}
            >
              <p className="text-sm text-slate-500 mb-4 font-bold">
                Resumo da Execução:
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
                    unidades de tempo
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
                  <p
                    className="font-mono"
                    style={{ fontWeight: "500", color: "#334155" }}
                  >
                    {routeResult.job_order.join(" → ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Matriz */}
        <div
          className="card"
          style={{
            margin: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <h3 className="card-title">
            <Layout size={20} /> Matriz de Custos (C)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Clique nas células para ver o caminho.
          </p>
          <div style={{ flex: 1, overflow: "auto" }}>
            {matrix ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className="matrix-cell matrix-cell-header"></th>
                    {matrix.nodes.map((n) => (
                      <th key={n} className="matrix-cell matrix-cell-header">
                        {n}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.matrix.map((row, i) => (
                    <tr key={i}>
                      <td className="matrix-cell matrix-cell-header">
                        {matrix.nodes[i]}
                      </td>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          onClick={() =>
                            setActiveCell({
                              from: matrix.nodes[i],
                              to: matrix.nodes[j],
                              val: cell,
                            })
                          }
                          className={`matrix-cell ${
                            cell === 0 ? "matrix-cell-empty" : ""
                          }`}
                        >
                          {cell === null ? "∞" : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100px",
                  color: "#cbd5e1",
                }}
              >
                Carregando...
              </div>
            )}
          </div>
          {activeCell && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: "4px",
                color: "#1e40af",
                fontSize: "0.9rem",
              }}
            >
              <strong>
                Caminho {activeCell.from} → {activeCell.to}:
              </strong>{" "}
              Custo {activeCell.val}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPARISON PAGE ---
const ComparisonPage = ({
  dataset,
  greedyRes,
  optimalRes,
  onRunComparison,
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
            Analise o "Gap de Otimalidade".
          </p>
        </div>
        <button onClick={onRunComparison} className="btn btn-primary">
          <Play size={18} /> Executar Comparação
        </button>
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
                {greedyRes.total_cost}{" "}
                <span className="text-xs text-slate-500">s</span>
              </span>
            </div>
            <div
              style={{
                height: "250px",
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
                pathEdges={greedyRes.path_edges}
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
                {optimalRes.total_cost}{" "}
                <span className="text-xs text-slate-500">s</span>
              </span>
            </div>
            <div
              style={{
                height: "250px",
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
                pathEdges={optimalRes.path_edges}
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
                {(
                  ((greedyRes.total_cost - optimalRes.total_cost) /
                    optimalRes.total_cost) *
                  100
                ).toFixed(1)}
                % mais lento que o Ótimo.
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
            Clique em "Executar Comparação" para rodar os algoritmos.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * =============================================================================
 * 🎯 MAIN APP
 * =============================================================================
 */
const App = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [dataset, setDataset] = useState({ nodes: [], edges: [], jobs: [] });
  const [topoResult, setTopoResult] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compGreedy, setCompGreedy] = useState(null);
  const [compOptimal, setCompOptimal] = useState(null);

  useEffect(() => {
    handleLoadDefault();
    loadMatrix();
  }, []);

  const handleLoadDefault = async () => {
    try {
      await api.uploadDataset(MOCK_DATASET);
      setDataset(MOCK_DATASET);
    } catch (e) {
      setDataset(MOCK_DATASET);
    }
  };

  const loadMatrix = async () => {
    const m = await api.getMatrix();
    setMatrix(m);
  };

  const handleTopo = async () => {
    setLoading(true);
    const res = await api.getTopo();
    setTopoResult(res);
    setLoading(false);
  };

  const handleRunStrategy = async (strategy) => {
    setLoading(true);
    const res =
      strategy === "greedy" ? await api.getGreedy(1) : await api.getOptimal(1);
    setRouteResult(res);
    setLoading(false);
  };

  const handleComparison = async () => {
    setLoading(true);
    const g = await api.getGreedy(1);
    const o = await api.getOptimal(1);
    setCompGreedy(g);
    setCompOptimal(o);
    setLoading(false);
  };

  return (
    <>
      <style>{APP_STYLES}</style>
      <div className="app-container">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <MapIcon size={24} /> RouteOpt
            </div>
            <div className="sidebar-subtitle">Otimizador Logístico</div>
          </div>
          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`btn btn-nav ${activeTab === "jobs" ? "active" : ""}`}
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

        {/* MAIN CONTENT */}
        <main className="main-content">
          <header className="header">
            <h2 className="header-title">
              {activeTab === "jobs" && "Gerenciamento de Tarefas"}
              {activeTab === "workday" && "Painel Operacional"}
              {activeTab === "compare" && "Análise de Algoritmos"}
            </h2>
            <div className="header-actions">
              <a className="text-link">
                <Upload size={16} style={{ marginRight: "4px" }} /> Upload
                Dataset
              </a>
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
                matrix={matrix}
              />
            )}
            {activeTab === "compare" && (
              <ComparisonPage
                dataset={dataset}
                greedyRes={compGreedy}
                optimalRes={compOptimal}
                onRunComparison={handleComparison}
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
                    borderTopColor: "#1E3A5F",
                    borderRadius: "50%",
                    marginBottom: "16px",
                  }}
                ></div>
                <p style={{ fontWeight: "bold", color: "#1E3A5F" }}>
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
