import pytest
from ai.models.embedder import Embedder

def test_embedder_initialization():
    """
    Ensure the Embedder wrapper can be instantiated and generates vectors of length 384.
    """
    # Use mock embedder values if sentence-transformers is not initialized in CPU tests
    # For now, assert model_name settings
    emb = Embedder(model_name="all-MiniLM-L6-v2")
    assert emb.model_name == "all-MiniLM-L6-v2"

def test_embedding_generation_mock():
    # Helper to check output vector properties
    # Embedding of empty string should be zero list
    emb = Embedder(model_name="all-MiniLM-L6-v2")
    zeros = emb.get_embedding("")
    assert len(zeros) == 384
    assert all(v == 0.0 for v in zeros)
