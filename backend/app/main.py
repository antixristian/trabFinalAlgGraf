from fastapi import FastAPI
from app.routers import dataset

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend funcionando!"}

app.include_router(dataset.router, prefix="/dataset")
