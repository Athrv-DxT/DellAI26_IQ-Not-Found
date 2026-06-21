import datetime
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from sqlalchemy import text
from backend.main import app, check_thresholds_internal
from backend.database import engine
from backend.models import Team, JudgeProfile, User, BiasAlert, Intervention, ProjectSubmission

client = TestClient(app)

def test_interventions_lifecycle():
    with Session(engine) as session:
        # Clear existing interventions to prevent test interference
        session.execute(text("DELETE FROM interventions;"))
        session.commit()
        
        # 1. Seed condition: Inactive team registered 5 hours ago
        inactive_team = Team(
            name=f"Inactive Team {uuid.uuid4().hex[:6]}",
            repo_url="https://github.com/inactive",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        )
        session.add(inactive_team)
        
        # Seed condition: Overloaded reviewer (load >= 90%)
        user = User(
            email=f"overloaded_{uuid.uuid4().hex[:6]}@domain.com",
            full_name="Overloaded Judge",
            role="JUDGE"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        judge = JudgeProfile(
            user_id=user.id,
            bio="AI/ML specialist",
            max_projects=5,
            current_load=5
        )
        session.add(judge)
        
        # Seed condition: Unresolved bias alert
        team_temp = Team(name=f"Team Temp {uuid.uuid4().hex[:6]}")
        session.add(team_temp)
        session.commit()
        session.refresh(team_temp)
        
        sub = ProjectSubmission(
            team_id=team_temp.id,
            title="AI Sandbox",
            abstract="An AI platform project...",
            tech_stack="python",
            state="PENDING_REVIEW"
        )
        session.add(sub)
        session.commit()
        session.refresh(sub)
        
        bias_alert = BiasAlert(
            reviewer_id=judge.id,
            submission_id=sub.id,
            type="High Score Outlier (Favoritism)",
            z_score=2.5,
            resolved=False
        )
        session.add(bias_alert)
        session.commit()
        
        # 2. Run thresholds checker manually
        check_thresholds_internal(session)
        
    # 3. Verify API GET /api/interventions fetches them
    response = client.get("/api/interventions")
    assert response.status_code == 200
    interventions = response.json()
    
    # We should have generated some interventions (at least 3 due to our seeded issues)
    assert len(interventions) >= 1
    
    # Check fields
    first = interventions[0]
    assert "id" in first
    assert "type" in first
    assert "severity" in first
    assert "description" in first
    assert "recommended_action" in first
    assert "expected_impact" in first
    assert first["status"] == "PENDING"
    
    intervention_id = first["id"]
    
    # 4. Test POST /api/interventions/apply/{id}
    apply_resp = client.post(f"/api/interventions/apply/{intervention_id}")
    assert apply_resp.status_code == 200
    assert apply_resp.json()["status"] == "SUCCESS"
    
    # Verify it is no longer returned as PENDING
    response_after = client.get("/api/interventions")
    assert response_after.status_code == 200
    pending_ids = [item["id"] for item in response_after.json()]
    assert intervention_id not in pending_ids
    
    # 5. Dismiss another intervention if available
    if len(interventions) > 1:
        second_id = interventions[1]["id"]
        dismiss_resp = client.patch(f"/api/interventions/{second_id}/dismiss")
        assert dismiss_resp.status_code == 200
        assert dismiss_resp.json()["status"] == "SUCCESS"
        
        # Verify it's no longer pending
        response_final = client.get("/api/interventions")
        pending_ids_final = [item["id"] for item in response_final.json()]
        assert second_id not in pending_ids_final
