from fastapi import FastAPI
from app.routers import dataset

app = FastAPI()

@app.get('/')
def root():
    return {'message': 'Backend funcionando!'}
