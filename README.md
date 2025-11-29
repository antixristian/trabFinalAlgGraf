# Back-End

## Instalar dependências (na pasta `backend`)
```bash
py -m pip install -r requirements.txt
````

## Criar/atualizar o banco de dados

```bash
py app\database\init_db.py
```

## Subir o servidor FastAPI

```bash
py -m uvicorn app.main:app --reload
```

## Acessar a documentação da API

Abra no navegador:

```text
http://localhost:8000/docs
```