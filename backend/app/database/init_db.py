import sqlite3

def init_db():
    conn = sqlite3.connect("grafos.db")
    with open("app/database/schema.sql", "r") as f:
        schema = f.read()
    conn.executescript(schema)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Banco criado com sucesso!")