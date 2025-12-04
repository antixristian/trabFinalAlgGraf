from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dataset, graph, jobs, routes

app = FastAPI()

# Libera o frontend (Vite em 5173) acessar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend funcionando!"}

app.include_router(dataset.router, prefix="/dataset")
app.include_router(graph.router,   prefix="/graph")
app.include_router(jobs.router,    prefix="/jobs")
app.include_router(routes.router,  prefix="/routes")
