#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "================================================================="
echo "   Dell Future Minds AI Hackathon Platform Setup Script"
echo "================================================================="

# 1. Setup Python Virtual Environment & Install Dependencies
echo "Step 1: Installing backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    python -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

# 2. Setup Node.js Frontend Dependencies
echo "Step 2: Installing frontend dependencies..."
cd frontend
npm install
cd ..

# 3. Start Database Service (Docker Compose)
echo "Step 3: Starting PostgreSQL database container..."
docker compose up -d

# Wait for PostgreSQL to become ready
echo "Waiting for database to be healthy..."
until docker exec hackathon_db pg_isready -U postgres -d hackathon_os; do
  sleep 1
done
echo "Database is healthy and ready!"

# 4. Import synthetic demo data
echo "Step 4: Importing synthetic demo data into hackathon_os..."
PGPASSWORD=password psql -h localhost -U postgres -d hackathon_os -f data/demo_data.sql

# 5. Start servers
echo "Step 5: Starting servers..."
echo "Starting FastAPI Backend Server on port 8000..."
cd backend
source venv/bin/activate
nohup uvicorn main:app --port 8000 --host 0.0.0.0 > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started in background with PID: $BACKEND_PID"
cd ..

echo "Starting Next.js Frontend Server on port 3000..."
cd frontend
nohup npm run dev -- -p 3000 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started in background with PID: $FRONTEND_PID"
cd ..

echo "================================================================="
echo "🎉 Setup complete! The platform is now running."
echo "- Backend API: http://localhost:8000"
echo "- Next.js Frontend: http://localhost:3000"
echo "- Admin Console: http://localhost:3000/organizer"
echo "- Participant/Judge Portal: http://localhost:3000/portal"
echo "- Analytics Dashboard: http://localhost:3000/analytics"
echo "================================================================="
