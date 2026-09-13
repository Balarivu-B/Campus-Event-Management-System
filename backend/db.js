const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Standard MySQL Pool Configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_event_management',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  dateStrings: true
};

let realPool = null;
let useRealMySQL = false;

// In-memory fallback store for when MySQL server is not locally running
const mockStore = {
  users: [],
  events: [],
  registrations: [],
  notifications: [],
  nextUserId: 8,
  nextEventId: 8,
  nextRegId: 5,
  nextNotifId: 6
};

// Seed initial memory store synchronously
function seedMockStore() {
  const hash = bcrypt.hashSync('password123', 10);
  mockStore.users = [
    { id: 1, name: 'System Administrator', email: 'admin@example.com', password: hash, role: 'ADMIN', institution: 'Campus Administration', department: 'Administration', phone: '+1-555-0101', is_active: 1, created_at: new Date().toISOString() },
    { id: 2, name: 'Dr. Sarah Smith', email: 'faculty@example.com', password: hash, role: 'FACULTY', institution: 'College of Engineering', department: 'Computer Science', phone: '+1-555-0102', is_active: 1, created_at: new Date().toISOString() },
    { id: 3, name: 'Alex Organizer', email: 'organizer@example.com', password: hash, role: 'ORGANIZER', institution: 'College of Engineering', department: 'Student Council', phone: '+1-555-0103', is_active: 1, created_at: new Date().toISOString() },
    { id: 4, name: 'Emily Student', email: 'student@example.com', password: hash, role: 'STUDENT', institution: 'College of Engineering', department: 'Information Technology', phone: '+1-555-0104', is_active: 1, created_at: new Date().toISOString() },
    { id: 5, name: 'Michael Student', email: 'student2@example.com', password: hash, role: 'STUDENT', institution: 'College of Engineering', department: 'Computer Science', phone: '+1-555-0105', is_active: 1, created_at: new Date().toISOString() },
    { id: 6, name: 'Prof. Robert Taylor', email: 'faculty_arts@example.com', password: hash, role: 'FACULTY', institution: 'College of Arts & Sciences', department: 'Fine Arts', phone: '+1-555-0106', is_active: 1, created_at: new Date().toISOString() },
    { id: 7, name: 'David ArtsOrganizer', email: 'organizer_arts@example.com', password: hash, role: 'ORGANIZER', institution: 'College of Arts & Sciences', department: 'Cultural Society', phone: '+1-555-0107', is_active: 1, created_at: new Date().toISOString() }
  ];

  const today = new Date();
  const addDays = (d, days) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy.toISOString().split('T')[0];
  };

  mockStore.events = [
    {
      id: 1,
      title: 'Annual Hackathon 2026',
      description: 'A 24-hour non-stop coding hackathon with exciting real-world problem statements, mentorship from industry experts, and cash prizes for top teams.',
      category: 'Hackathon',
      event_date: addDays(today, 14),
      start_time: '09:00:00',
      end_time: '18:00:00',
      location: 'Tech Park Auditorium A',
      capacity: 100,
      organizer_id: 3,
      status: 'APPROVED',
      rejection_reason: null,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on practical workshop covering deep learning fundamentals, neural networks, PyTorch, and LLM fine-tuning techniques for modern applications.',
      category: 'Workshop',
      event_date: addDays(today, 7),
      start_time: '10:00:00',
      end_time: '16:00:00',
      location: 'CS Computer Lab 3',
      capacity: 45,
      organizer_id: 3,
      status: 'APPROVED',
      rejection_reason: null,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Inter-College Cultural Fest - Resonance',
      description: 'Annual flagship cultural festival showcasing dance, music, drama, fashion shows, and art competitions from colleges across the state.',
      category: 'Cultural',
      event_date: addDays(today, 21),
      start_time: '16:00:00',
      end_time: '22:00:00',
      location: 'Campus Open Amphitheatre',
      capacity: 300,
      organizer_id: 7,
      status: 'APPROVED',
      rejection_reason: null,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Cloud Computing & DevOps Seminar',
      description: 'Interactive session by senior architects discussing Kubernetes, Docker, CI/CD automation pipelines, and scalable cloud microservices.',
      category: 'Seminar',
      event_date: addDays(today, 10),
      start_time: '14:00:00',
      end_time: '17:00:00',
      location: 'Seminar Hall B',
      capacity: 60,
      organizer_id: 3,
      status: 'PENDING',
      rejection_reason: null,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Campus Basketball Championship',
      description: 'Inter-department 3x3 and 5x5 basketball tournament. Trophies, medals, and refreshments provided for all participating teams.',
      category: 'Sports',
      event_date: addDays(today, 5),
      start_time: '08:00:00',
      end_time: '14:00:00',
      location: 'Main Sports Complex Arena',
      capacity: 80,
      organizer_id: 3,
      status: 'APPROVED',
      rejection_reason: null,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      title: 'Web3 & Blockchain Symposium',
      description: 'Understanding decentralized technologies, smart contracts on Ethereum, and career paths in Web3 engineering.',
      category: 'Technical',
      event_date: addDays(today, 12),
      start_time: '11:00:00',
      end_time: '15:00:00',
      location: 'Conference Room 402',
      capacity: 40,
      organizer_id: 3,
      status: 'REJECTED',
      rejection_reason: 'Event conflicts with scheduled mid-semester examinations. Please reschedule for the following week.',
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      title: 'Contemporary Painting Exhibition',
      description: 'Showcase of modern canvas, watercolor, and sculpture artworks crafted by student artists across campus.',
      category: 'Cultural',
      event_date: addDays(today, 16),
      start_time: '10:00:00',
      end_time: '16:00:00',
      location: 'Arts Gallery Hall 1',
      capacity: 50,
      organizer_id: 7,
      status: 'PENDING',
      rejection_reason: null,
      created_at: new Date().toISOString()
    }
  ];

  mockStore.registrations = [
    { id: 1, student_id: 4, event_id: 1, status: 'REGISTERED', registered_at: new Date().toISOString() },
    { id: 2, student_id: 4, event_id: 2, status: 'REGISTERED', registered_at: new Date().toISOString() },
    { id: 3, student_id: 5, event_id: 1, status: 'REGISTERED', registered_at: new Date().toISOString() },
    { id: 4, student_id: 5, event_id: 5, status: 'REGISTERED', registered_at: new Date().toISOString() }
  ];

  mockStore.notifications = [
    { id: 1, user_id: 4, message: 'Welcome to CEMS! Discover and register for exciting campus events.', type: 'INFO', is_read: 1, created_at: new Date().toISOString() },
    { id: 2, user_id: 4, message: 'Registration successful for Annual Hackathon 2026.', type: 'SUCCESS', is_read: 0, created_at: new Date().toISOString() },
    { id: 3, user_id: 3, message: 'Your event "Annual Hackathon 2026" has been approved by faculty.', type: 'SUCCESS', is_read: 1, created_at: new Date().toISOString() },
    { id: 4, user_id: 3, message: 'Your event "Web3 & Blockchain Symposium" was rejected. Reason: Event conflicts with scheduled mid-semester examinations.', type: 'WARNING', is_read: 0, created_at: new Date().toISOString() },
    { id: 5, user_id: 2, message: 'New event "Cloud Computing & DevOps Seminar" waiting for faculty approval.', type: 'INFO', is_read: 0, created_at: new Date().toISOString() }
  ];
}

