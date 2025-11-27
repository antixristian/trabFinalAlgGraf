import sqlite3

def fet_connection():
    return sqlite3.connect("grafos.db")