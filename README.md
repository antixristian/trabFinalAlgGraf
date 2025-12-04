# Sistema de Entregas Eficiente

## Sobre o projeto

Este projeto implementa um **sistema de entregas baseado em grafos**, onde:

- O **grafo viário** (tabelas `nodes` e `edges`) representa os locais e as conexões entre eles.
- Os **jobs** (tabela `jobs`) representam tarefas de pickup/dropoff associadas a nós do grafo.
- As **precedências** (tabela `precedences`) definem a ordem em que os jobs devem ser executados.

No back-end (FastAPI + SQLite) são implementados:

- Cálculo de **caminhos mínimos** com Dijkstra (`/graph/path`, `/graph/cost_matrix`).
- Verificação e **ordenação topológica** dos jobs (`/jobs/topo`).
- Geração de rotas **gulosas** e **ótimas (Programação Dinâmica)** respeitando precedências (`/routes/greedy`, `/routes/optimal`).

No front-end (React + Vite) é exibido:

- O grafo viário de forma visual.
- A lista de jobs e suas localizações.
- As rotas geradas (gulosa x ótima), com comparação de custo.

---

## Back-End

### Instalar dependências (na pasta `backend`)

```bash
py -m pip install -r requirements.txt
````

### Criar/atualizar o banco de dados

```bash
py app\database\init_db.py
```

### Subir o servidor FastAPI

```bash
py -m uvicorn app.main:app --reload
```

### Acessar a documentação da API

Abra no navegador:

```text
http://localhost:8000/docs
```

---

## Front-End

### Instalar dependências (na pasta `frontend`)

```bash
npm install
```

### Subir o front-end (Vite)

```bash
npm run dev
```

Por padrão, o Vite sobe em algo como:

```text
http://localhost:5173
```

> Certifique-se de que o **back-end** (`http://localhost:8000`) está rodando antes de usar o front-end.

