import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

SCHEMA_PATH = BASE_DIR / "schema.sql"         # .../app/database/schema.sql
DB_PATH = BASE_DIR.parent / "grafos.db"       # .../app/grafos.db

def init_db():
    conn = sqlite3.connect(DB_PATH)
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = f.read()
    conn.executescript(schema)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Banco criado com sucesso!")
