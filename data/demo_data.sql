-- ==========================================
-- Synthetic Demo Data Seeds for Local Validation
-- Dell Hackathon 2026
-- ==========================================

-- 1. SEED USERS (Organizers, Reviewers, and Participants)
-- Passwords are set to 'password' (bcrypt hash '$2b$12$K89a.Yx5yV5N7Gq/99PqaehQh5YV0kQyWvFz5s1l5l3rQzW7a2Xey')
INSERT INTO users (id, name, email, password, role, skills, gender, institution, location) VALUES
('a3c8e404-51e9-4e78-bead-55a0b7ef1441', 'Organizer Alice', 'alice@hackathon.com', '$2b$12$K89a.Yx5yV5N7Gq/99PqaehQh5YV0kQyWvFz5s1l5l3rQzW7a2Xey', 'organizer', '{}', 'Female', 'Dell Inc.', 'Dallas, TX'),
('b3c8e404-51e9-4e78-bead-55a0b7ef1442', 'Reviewer Bob', 'bob@reviewer.com', '$2b$12$K89a.Yx5yV5N7Gq/99PqaehQh5YV0kQyWvFz5s1l5l3rQzW7a2Xey', 'reviewer', '{"machine learning", "nlp", "python"}', 'Male', 'Stanford University', 'San Francisco, CA'),
('b3c8e404-51e9-4e78-bead-55a0b7ef1443', 'Reviewer Clara', 'clara@reviewer.com', '$2b$12$K89a.Yx5yV5N7Gq/99PqaehQh5YV0kQyWvFz5s1l5l3rQzW7a2Xey', 'reviewer', '{"web dev", "react", "next.js"}', 'Female', 'MIT', 'Boston, MA'),
('c3c8e404-51e9-4e78-bead-55a0b7ef1444', 'Participant David', 'david@gmail.com', '$2b$12$K89a.Yx5yV5N7Gq/99PqaehQh5YV0kQyWvFz5s1l5l3rQzW7a2Xey', 'participant', '{"python", "pandas"}', 'Male', 'University of Texas', 'Austin, TX'),
('c3c8e404-51e9-4e78-bead-55a0b7ef1445', 'Participant Emma', 'emma@gmail.com', '$2b$12$K89a.Yx5yV5N7Gq/99PqaehQh5YV0kQyWvFz5s1l5l3rQzW7a2Xey', 'participant', '{"react", "tailwind"}', 'Female', 'University of Texas', 'Austin, TX')
ON CONFLICT (email) DO NOTHING;

-- 2. SEED REVIEWER PROFILES
INSERT INTO reviewer_profiles (id, user_id, expertise_areas, max_assignments, current_load) VALUES
('d3c8e404-51e9-4e78-bead-55a0b7ef1446', 'b3c8e404-51e9-4e78-bead-55a0b7ef1442', '{"machine learning", "nlp", "python"}', 5, 0),
('d3c8e404-51e9-4e78-bead-55a0b7ef1447', 'b3c8e404-51e9-4e78-bead-55a0b7ef1443', '{"web dev", "react", "next.js"}', 5, 0)
ON CONFLICT DO NOTHING;

-- 3. SEED EVENT
INSERT INTO events (id, title, theme, description, status, max_teams, team_size, organizer_id) VALUES
('e3c8e404-51e9-4e78-bead-55a0b7ef1448', 'Dell AI Innovations Hackathon 2026', 'AI for Sustainable Smart Cities', 'Build solutions to tackle sustainability, waste management, and traffic flow optimizing algorithms.', 'registration', 50, 4, 'a3c8e404-51e9-4e78-bead-55a0b7ef1441')
ON CONFLICT DO NOTHING;

-- 4. SEED TEAM
INSERT INTO teams (id, event_id, name, members) VALUES
('f3c8e404-51e9-4e78-bead-55a0b7ef1449', 'e3c8e404-51e9-4e78-bead-55a0b7ef1448', 'GreenCycle Tech', '{"c3c8e404-51e9-4e78-bead-55a0b7ef1444", "c3c8e404-51e9-4e78-bead-55a0b7ef1445"}')
ON CONFLICT DO NOTHING;
