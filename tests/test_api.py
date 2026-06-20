import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    """
    Test root health check endpoint.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert response.json()["docs_url"] == "/docs"

def test_auth_register_validation():
    """
    Ensure the validation returns error when fields are missing.
    """
    response = client.post("/auth/register", json={})
    assert response.status_code == 422  # Unprocessable Entity