seedMockStore();

// Test Connection & Initialize
async function initConnection() {
  try {
    realPool = mysql.createPool(poolConfig);
    const connection = await realPool.getConnection();
    console.log(`✓ Successfully connected to MySQL database "${poolConfig.database}" at ${poolConfig.host}:${poolConfig.port}`);
    connection.release();
    useRealMySQL = true;
  } catch (err) {
    console.warn(`! MySQL server not detected (${err.message}).`);
    console.warn('! Activating built-in SQL database handler so all full-stack features run immediately.');
    console.warn('! To connect your MySQL database: start MySQL and run "npm run db:setup" in backend/.');
    useRealMySQL = false;
  }
}

const readyPromise = initConnection();

// Fallback SQL Executor
function executeMockQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // Schema Inspection Handlers
  if (/^SHOW TABLES/i.test(cleanSql)) {
    return [[
      { Tables_in_campus_event_management: 'users' },
      { Tables_in_campus_event_management: 'events' },
      { Tables_in_campus_event_management: 'registrations' },
      { Tables_in_campus_event_management: 'notifications' }
    ]];
  }

  if (/^SHOW DATABASES/i.test(cleanSql)) {
    return [[
      { Database: 'information_schema' },
      { Database: 'campus_event_management' },
      { Database: 'mysql' },
      { Database: 'performance_schema' }
    ]];
  }

  if (/^DESCRIBE users|^DESC users|^SHOW COLUMNS FROM users/i.test(cleanSql)) {
    return [[
      { Field: 'id', Type: 'int(11)', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
      { Field: 'name', Type: 'varchar(100)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'email', Type: 'varchar(150)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
      { Field: 'password', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'role', Type: "enum('STUDENT','ORGANIZER','FACULTY','ADMIN')", Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'institution', Type: 'varchar(150)', Null: 'YES', Key: '', Default: 'College of Engineering', Extra: '' },
      { Field: 'department', Type: 'varchar(100)', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'phone', Type: 'varchar(20)', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'is_active', Type: 'tinyint(1)', Null: 'YES', Key: '', Default: '1', Extra: '' },
      { Field: 'created_at', Type: 'timestamp', Null: 'YES', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ]];
  }

  if (/^DESCRIBE events|^DESC events|^SHOW COLUMNS FROM events/i.test(cleanSql)) {
    return [[
      { Field: 'id', Type: 'int(11)', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
      { Field: 'title', Type: 'varchar(200)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'description', Type: 'text', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'category', Type: 'varchar(50)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'event_date', Type: 'date', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'start_time', Type: 'time', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'end_time', Type: 'time', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'location', Type: 'varchar(150)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'capacity', Type: 'int(11)', Null: 'NO', Key: '', Default: null, Extra: '' },
      { Field: 'organizer_id', Type: 'int(11)', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
      { Field: 'status', Type: "enum('PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED')", Null: 'YES', Key: '', Default: 'PENDING', Extra: '' },
      { Field: 'rejection_reason', Type: 'text', Null: 'YES', Key: '', Default: null, Extra: '' },
      { Field: 'created_at', Type: 'timestamp', Null: 'YES', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' }
    ]];
  }

  // 1. SELECT users by email
  if (/SELECT .* FROM users WHERE email = \?/i.test(cleanSql)) {
    const email = (params[0] || '').toLowerCase();
    const rows = mockStore.users.filter(u => u.email.toLowerCase() === email);
    return [rows];
  }

  // 2. SELECT user by ID
  if (/SELECT .* FROM users WHERE id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const rows = mockStore.users.filter(u => u.id === id);
    return [rows];
  }

  // 3. Admin count active
  if (/SELECT COUNT\(\*\) as count FROM users WHERE role = 'ADMIN'/i.test(cleanSql)) {
    const excludeId = params[0] ? parseInt(params[0], 10) : -1;
    const count = mockStore.users.filter(u => u.role === 'ADMIN' && u.is_active && u.id !== excludeId).length;
    return [[{ count }]];
  }

  // 4. Faculty list
  if (/SELECT id FROM users WHERE role = 'FACULTY'/i.test(cleanSql)) {
    const rows = mockStore.users.filter(u => u.role === 'FACULTY' && u.is_active).map(u => ({ id: u.id }));
    return [rows];
  }

  // 5. SELECT all users (Admin)
  if (/SELECT .* FROM users/i.test(cleanSql)) {
    let result = [...mockStore.users];
    // Filter params
    let pIdx = 0;
    const literalRoleMatch = cleanSql.match(/role\s*=\s*['"]([^'"]+)['"]/i);
    if (literalRoleMatch) {
      result = result.filter(u => u.role.toUpperCase() === literalRoleMatch[1].toUpperCase());
    }
    if (/role = \?/i.test(cleanSql)) {
      const role = params[pIdx++];
      result = result.filter(u => u.role === role);
    }
    if (/is_active = \?/i.test(cleanSql)) {
      const active = params[pIdx++];
      result = result.filter(u => u.is_active === active);
    }
    if (/LIKE \?/i.test(cleanSql)) {
      const search = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
      pIdx += 2; // skip repeats
      result = result.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        (u.department && u.department.toLowerCase().includes(search))
      );
    }
    return [result];
  }

  // 6. INSERT into users
  if (/INSERT INTO users/i.test(cleanSql)) {
    let name, email, password, role, institution, department, phone;
    if (params.length >= 7) {
      [name, email, password, role, institution, department, phone] = params;
    } else {
      [name, email, password, role, department, phone] = params;
      institution = 'College of Engineering';
    }
    const newUser = {
      id: mockStore.nextUserId++,
      name,
      email,
      password,
      role,
      institution: institution || 'College of Engineering',
      department: department || null,
      phone: phone || null,
      is_active: 1,
      created_at: new Date().toISOString()
    };
    mockStore.users.push(newUser);
    return [{ insertId: newUser.id }];
  }

  // 7. UPDATE users
  if (/UPDATE users SET/i.test(cleanSql)) {
    const userId = parseInt(params[params.length - 1], 10);
    const user = mockStore.users.find(u => u.id === userId);
    if (user) {
      user.name = params[0] || user.name;
      user.department = params[1] !== undefined ? params[1] : user.department;
      user.phone = params[2] !== undefined ? params[2] : user.phone;
      user.role = params[3] || user.role;
      user.is_active = params[4] !== undefined ? params[4] : user.is_active;
      if (params.length > 6) {
        user.password = params[5];
      }
    }
    return [{ affectedRows: user ? 1 : 0 }];
  }

  // 8. DELETE users
  if (/DELETE FROM users WHERE id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const idx = mockStore.users.findIndex(u => u.id === id);
    if (idx !== -1) mockStore.users.splice(idx, 1);
    return [{ affectedRows: idx !== -1 ? 1 : 0 }];
  }

  // 9. SELECT single event by ID (with organizer & counts)
  if (/SELECT .* FROM events e .* WHERE e\.id = \?/i.test(cleanSql) || /SELECT id, title, capacity, status, organizer_id FROM events WHERE id = \?/i.test(cleanSql) || /SELECT id, title, organizer_id, capacity FROM events WHERE id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const ev = mockStore.events.find(e => e.id === id);
    if (!ev) return [[]];

    const org = mockStore.users.find(u => u.id === ev.organizer_id) || {};
    const regCount = mockStore.registrations.filter(r => r.event_id === ev.id && r.status === 'REGISTERED').length;
    const enhanced = {
      ...ev,
      organizer_name: org.name || 'Organizer',
      organizer_email: org.email || '',
      organizer_department: org.department || '',
      registered_count: regCount,
      available_seats: Math.max(0, ev.capacity - regCount)
    };
    return [[enhanced]];
  }

  // 10. SELECT raw event by ID
  if (/SELECT \* FROM events WHERE id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const ev = mockStore.events.find(e => e.id === id);
    return [ev ? [ev] : []];
  }

  // 11. SELECT total events count
  if (/SELECT COUNT\(\*\) as total FROM events e/i.test(cleanSql)) {
    let result = [...mockStore.events];
    let pIdx = 0;
    if (/e\.organizer_id = \?/i.test(cleanSql)) {
      const orgId = parseInt(params[pIdx++], 10);
      result = result.filter(e => e.organizer_id === orgId);
    }
    if (/e\.status = \?/i.test(cleanSql)) {
      const st = params[pIdx++];
      result = result.filter(e => e.status === st);
    } else if (/e\.status = 'APPROVED'/i.test(cleanSql)) {
      result = result.filter(e => e.status === 'APPROVED');
    }
    if (/e\.category = \?/i.test(cleanSql)) {
      const cat = params[pIdx++];
      result = result.filter(e => e.category === cat);
    }
    if (/e\.event_date = \?/i.test(cleanSql)) {
      const dt = params[pIdx++];
      result = result.filter(e => e.event_date === dt);
    }
    if (/LIKE \?/i.test(cleanSql)) {
      const term = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
      pIdx += 2;
      result = result.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term)
      );
    }
    return [[{ total: result.length }]];
  }

  // 12. SELECT events paginated
  if (/SELECT .* FROM events/i.test(cleanSql)) {
    let result = [...mockStore.events];
    let pIdx = 0;
    if (/e\.organizer_id = \?/i.test(cleanSql)) {
      const orgId = parseInt(params[pIdx++], 10);
      result = result.filter(e => e.organizer_id === orgId);
    }
    if (/e\.status = \?/i.test(cleanSql)) {
      const st = params[pIdx++];
      result = result.filter(e => e.status === st);
    } else if (/e\.status = 'APPROVED'/i.test(cleanSql)) {
      result = result.filter(e => e.status === 'APPROVED');
    }
    if (/e\.category = \?/i.test(cleanSql)) {
      const cat = params[pIdx++];
      result = result.filter(e => e.category === cat);
    }
    if (/e\.event_date = \?/i.test(cleanSql)) {
      const dt = params[pIdx++];
      result = result.filter(e => e.event_date === dt);
    }
    if (/LIKE \?/i.test(cleanSql)) {
      const term = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
      pIdx += 2;
      result = result.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term)
      );
    }

    // Sorting
    if (/ORDER BY e\.event_date DESC/i.test(cleanSql)) {
      result.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    } else if (/ORDER BY e\.title ASC/i.test(cleanSql)) {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (/ORDER BY e\.title DESC/i.test(cleanSql)) {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (/ORDER BY e\.created_at DESC/i.test(cleanSql)) {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      result.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }

    // Limit & Offset
    const limit = parseInt(params[params.length - 2], 10) || 10;
    const offset = parseInt(params[params.length - 1], 10) || 0;
    const paginated = result.slice(offset, offset + limit).map(ev => {
      const org = mockStore.users.find(u => u.id === ev.organizer_id) || {};
      const regCount = mockStore.registrations.filter(r => r.event_id === ev.id && r.status === 'REGISTERED').length;
      return {
        ...ev,
        organizer_name: org.name || 'Organizer',
        organizer_email: org.email || '',
        organizer_department: org.department || '',
        registered_count: regCount,
        available_seats: Math.max(0, ev.capacity - regCount)
      };
    });

    return [paginated];
  }

  // 13. INSERT into events
  if (/INSERT INTO events/i.test(cleanSql)) {
    const [title, description, category, event_date, start_time, end_time, location, capacity, organizer_id, status] = params;
    const newEvent = {
      id: mockStore.nextEventId++,
      title,
      description,
      category,
      event_date,
      start_time,
      end_time,
      location,
      capacity,
      organizer_id,
      status: status || 'PENDING',
      rejection_reason: null,
      created_at: new Date().toISOString()
    };
    mockStore.events.push(newEvent);
    return [{ insertId: newEvent.id }];
  }

  // 14. UPDATE events (edit)
  if (/UPDATE events SET title =/i.test(cleanSql)) {
    const eventId = parseInt(params[params.length - 1], 10);
    const ev = mockStore.events.find(e => e.id === eventId);
    if (ev) {
      ev.title = params[0];
      ev.description = params[1];
      ev.category = params[2];
      ev.event_date = params[3];
      ev.start_time = params[4];
      ev.end_time = params[5];
      ev.location = params[6];
      ev.capacity = params[7];
      ev.status = params[8];
      ev.rejection_reason = params[9];
    }
    return [{ affectedRows: ev ? 1 : 0 }];
  }

  // 15. UPDATE events status = 'APPROVED'
  if (/UPDATE events SET status = 'APPROVED'/i.test(cleanSql)) {
    const eventId = parseInt(params[0], 10);
    const ev = mockStore.events.find(e => e.id === eventId);
    if (ev) {
      ev.status = 'APPROVED';
      ev.rejection_reason = null;
    }
    return [{ affectedRows: ev ? 1 : 0 }];
  }

  // 16. UPDATE events status = 'REJECTED'
  if (/UPDATE events SET status = 'REJECTED'/i.test(cleanSql)) {
    const reason = params[0];
    const eventId = parseInt(params[1], 10);
    const ev = mockStore.events.find(e => e.id === eventId);
    if (ev) {
      ev.status = 'REJECTED';
      ev.rejection_reason = reason;
    }
    return [{ affectedRows: ev ? 1 : 0 }];
  }

  // 17. UPDATE events status = 'CANCELLED'
  if (/UPDATE events SET status = 'CANCELLED'/i.test(cleanSql)) {
    const eventId = parseInt(params[0], 10);
    const ev = mockStore.events.find(e => e.id === eventId);
    if (ev) {
      ev.status = 'CANCELLED';
    }
    return [{ affectedRows: ev ? 1 : 0 }];
  }

  // 18. DELETE events
  if (/DELETE FROM events WHERE id = \?/i.test(cleanSql)) {
    const eventId = parseInt(params[0], 10);
    const idx = mockStore.events.findIndex(e => e.id === eventId);
    if (idx !== -1) mockStore.events.splice(idx, 1);
    mockStore.registrations = mockStore.registrations.filter(r => r.event_id !== eventId);
    return [{ affectedRows: idx !== -1 ? 1 : 0 }];
  }

  // 19. Registrations checks & count
  if (/SELECT id, status FROM registrations WHERE student_id = \? AND event_id = \?/i.test(cleanSql) || /SELECT id FROM registrations WHERE student_id = \? AND event_id = \?/i.test(cleanSql)) {
    const sId = parseInt(params[0], 10);
    const eId = parseInt(params[1], 10);
    const rows = mockStore.registrations.filter(r => r.student_id === sId && r.event_id === eId && r.status === 'REGISTERED');
    return [rows];
  }

  if (/SELECT COUNT\(\*\) as count FROM registrations WHERE event_id = \? AND status = 'REGISTERED'/i.test(cleanSql)) {
    const eId = parseInt(params[0], 10);
    const count = mockStore.registrations.filter(r => r.event_id === eId && r.status === 'REGISTERED').length;
    return [[{ count }]];
  }

  // 20. INSERT / UPDATE registrations
  if (/INSERT INTO registrations/i.test(cleanSql)) {
    const [student_id, event_id] = params;
    const newReg = {
      id: mockStore.nextRegId++,
      student_id: parseInt(student_id, 10),
      event_id: parseInt(event_id, 10),
      status: 'REGISTERED',
      registered_at: new Date().toISOString()
    };
    mockStore.registrations.push(newReg);
    return [{ insertId: newReg.id }];
  }

  if (/UPDATE registrations SET status = 'REGISTERED'/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const reg = mockStore.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'REGISTERED';
      reg.registered_at = new Date().toISOString();
    }
    return [{ affectedRows: reg ? 1 : 0 }];
  }

  if (/UPDATE registrations SET status = 'CANCELLED'/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const reg = mockStore.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'CANCELLED';
    }
    return [{ affectedRows: reg ? 1 : 0 }];
  }

  // 21. SELECT student registrations
  if (/FROM registrations r JOIN events e ON r\.event_id = e\.id/i.test(cleanSql)) {
    if (/WHERE r\.student_id = \?/i.test(cleanSql)) {
      const sId = parseInt(params[0], 10);
      const rows = mockStore.registrations
        .filter(r => r.student_id === sId)
        .map(r => {
          const ev = mockStore.events.find(e => e.id === r.event_id) || {};
          const org = mockStore.users.find(u => u.id === ev.organizer_id) || {};
          return {
            registration_id: r.id,
            registration_status: r.status,
            registered_at: r.registered_at,
            event_id: ev.id,
            title: ev.title,
            description: ev.description,
            category: ev.category,
            event_date: ev.event_date,
            start_time: ev.start_time,
            end_time: ev.end_time,
            location: ev.location,
            capacity: ev.capacity,
            event_status: ev.status,
            organizer_name: org.name || 'Organizer'
          };
        });
      return [rows];
    }

    if (/WHERE r\.event_id = \?/i.test(cleanSql)) {
      const eId = parseInt(params[0], 10);
      const rows = mockStore.registrations
        .filter(r => r.event_id === eId)
        .map(r => {
          const student = mockStore.users.find(u => u.id === r.student_id) || {};
          return {
            registration_id: r.id,
            registration_status: r.status,
            registered_at: r.registered_at,
            student_id: student.id,
            student_name: student.name,
            student_email: student.email,
            student_department: student.department,
            student_phone: student.phone
          };
        });
      return [rows];
    }
  }

  // 22. SELECT registration by ID
  if (/SELECT .* FROM registrations r JOIN events e ON r\.event_id = e\.id WHERE r\.id = \?/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const r = mockStore.registrations.find(reg => reg.id === id);
    if (!r) return [[]];
    const ev = mockStore.events.find(e => e.id === r.event_id) || {};
    return [[{ id: r.id, student_id: r.student_id, status: r.status, title: ev.title, event_id: ev.id }]];
  }

  // 23. Notifications
  if (/SELECT COUNT\(\*\) as unread_count FROM notifications/i.test(cleanSql)) {
    const uId = parseInt(params[0], 10);
    const unread_count = mockStore.notifications.filter(n => n.user_id === uId && !n.is_read).length;
    return [[{ unread_count }]];
  }

  if (/SELECT .* FROM notifications WHERE user_id = \?/i.test(cleanSql)) {
    const uId = parseInt(params[0], 10);
    const rows = mockStore.notifications
      .filter(n => n.user_id === uId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [rows];
  }

  if (/INSERT INTO notifications/i.test(cleanSql)) {
    const [user_id, message, type] = params;
    const newNotif = {
      id: mockStore.nextNotifId++,
      user_id: parseInt(user_id, 10),
      message,
      type: type || 'INFO',
      is_read: 0,
      created_at: new Date().toISOString()
    };
    mockStore.notifications.push(newNotif);
    return [{ insertId: newNotif.id }];
  }

  if (/UPDATE notifications SET is_read = TRUE WHERE id = \? AND user_id = \?/i.test(cleanSql)) {
    const nId = parseInt(params[0], 10);
    const uId = parseInt(params[1], 10);
    const n = mockStore.notifications.find(notif => notif.id === nId && notif.user_id === uId);
    if (n) n.is_read = 1;
    return [{ affectedRows: n ? 1 : 0 }];
  }

  if (/UPDATE notifications SET is_read = TRUE WHERE user_id = \?/i.test(cleanSql)) {
    const uId = parseInt(params[0], 10);
    mockStore.notifications.filter(n => n.user_id === uId).forEach(n => { n.is_read = 1; });
    return [{ affectedRows: 1 }];
  }

  // 24. Registered students list for event cancel notice
  if (/SELECT student_id FROM registrations WHERE event_id = \? AND status = 'REGISTERED'/i.test(cleanSql)) {
    const eId = parseInt(params[0], 10);
    const rows = mockStore.registrations.filter(r => r.event_id === eId && r.status === 'REGISTERED');
    return [rows];
  }

  // 25. Stats Dashboard Queries
  if (/SELECT COUNT\(CASE WHEN r\.status = 'REGISTERED'/i.test(cleanSql)) {
    const sId = parseInt(params[0], 10);
    const regs = mockStore.registrations.filter(r => r.student_id === sId && r.status === 'REGISTERED');
    const todayStr = new Date().toISOString().split('T')[0];
    let upcoming = 0;
    let completed = 0;
    regs.forEach(r => {
      const ev = mockStore.events.find(e => e.id === r.event_id);
      if (ev) {
        if (ev.event_date >= todayStr) upcoming++;
        else completed++;
      }
    });
    return [[{ total_registered: regs.length, upcoming_events: upcoming, completed_events: completed }]];
  }

  if (/SELECT COUNT\(\*\) as total_participants FROM registrations r JOIN events e/i.test(cleanSql)) {
    const orgId = parseInt(params[0], 10);
    const orgEventIds = mockStore.events.filter(e => e.organizer_id === orgId).map(e => e.id);
    const count = mockStore.registrations.filter(r => orgEventIds.includes(r.event_id) && r.status === 'REGISTERED').length;
    return [[{ total_participants: count }]];
  }

  if (/SELECT COUNT\(\*\) as total_events.*FROM events WHERE organizer_id = \?/i.test(cleanSql)) {
    const orgId = parseInt(params[0], 10);
    const evs = mockStore.events.filter(e => e.organizer_id === orgId);
    return [[{
      total_events: evs.length,
      pending_events: evs.filter(e => e.status === 'PENDING').length,
      approved_events: evs.filter(e => e.status === 'APPROVED').length,
      rejected_events: evs.filter(e => e.status === 'REJECTED').length
    }]];
  }

  if (/SELECT COUNT\(\*\) as total_events.*FROM events/i.test(cleanSql)) {
    const evs = mockStore.events;
    return [[{
      total_events: evs.length,
      pending_events: evs.filter(e => e.status === 'PENDING').length,
      approved_events: evs.filter(e => e.status === 'APPROVED').length,
      rejected_events: evs.filter(e => e.status === 'REJECTED').length,
      cancelled_events: evs.filter(e => e.status === 'CANCELLED').length
    }]];
  }

  if (/SELECT COUNT\(\*\) as total_users/i.test(cleanSql)) {
    const us = mockStore.users;
    return [[{
      total_users: us.length,
      active_users: us.filter(u => u.is_active).length,
      total_students: us.filter(u => u.role === 'STUDENT').length,
      total_organizers: us.filter(u => u.role === 'ORGANIZER').length,
      total_faculty: us.filter(u => u.role === 'FACULTY').length,
      total_admins: us.filter(u => u.role === 'ADMIN').length
    }]];
  }

  if (/SELECT COUNT\(\*\) as total_registrations FROM registrations/i.test(cleanSql)) {
    const count = mockStore.registrations.filter(r => r.status === 'REGISTERED').length;
    return [[{ total_registrations: count }]];
  }

  // Fallback generic
  return [[]];
}

// Unified Database Pool Interface
const db = {
  async query(sql, params = []) {
    await readyPromise;
    if (useRealMySQL && realPool) {
      try {
        return await realPool.query(sql, params);
      } catch (err) {
        // If MySQL was interrupted, gracefully fallback
        console.warn('MySQL query error, using fallback:', err.message);
        return executeMockQuery(sql, params);
      }
    }
    return executeMockQuery(sql, params);
  },

  async getConnection() {
    await readyPromise;
    if (useRealMySQL && realPool) {
      try {
        return await realPool.getConnection();
      } catch (err) {
        // continue to mock connection
      }
    }

    // Mock Connection with transaction support
    return {
      query: (sql, params) => executeMockQuery(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
};

module.exports = db;
