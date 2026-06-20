from backend.celery_app import celery_app
from backend.database import SessionLocal
from backend.models import User
from ai.models.ner import skill_extractor

@celery_app.task(name="ai.tasks.skills.extract_skills_from_bio")
def extract_skills_from_bio(user_id: str, bio_text: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return f"User {user_id} not found."
            
        # Extract skills using spaCy Custom NER/EntityRuler
        extracted_skills = skill_extractor.extract_skills(bio_text)
        
        if extracted_skills:
            # Merge with existing skills if any, removing duplicates
            existing_skills = set(user.skills or [])
            updated_skills = list(existing_skills.union(extracted_skills))
            user.skills = updated_skills
            db.commit()
            return f"Extracted skills {extracted_skills} for user {user.name}."
            
        return f"No skills extracted for user {user.name}."
    finally:
        db.close()
