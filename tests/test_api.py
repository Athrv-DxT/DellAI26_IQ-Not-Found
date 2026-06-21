import uuid
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    """
    Test root health check endpoint.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert response.json()["docs_url"] == "/docs"

def test_auth_register_validation():
    """
    Ensure the validation returns error when fields are missing.
    """
    response = client.post("/auth/register", json={})
    assert response.status_code == 422  # Unprocessable Entity

def test_full_auth_lifecycle():
    """
    Test user registration, login, token refresh, and profile fetching.
    """
    unique_id = uuid.uuid4().hex[:6]
    email = f"user_{unique_id}@hackathon.com"
    password = "supersecurepassword123"
    
    # 1. Register User
    reg_payload = {
        "name": "Integration Tester",
        "email": email,
        "password": password,
        "role": "participant",
        "gender": "Male",
        "institution": "University of Austin",
        "location": "Austin, TX"
    }
    
    reg_response = client.post("/auth/register", json=reg_payload)
    assert reg_response.status_code == 201
    assert reg_response.json()["email"] == email
    assert reg_response.json()["role"] == "participant"
    assert "id" in reg_response.json()
    
    # 2. Login User
    login_payload = {
        "username": email,
        "password": password
    }
    login_response = client.post("/auth/login", data=login_payload)
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"
    
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]
    
    # 3. Fetch User Profile (/auth/me) with Access Token
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = client.get("/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email
    
    # 4. Refresh Token
    refresh_payload = {
        "refresh_token": refresh_token
    }
    refresh_response = client.post("/auth/refresh", json=refresh_payload)
    assert refresh_response.status_code == 200
    new_tokens = refresh_response.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    
    new_access_token = new_tokens["access_token"]
    
    # 5. Access profile using new Access Token
    new_headers = {"Authorization": f"Bearer {new_access_token}"}
    new_me_response = client.get("/auth/me", headers=new_headers)
    assert new_me_response.status_code == 200
    assert new_me_response.json()["email"] == email

def test_invalid_login():
    """
    Ensure logging in with invalid details returns 401.
    """
    login_payload = {
        "username": "nonexistent_email@domain.com",
        "password": "wrongpassword"
    }
    response = client.post("/auth/login", data=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_invalid_tokens():
    """
    Verify profile fetch returns 401 with invalid bearer token.
    """
    headers = {"Authorization": "Bearer invalid_bearer_token_string"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

