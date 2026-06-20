import os
import chromadb

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./ai/chromadb")
CHROMADB_HOST = os.getenv("CHROMADB_HOST", None)
CHROMADB_PORT = os.getenv("CHROMADB_PORT", None)

if CHROMADB_HOST and CHROMADB_PORT:
    # Remote/Containerized Chroma server client
    chroma_client = chromadb.HttpClient(host=CHROMADB_HOST, port=int(CHROMADB_PORT))
else:
    # Persistent local storage
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)

def get_collection(name: str):
    """
    Get or create a ChromaDB collection by name.
    Useful collections:
      - 'user_profiles' (for registration duplicates check)
      - 'submission_profiles' (for submission expertise matching)
    """
    return chroma_client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"}
    )
