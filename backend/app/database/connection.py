import sqlite3

def get_connection():
    conn = sqlite3.connect("grafos.db")
    conn.execute("PRAGMA foreign_keys = 1")
    return conn
