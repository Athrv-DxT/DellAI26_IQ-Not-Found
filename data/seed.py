import os
from sqlalchemy import text
from backend.database import engine

def seed_database():
    """
    Utility script to seed high-fidelity synthetic demo data into PostgreSQL.
    """
    sql_file_path = os.path.join(os.path.dirname(__file__), "demo_data.sql")
    
    if not os.path.exists(sql_file_path):
        print(f"Seed file '{sql_file_path}' does not exist.")
        return
        
    print(f"Seeding database from: {sql_file_path}")
    
    with open(sql_file_path, "r") as f:
        statements = f.read().split(";")
        
    with engine.begin() as connection:
        for statement in statements:
            cleaned_statement = statement.strip()
            if not cleaned_statement or cleaned_statement.startswith("--"):
                continue
            try:
                connection.execute(text(cleaned_statement))
            except Exception as e:
                print(f"Error executing SQL statement: {e}")
                
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
