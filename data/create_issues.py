import subprocess
import sys

# Define all 14 issues with titles and descriptions
issues = [
    {
        "title": "Core Database Relations and Migrations Setup",
        "priority": "High (Blocker)",
        "description": "Ensure the database tables are properly initialized in PostgreSQL based on our SQLAlchemy configurations in backend/models.py. Verify that connections pool correctly and foreign key constraints behave correctly under operations like cascade deletion.",
        "reference": "backend/models.py, backend/database.py",
        "criteria": [
            "Running data/seed.py successfully creates all schemas and populates table values without syntax or constraint failures.",
            "Connection pool handles up to 20 concurrent connections.",
            "Cascading deletions delete child dependencies (e.g. deleting a Team deletes its Submissions)."
        ]
    },
    {
        "title": "JWT Auth & Custom Role Authorization Guards",
        "priority": "High",
        "description": "Implement full token signing and validation pipelines in backend/auth.py. Expose /auth/register and /auth/login endpoints. Ensure that role checks (require_participant, require_reviewer, require_organizer) block access appropriately on restricted API routes.",
        "reference": "backend/auth.py, backend/routers/auth.py",
        "criteria": [
            "User password stored in DB as bcrypt hashed.",
            "'/auth/login' returns a valid JWT access token and refresh token.",
            "Requests to organizer routes (e.g. '/review/assign') with a participant token return 403 Forbidden."
        ]
    },
    {
        "title": "Celery Task Broker Routing & Redis Integration",
        "priority": "Medium",
        "description": "Verify the Redis connection for Celery task queuing defined in backend/celery_app.py. Ensure the task queues process asynchronous tasks in the background without blocking FastAPI response threads.",
        "reference": "backend/celery_app.py, docker-compose.yml",
        "criteria": [
            "Running 'celery -A backend.celery_app worker --loglevel=info' launches cleanly.",
            "Async tasks can be enqueued and return task IDs."
        ]
    },
    {
        "title": "Asynchronous Semantic Duplicate Detection",
        "priority": "High",
        "description": "Implement the duplicate checker task inside ai/tasks/duplicate.py. Concatenate user information, generate vectors using sentence-transformers via ai/models/embedder.py, store them in ChromaDB, and flag registrations having similarity index > 0.85.",
        "reference": "ai/tasks/duplicate.py, ai/models/embedder.py, ai/chroma_client.py",
        "criteria": [
            "Embeddings generated on CPU take less than 100ms per registration.",
            "Triggering registration duplicate checks flags duplicates in the duplicate_flags table.",
            "Unit tests in tests/test_duplicate.py pass successfully."
        ]
    },
    {
        "title": "Custom NER Technology Skill Extraction",
        "priority": "Medium",
        "description": "Complete the skill extraction pipeline inside ai/tasks/skills.py using the spaCy parser defined in ai/models/ner.py. Add patterns for at least 50+ technology terms.",
        "reference": "ai/tasks/skills.py, ai/models/ner.py, tests/test_skills.py",
        "criteria": [
            "Parsing free-form bios successfully extracts tags (e.g. 'I love python and react' -> ['python', 'react']).",
            "Extracted skills are committed to the users table."
        ]
    },
    {
        "title": "Hungarian Reviewer-to-Submission Matcher",
        "priority": "High",
        "description": "Build the cost matrix calculations inside ai/tasks/assignment.py. Use ai/models/matcher.py to resolve global optimal assignments minimizing conflict of interest and balancing load factor.",
        "reference": "ai/tasks/assignment.py, ai/models/matcher.py, tests/test_assignment.py",
        "criteria": [
            "Reviewers from the same institution as a team member are assigned a matching score of 0.0 (flagged as conflict).",
            "Optimal assignment is solved globally in under 5 seconds for 100 submissions."
        ]
    },
    {
        "title": "Z-Score Statistical Reviewer Bias Monitoring",
        "priority": "High (Core Differentiator)",
        "description": "Implement statistical outlier calculation inside ai/tasks/bias.py and ai/models/bias_detector.py. Group submissions by gender, institution, and geographic location to identify reviewer scores deviating significantly from group means (|z-score| > 2.0).",
        "reference": "ai/tasks/bias.py, ai/models/bias_detector.py, backend/websocket.py, tests/test_bias.py",
        "criteria": [
            "Triggering score checks flags scores with high standard deviation deviations.",
            "Flagged records are logged inside the bias_alerts table.",
            "Real-time alerts broadcast JSON payloads over WebSockets."
        ]
    },
    {
        "title": "Gemini API Integration for Project Feedback",
        "priority": "Medium",
        "description": "Implement ai/models/llm.py to connect with the Google Gemini 1.5 Flash API to generate constructive feedback paragraphs. Fall back gracefully to templates in ai/mock_responses/feedback.json if the API key is missing or offline.",
        "reference": "ai/models/llm.py, ai/mock_responses/feedback.json",
        "criteria": [
            "Generated feedback contains exactly 3 sentences highlighting a project strength and key area for technical improvement.",
            "Mock fallback triggers seamlessly if API key is empty or network request timeout occurs."
        ]
    },
    {
        "title": "Next.js Theme, Styling, and Zustand Stores Setup",
        "priority": "High",
        "description": "Initialize global styling in globals.css using custom HSL colors to create a modern dark mode design. Create the layout wrappers, configure Tailwind configs, and create Zustand global stores for token authorization caching.",
        "reference": "frontend/app/globals.css, frontend/app/layout.tsx, frontend/package.json",
        "criteria": [
            "App loads cleanly with modern font styles.",
            "Global state retains login token, user profiles, and active event IDs."
        ]
    },
    {
        "title": "Multi-Step Registration and Submissions Forms",
        "priority": "High",
        "description": "Create the Participant registration flow page with field validation. Create project submission forms with input fields for GitHub, demo URLs, tracks, and tech stacks.",
        "reference": "backend/routers/register.py, backend/routers/submit.py",
        "criteria": [
            "Successful registration shows success status and triggers background duplicate extraction checks.",
            "Submitting projects blocks invalid URLs and alerts user on validation errors."
        ]
    },
    {
        "title": "Real-time Bias Alerts Panel & Organizer Control Dashboard",
        "priority": "High",
        "description": "Build the Organizer Panel view. Implement WebSocket hooks using socket.io-client to listen for incoming bias alerts, displaying them dynamically with an outlier explanation and a 'Resolve' button.",
        "reference": "backend/routers/bias.py, backend/websocket.py",
        "criteria": [
            "Incoming alerts appear on the dashboard in real-time without manual page refreshes.",
            "Clicking 'Resolve' makes a PATCH call to the backend and hides/dismisses the alert card."
        ]
    },
    {
        "title": "Analytics Dashboard (Recharts Data Rendering)",
        "priority": "Medium",
        "description": "Implement the analytics dashboard page utilizing Recharts graphs. Read JSON payload structures from the /analytics/{event_id} endpoint.",
        "reference": "backend/routers/analytics.py",
        "criteria": [
            "Displays registration timelines as Line charts.",
            "Shows track distributions as Bar/Pie charts.",
            "Completes gauges mapping judging completion progress metrics."
        ]
    },
    {
        "title": "Animated Leaderboard Reveal and Feedback Cards",
        "priority": "Medium",
        "description": "Build the final rankings results page. Animate the reveal of the top 3 projects, and render cards matching each team's score alongside their AI-generated feedback paragraph.",
        "reference": "backend/routers/results.py",
        "criteria": [
            "WebSocket broadcasts animate the reveal sequence automatically.",
            "Project lists support detail modal popups."
        ]
    },
    {
        "title": "Comprehensive Seeding Data & Setup Scripts",
        "priority": "High",
        "description": "Create a single, one-command setup script (setup.sh or setup.bat) to automate the installation of Node/Python environments, run the database migrations, and seed mock users, reviewer expertise profiles, and submissions (including a few predefined biased scores for demo demonstration).",
        "reference": "data/demo_data.sql, data/seed.py",
        "criteria": [
            "Running setup installs all requirements and builds frontend cleanly.",
            "Seeding database generates 50+ users, duplicates, and scores."
        ]
    }
]

