-- Campus Event Management System (CEMS)
-- Sample Seed Data

USE campus_event_management;

-- Password for all sample users is: password123

-- Insert Users with Institutional Affiliation (College / School)
INSERT INTO users (id, name, email, password, role, institution, department, phone, is_active) VALUES
(1, 'John Admin', 'admin@example.com', '$2a$10$tZcW1b.mFjM8nO8J1r6c9u1e7u5hV8n8oK4c2v0e8r4t6y2u0i8w', 'ADMIN', 'Campus Administration', 'Administration', '+1-555-0101', TRUE),
(2, 'Dr. Sarah Smith', 'faculty@example.com', '$2a$10$tZcW1b.mFjM8nO8J1r6c9u1e7u5hV8n8oK4c2v0e8r4t6y2u0i8w', 'FACULTY', 'College of Engineering', 'Computer Science', '+1-555-0102', TRUE),
(3, 'Alex Organizer', 'organizer@example.com', '$2a$10$tZcW1b.mFjM8nO8J1r6c9u1e7u5hV8n8oK4c2v0e8r4t6y2u0i8w', 'ORGANIZER', 'College of Engineering', 'Student Council', '+1-555-0103', TRUE),
(4, 'Emily Student', 'student@example.com', '$2a$10$tZcW1b.mFjM8nO8J1r6c9u1e7u5hV8n8oK4c2v0e8r4t6y2u0i8w', 'STUDENT', 'College of Engineering', 'Information Technology', '+1-555-0104', TRUE),
(5, 'Michael Student', 'student2@example.com', '$2a$10$tZcW1b.mFjM8nO8J1r6c9u1e7u5hV8n8oK4c2v0e8r4t6y2u0i8w', 'STUDENT', 'College of Engineering', 'Computer Science', '+1-555-0105', TRUE),
(6, 'Prof. Robert Taylor', 'faculty_arts@example.com', '$2a$10$tZcW1b.mFjM8nO8J1r6c9u1e7u5hV8n8oK4c2v0e8r4t6y2u0i8w', 'FACULTY', 'College of Arts & Sciences', 'Fine Arts', '+1-555-0106', TRUE),
(7, 'David ArtsOrganizer', 'organizer_arts@example.com', '$2a$10$tZcW1b.mFjM8nO8J1r6c9u1e7u5hV8n8oK4c2v0e8r4t6y2u0i8w', 'ORGANIZER', 'College of Arts & Sciences', 'Cultural Society', '+1-555-0107', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Events
INSERT INTO events (id, title, description, category, event_date, start_time, end_time, location, capacity, organizer_id, status, rejection_reason) VALUES
(1, 'Annual Hackathon 2026', 'A 24-hour non-stop coding hackathon with exciting real-world problem statements, mentorship from industry experts, and cash prizes for top teams.', 'Hackathon', DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY), '09:00:00', '18:00:00', 'Tech Park Auditorium A', 100, 3, 'APPROVED', NULL),
(2, 'AI & Machine Learning Workshop', 'Hands-on practical workshop covering deep learning fundamentals, neural networks, PyTorch, and LLM fine-tuning techniques for modern applications.', 'Workshop', DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY), '10:00:00', '16:00:00', 'CS Computer Lab 3', 45, 3, 'APPROVED', NULL),
(3, 'Inter-College Cultural Fest - Resonance', 'Annual flagship cultural festival showcasing dance, music, drama, fashion shows, and art competitions from colleges across the state.', 'Cultural', DATE_ADD(CURRENT_DATE(), INTERVAL 21 DAY), '16:00:00', '22:00:00', 'Campus Open Amphitheatre', 300, 7, 'APPROVED', NULL),
(4, 'Cloud Computing & DevOps Seminar', 'Interactive session by senior architects discussing Kubernetes, Docker, CI/CD automation pipelines, and scalable cloud microservices.', 'Seminar', DATE_ADD(CURRENT_DATE(), INTERVAL 10 DAY), '14:00:00', '17:00:00', 'Seminar Hall B', 60, 3, 'PENDING', NULL),
(5, 'Campus Basketball Championship', 'Inter-department 3x3 and 5x5 basketball tournament. Trophies, medals, and refreshments provided for all participating teams.', 'Sports', DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY), '08:00:00', '14:00:00', 'Main Sports Complex Arena', 80, 3, 'APPROVED', NULL),
(6, 'Web3 & Blockchain Symposium', 'Understanding decentralized technologies, smart contracts on Ethereum, and career paths in Web3 engineering.', 'Technical', DATE_ADD(CURRENT_DATE(), INTERVAL 12 DAY), '11:00:00', '15:00:00', 'Conference Room 402', 40, 3, 'REJECTED', 'Event conflicts with scheduled mid-semester examinations. Please reschedule for the following week.'),
(7, 'Contemporary Painting Exhibition', 'Showcase of modern canvas, watercolor, and sculpture artworks crafted by student artists across campus.', 'Cultural', DATE_ADD(CURRENT_DATE(), INTERVAL 16 DAY), '10:00:00', '16:00:00', 'Arts Gallery Hall 1', 50, 7, 'PENDING', NULL)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Sample Registrations
INSERT INTO registrations (id, student_id, event_id, status) VALUES
(1, 4, 1, 'REGISTERED'),
(2, 4, 2, 'REGISTERED'),
(3, 5, 1, 'REGISTERED'),
(4, 5, 5, 'REGISTERED')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Insert Sample Notifications
INSERT INTO notifications (id, user_id, message, type, is_read) VALUES
(1, 4, 'Welcome to CEMS! Discover and register for exciting campus events.', 'INFO', TRUE),
(2, 4, 'Registration successful for Annual Hackathon 2026.', 'SUCCESS', FALSE),
(3, 3, 'Your event "Annual Hackathon 2026" has been approved by faculty.', 'SUCCESS', TRUE),
(4, 3, 'Your event "Web3 & Blockchain Symposium" was rejected. Reason: Event conflicts with scheduled mid-semester examinations.', 'WARNING', FALSE),
(5, 2, 'New event "Cloud Computing & DevOps Seminar" waiting for faculty approval.', 'INFO', FALSE)
ON DUPLICATE KEY UPDATE message=VALUES(message);
