import os
import json
import google.generativeai as genai

# Setup Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_project_feedback(project_title: str, description: str, scores: dict) -> str:
    """
    Calls Gemini 1.5 Flash to generate constructive feedback for a hackathon project.
    Falls back to a pre-defined local template if the API key is missing or calls fail.
    """
    prompt = (
        f"Generate exactly 3 sentences of constructive and professional feedback for this hackathon project.\n"
        f"Project Title: {project_title}\n"
        f"Project Description: {description}\n"
        f"Evaluations Rubric: {json.dumps(scores)}\n"
        f"Be encouraging, highlight a strength based on the scores, and offer one technical area for improvement."
    )
    
    if not GEMINI_API_KEY:
        return _get_fallback_feedback(project_title)
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API call failed: {e}. Falling back to template.")
        return _get_fallback_feedback(project_title)

def _get_fallback_feedback(project_title: str) -> str:
    # Load fallback templates from local mock JSON file
    fallback_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), 
        "mock_responses", 
        "feedback.json"
    )
    
    try:
        with open(fallback_path, "r") as f:
            data = json.load(f)
            # Find matching or return first default
            feedbacks = data.get("feedbacks", [])
            for item in feedbacks:
                if item.get("title", "").lower() in project_title.lower():
                    return item.get("feedback")
            if feedbacks:
                return feedbacks[0].get("feedback")
    except Exception:
        pass
        
    return (
        f"Great work on '{project_title}'! The prototype shows substantial innovation "
        f"and solves a real-world problem. For future iterations, consider optimizing code modularity "
        f"and expanding the test coverage to support scaling."
    )
