from backend.celery_app import celery_app
from backend.database import SessionLocal
from backend.models import User, DuplicateFlag
from ai.models.embedder import embedder
from ai.chroma_client import get_collection

@celery_app.task(name="ai.tasks.duplicate.detect_duplicate_registration")
def detect_duplicate_registration(user_id: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return f"User {user_id} not found."
            
        # Concatenate features for duplicate detection embedding
        features_text = f"Name: {user.name} | Email: {user.email} | Institution: {user.institution or ''}"
        vector = embedder.get_embedding(features_text)
        
        # Save embedding to ChromaDB
        collection = get_collection("user_profiles")
        
        # Search for similar entries before adding
        results = collection.query(
            query_embeddings=[vector],
            n_results=5
        )
        
        # Process query results and flag if cosine similarity > 0.85
        # Note: ChromaDB returns distances (usually L2 or cosine distance). 
        # For cosine space, cosine_distance = 1 - cosine_similarity.
        # Thus similarity > 0.85 matches distance < 0.15.
        if results and 'distances' in results and len(results['distances']) > 0:
            for doc_id, dist in zip(results['ids'][0], results['distances'][0]):
                if doc_id == str(user.id):
                    continue
                    
                similarity = 1.0 - dist
                if similarity > 0.85:
                    # Duplicate detected, create DB flag
                    flag = DuplicateFlag(
                        original_user=doc_id,
                        duplicate_user=user.id,
                        similarity=similarity,
                        resolved=False
                    )
                    db.add(flag)
                    
            db.commit()
            
        # Add current user to ChromaDB collection
        collection.add(
            documents=[features_text],
            embeddings=[vector],
            ids=[str(user.id)]
        )
        
        return f"Duplicate detection complete for user {user.name}."
    finally:
        db.close()
