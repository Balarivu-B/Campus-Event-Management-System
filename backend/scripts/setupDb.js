const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function setupDatabase() {
  console.log('--- Starting Campus Event Management System Database Setup ---');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true
  };

  const dbName = process.env.DB_NAME || 'campus_event_management';

  let connection;
  try {
    console.log(`Connecting to MySQL at ${config.host}:${config.port} as user "${config.user}"...`);
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server.');

    // 1. Create Database
    console.log(`Creating database "${dbName}" if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`Using database "${dbName}".`);

    // 2. Read and run schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Running database/schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('Schema tables created successfully.');
    }

    // 3. Seed sample users with verified bcrypt password123
    console.log('Seeding sample users, events, registrations, and notifications...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      [1, 'System Administrator', 'admin@example.com', hashedPassword, 'ADMIN', 'Administration', '+1-555-0101', 1],
      [2, 'Dr. Sarah Smith', 'faculty@example.com', hashedPassword, 'FACULTY', 'Computer Science', '+1-555-0102', 1],
      [3, 'Alex Organizer', 'organizer@example.com', hashedPassword, 'ORGANIZER', 'Student Council', '+1-555-0103', 1],
      [4, 'Emily Student', 'student@example.com', hashedPassword, 'STUDENT', 'Information Technology', '+1-555-0104', 1],
      [5, 'Michael Student', 'student2@example.com', hashedPassword, 'STUDENT', 'Computer Science', '+1-555-0105', 1]
    ];

    for (const u of users) {
      await connection.query(
        `INSERT INTO users (id, name, email, password, role, department, phone, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), role = VALUES(role), department = VALUES(department), phone = VALUES(phone), is_active = VALUES(is_active)`,
        u
      );
    }

    // 4. Seed sample events
    const events = [
      [
        1,
        'Annual Hackathon 2026',
        'A 24-hour non-stop coding hackathon with exciting real-world problem statements, mentorship from industry experts, and cash prizes for top teams.',
        'Hackathon',
        '2026-10-15',
        '09:00:00',
        '18:00:00',
        'Tech Park Auditorium A',
        100,
        3,
        'APPROVED',
        null
      ],
      [
        2,
        'AI & Machine Learning Workshop',
        'Hands-on practical workshop covering deep learning fundamentals, neural networks, PyTorch, and LLM fine-tuning techniques for modern applications.',
        'Workshop',
        '2026-10-08',
        '10:00:00',
        '16:00:00',
        'CS Computer Lab 3',
        45,
        3,
        'APPROVED',
        null
      ],
      [
        3,
        'Inter-College Cultural Fest - Resonance',
        'Annual flagship cultural festival showcasing dance, music, drama, fashion shows, and art competitions from colleges across the state.',
        'Cultural',
        '2026-10-22',
        '16:00:00',
        '22:00:00',
        'Campus Open Amphitheatre',
        300,
        3,
        'APPROVED',
        null
      ],
      [
        4,
        'Cloud Computing & DevOps Seminar',
        'Interactive session by senior architects discussing Kubernetes, Docker, CI/CD automation pipelines, and scalable cloud microservices.',
        'Seminar',
        '2026-10-12',
        '14:00:00',
        '17:00:00',
        'Seminar Hall B',
        60,
        3,
        'PENDING',
        null
      ],
      [
        5,
        'Campus Basketball Championship',
        'Inter-department 3x3 and 5x5 basketball tournament. Trophies, medals, and refreshments provided for all participating teams.',
        'Sports',
        '2026-10-05',
        '08:00:00',
        '14:00:00',
        'Main Sports Complex Arena',
        80,
        3,
        'APPROVED',
        null
      ],
      [
        6,
        'Web3 & Blockchain Symposium',
        'Understanding decentralized technologies, smart contracts on Ethereum, and career paths in Web3 engineering.',
        'Technical',
        '2026-10-18',
        '11:00:00',
        '15:00:00',
        'Conference Room 402',
        40,
        3,
        'REJECTED',
        'Event conflicts with scheduled mid-semester examinations. Please reschedule for the following week.'
      ]
    ];

    for (const ev of events) {
      await connection.query(
        `INSERT INTO events (id, title, description, category, event_date, start_time, end_time, location, capacity, organizer_id, status, rejection_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), category = VALUES(category),
         event_date = VALUES(event_date), start_time = VALUES(start_time), end_time = VALUES(end_time), location = VALUES(location),
         capacity = VALUES(capacity), status = VALUES(status), rejection_reason = VALUES(rejection_reason)`,
        ev
      );
    }

    // 5. Seed sample registrations
    const registrations = [
      [1, 4, 1, 'REGISTERED'],
      [2, 4, 2, 'REGISTERED'],
      [3, 5, 1, 'REGISTERED'],
      [4, 5, 5, 'REGISTERED']
    ];

    for (const reg of registrations) {
      await connection.query(
        `INSERT INTO registrations (id, student_id, event_id, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        reg
      );
    }

    // 6. Seed sample notifications
    const notifications = [
      [1, 4, 'Welcome to CEMS! Discover and register for exciting campus events.', 'INFO', 1],
      [2, 4, 'Registration successful for Annual Hackathon 2026.', 'SUCCESS', 0],
      [3, 3, 'Your event "Annual Hackathon 2026" has been approved by faculty.', 'SUCCESS', 1],
      [4, 3, 'Your event "Web3 & Blockchain Symposium" was rejected. Reason: Event conflicts with scheduled mid-semester examinations.', 'WARNING', 0],
      [5, 2, 'New event "Cloud Computing & DevOps Seminar" waiting for faculty approval.', 'INFO', 0]
    ];

    for (const notif of notifications) {
      await connection.query(
        `INSERT INTO notifications (id, user_id, message, type, is_read)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE message = VALUES(message), type = VALUES(type), is_read = VALUES(is_read)`,
        notif
      );
    }

    console.log('✓ Database setup completed successfully!');
    console.log('Sample Logins (Password for all: password123):');
    console.log(' - Student:   student@example.com');
    console.log(' - Student 2: student2@example.com');
    console.log(' - Organizer: organizer@example.com');
    console.log(' - Faculty:   faculty@example.com');
    console.log(' - Admin:     admin@example.com');
  } catch (err) {
    console.error('Error during database setup:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
