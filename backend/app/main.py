from fastapi import FastAPI
from app.routers import dataset, graph, jobs, routes

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend funcionando!"}

app.include_router(dataset.router, prefix="/dataset")
app.include_router(graph.router,   prefix="/graph")
app.include_router(jobs.router,    prefix="/jobs")
app.include_router(routes.router,  prefix="/routes")
