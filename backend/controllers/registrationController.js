const pool = require('../db');

// Register for an Event (Students Only)
async function registerEvent(req, res, next) {
  let connection;
  try {
    const { event_id } = req.body;
    const studentId = req.user.id;

    if (!event_id) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Step 3 & 4: Check event exists and is APPROVED
    const [eventRows] = await connection.query(
      'SELECT id, title, capacity, status, organizer_id FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );

    if (eventRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = eventRows[0];

    if (event.status !== 'APPROVED') {
      await connection.rollback();
      return res.status(400).json({
        message: `Cannot register for this event. Event status is ${event.status}. Only APPROVED events accept registrations.`
      });
    }

    // Step 5: Check duplicate registration
    const [existingReg] = await connection.query(
      "SELECT id, status FROM registrations WHERE student_id = ? AND event_id = ?",
      [studentId, event_id]
    );

    if (existingReg.length > 0 && existingReg[0].status === 'REGISTERED') {
      await connection.rollback();
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    // Step 6: Check capacity
    const [countRows] = await connection.query(
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = 'REGISTERED'",
      [event_id]
    );

    const registeredCount = countRows[0].count;
    if (registeredCount >= event.capacity) {
      await connection.rollback();
      return res.status(400).json({ message: 'Registration full. No available seats remaining.' });
    }

    // Step 7: Insert or reactivate registration
    let registrationId;
    if (existingReg.length > 0) {
      // Re-register if previously cancelled
      await connection.query(
        "UPDATE registrations SET status = 'REGISTERED', registered_at = CURRENT_TIMESTAMP WHERE id = ?",
        [existingReg[0].id]
      );
      registrationId = existingReg[0].id;
    } else {
      const [insertResult] = await connection.query(
        "INSERT INTO registrations (student_id, event_id, status) VALUES (?, ?, 'REGISTERED')",
        [studentId, event_id]
      );
      registrationId = insertResult.insertId;
    }

    // Step 8: Create notifications
    // Notify Student
    await connection.query(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [studentId, `Registration successful for "${event.title}".`, 'SUCCESS']
    );

    // Notify Organizer
    await connection.query(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [event.organizer_id, `New student registration received for "${event.title}".`, 'INFO']
    );

    await connection.commit();

    return res.status(201).json({
      message: `Registration successful for ${event.title}!`,
      registrationId
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

// Get Logged-in Student's Registered Events
async function getMyRegistrations(req, res, next) {
  try {
    const studentId = req.user.id;

    const sql = `
      SELECT
        r.id AS registration_id,
        r.status AS registration_status,
        r.registered_at,
        e.id AS event_id,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.capacity,
        e.status AS event_status,
        u.name AS organizer_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE r.student_id = ?
      ORDER BY r.registered_at DESC
    `;

    const [rows] = await pool.query(sql, [studentId]);
    return res.json({ registrations: rows });
  } catch (error) {
    next(error);
  }
}

// Cancel Registration (Student or Admin)
async function cancelRegistration(req, res, next) {
  try {
    const registrationId = req.params.id;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    const [existing] = await pool.query(
      `SELECT r.id, r.student_id, r.status, e.title, e.id as event_id
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = ?`,
      [registrationId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Registration not found.' });
    }

    const reg = existing[0];

    if (currentUserRole !== 'ADMIN' && reg.student_id !== currentUserId) {
      return res.status(403).json({ message: 'Forbidden. You can only cancel your own registrations.' });
    }

    if (reg.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Registration is already cancelled.' });
    }

    // Mark status as CANCELLED
    await pool.query("UPDATE registrations SET status = 'CANCELLED' WHERE id = ?", [registrationId]);

    // Notify student
    await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [reg.student_id, `Your registration for "${reg.title}" has been cancelled.`, 'INFO']
    );

    return res.json({ message: 'Registration cancelled successfully.' });
  } catch (error) {
    next(error);
  }
}

// Get Participants for an Event (Organizer of event, Faculty, or Admin)
async function getEventParticipants(req, res, next) {
  try {
    const eventId = req.params.id;

    const [eventRows] = await pool.query('SELECT id, title, organizer_id, capacity FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = eventRows[0];

    // Authorization: Event organizer, Faculty, or Admin
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'FACULTY' &&
      event.organizer_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Forbidden. You cannot view participants for this event.' });
    }

    const sql = `
      SELECT
        r.id AS registration_id,
        r.status AS registration_status,
        r.registered_at,
        u.id AS student_id,
        u.name AS student_name,
        u.email AS student_email,
        u.department AS student_department,
        u.phone AS student_phone
      FROM registrations r
      JOIN users u ON r.student_id = u.id
      WHERE r.event_id = ?
      ORDER BY r.registered_at DESC
    `;

    const [participants] = await pool.query(sql, [eventId]);

    return res.json({
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity
      },
      participants
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerEvent,
  getMyRegistrations,
  cancelRegistration,
  getEventParticipants
};