def check_gh_auth():
    try:
        res = subprocess.run(["gh", "auth", "status"], capture_output=True, text=True)
        if res.returncode != 0:
            return False
        return True
    except FileNotFoundError:
        print("Error: GitHub CLI ('gh') is not installed or not in PATH.")
        sys.exit(1)

def create_github_issues():
    if not check_gh_auth():
        print("----------------------------------------------------------------------")
        print("CRITICAL: You are not logged into GitHub CLI ('gh').")
        print("Please authenticate first by running this command in your terminal:")
        print("    gh auth login")
        print("Once authenticated, re-run this script to automatically populate all issues.")
        print("----------------------------------------------------------------------")
        return

    print("Authenticated successfully. Starting issue creation...")
    
    for i, issue in enumerate(issues, 1):
        title = issue["title"]
        priority = issue["priority"]
        description = issue["description"]
        ref = issue["reference"]
        criteria_list = "\n".join(f"- [ ] {item}" for item in issue["criteria"])
        
        body = (
            f"### 📋 Description\n"
            f"{description}\n\n"
            f"### ⚙️ Reference Files\n"
            f"Refer to target files: `{ref}`\n\n"
            f"### 🏁 Acceptance Criteria\n"
            f"{criteria_list}\n\n"
            f"**Priority**: {priority}"
        )
        
        print(f"[{i}/{len(issues)}] Creating issue: '{title}'...")
        try:
            cmd = ["gh", "issue", "create", "--title", title, "--body", body]
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to create issue '{title}': {e}")
            break

    print("\nAll tasks completed!")

if __name__ == "__main__":
    create_github_issues()
