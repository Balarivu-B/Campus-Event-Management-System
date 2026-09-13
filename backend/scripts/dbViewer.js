const db = require('../db');

async function viewDatabase() {
  console.log('\n=============================================================');
  console.log('      CAMPUS EVENT MANAGEMENT SYSTEM - DATABASE VIEWER       ');
  console.log('=============================================================\n');

  try {
    const customQuery = process.argv.slice(2).join(' ').trim();

    if (customQuery) {
      console.log(`[Executing Custom Query]: ${customQuery}`);
      const [results] = await db.query(customQuery);
      if (Array.isArray(results)) {
        console.table(results);
      } else {
        console.log(results);
      }
      return;
    }

    // 1. Show Tables
    console.log('--- 1. AVAILABLE TABLES (SHOW TABLES) ---');
    const [tables] = await db.query('SHOW TABLES');
    console.table(tables);

    // 2. Select Users
    console.log('\n--- 2. USERS TABLE (SELECT id, name, email, role, institution, department, phone, is_active FROM users) ---');
    const [users] = await db.query('SELECT * FROM users');
    console.table(users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Institution: u.institution,
      Department: u.department,
      Phone: u.phone,
      Active: u.is_active ? 'Yes' : 'No'
    })));

    // 3. Select Events
    console.log('\n--- 3. EVENTS TABLE (SELECT id, title, category, event_date, location, capacity, status FROM events) ---');
    const [events] = await db.query('SELECT * FROM events');
    console.table(events.map(e => ({
      ID: e.id,
      Title: e.title,
      Category: e.category,
      Date: e.event_date,
      Location: e.location,
      Capacity: e.capacity,
      Status: e.status
    })));

    // 4. Select Registrations
    console.log('\n--- 4. REGISTRATIONS TABLE (SELECT * FROM registrations) ---');
    const [registrations] = await db.query('SELECT * FROM registrations');
    if (Array.isArray(registrations) && registrations.length > 0) {
      console.table(registrations.map(r => ({
        ID: r.id,
        StudentID: r.student_id,
        EventID: r.event_id,
        Status: r.status,
        RegisteredAt: r.registered_at
      })));
    } else {
      console.log('(No registrations currently found)');
    }

    console.log('\n=============================================================');
    console.log(' Tip: You can run custom queries:');
    console.log('   node scripts/dbViewer.js "SELECT * FROM users WHERE role = \'FACULTY\'"');
    console.log('=============================================================\n');

  } catch (err) {
    console.error('Error querying database:', err.message);
  }
}

viewDatabase();
