const pool = require('../db');

// List / Discover Events with Search, Filter, Sort, Pagination
async function getEvents(req, res, next) {
  try {
    const {
      search,
      category,
      status,
      date,
      organizer_id,
      sort,
      page = 1,
      limit = 9
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 9));
    const offsetNum = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    // Role-based visibility:
    // If not authenticated or student/public: only show APPROVED events (unless explicitly queried by organizer/faculty/admin)
    const userRole = req.user ? req.user.role : null;
    const userId = req.user ? req.user.id : null;

    if (organizer_id) {
      conditions.push('e.organizer_id = ?');
      params.push(organizer_id);
    }

    if (status) {
      conditions.push('e.status = ?');
      params.push(status);

      // If Faculty is viewing pending events, scope to their same school or college
      if (status === 'PENDING' && userRole === 'FACULTY' && req.user.institution) {
        conditions.push('u.institution = ?');
        params.push(req.user.institution);
      }
    } else if (!organizer_id && (!userRole || userRole === 'STUDENT')) {
      conditions.push("e.status = 'APPROVED'");
    }

    if (category && category !== 'All') {
      conditions.push('e.category = ?');
      params.push(category);
    }

    if (date) {
      conditions.push('e.event_date = ?');
      params.push(date);
    }

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)');
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Allowed sorting whitelist
    let orderByClause = 'ORDER BY e.event_date ASC, e.start_time ASC';
    if (sort === 'date_desc') {
      orderByClause = 'ORDER BY e.event_date DESC, e.start_time DESC';
    } else if (sort === 'title_asc') {
      orderByClause = 'ORDER BY e.title ASC';
    } else if (sort === 'title_desc') {
      orderByClause = 'ORDER BY e.title DESC';
    } else if (sort === 'created_desc') {
      orderByClause = 'ORDER BY e.created_at DESC';
    }

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM events e ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const totalEvents = countRows[0].total;
    const totalPages = Math.ceil(totalEvents / limitNum);

    // Fetch paginated events with registration counts
    const eventsSql = `
      SELECT
        e.id,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.capacity,
        e.organizer_id,
        e.status,
        e.rejection_reason,
        e.created_at,
        u.name AS organizer_name,
        u.email AS organizer_email,
        u.institution AS organizer_institution,
        u.department AS organizer_department,
        COUNT(CASE WHEN r.status = 'REGISTERED' THEN 1 END) AS registered_count,
        GREATEST(0, e.capacity - COUNT(CASE WHEN r.status = 'REGISTERED' THEN 1 END)) AS available_seats
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
      ${whereClause}
      GROUP BY e.id
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const [events] = await pool.query(eventsSql, [...params, limitNum, offsetNum]);

    return res.json({
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalEvents,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get Single Event by ID
async function getEventById(req, res, next) {
  try {
    const eventId = req.params.id;
    const currentUserId = req.user ? req.user.id : null;

    const sql = `
      SELECT
        e.id,
        e.title,
        e.description,
        e.category,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.capacity,
        e.organizer_id,
        e.status,
        e.rejection_reason,
        e.created_at,
        e.updated_at,
        u.name AS organizer_name,
        u.email AS organizer_email,
        u.institution AS organizer_institution,
        u.department AS organizer_department,
        COUNT(CASE WHEN r.status = 'REGISTERED' THEN 1 END) AS registered_count,
        GREATEST(0, e.capacity - COUNT(CASE WHEN r.status = 'REGISTERED' THEN 1 END)) AS available_seats
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `;

    const [rows] = await pool.query(sql, [eventId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = rows[0];

    // Check if current user is registered
    let isUserRegistered = false;
    let registrationId = null;
    if (currentUserId) {
      const [regRows] = await pool.query(
        "SELECT id FROM registrations WHERE student_id = ? AND event_id = ? AND status = 'REGISTERED'",
        [currentUserId, eventId]
      );
      if (regRows.length > 0) {
        isUserRegistered = true;
        registrationId = regRows[0].id;
      }
    }

    return res.json({
      event,
      isRegistered: isUserRegistered,
      registrationId
    });
  } catch (error) {
    next(error);
  }
}

// Create New Event (Organizer or Admin)
async function createEvent(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      event_date,
      start_time,
      end_time,
      location,
      capacity
    } = req.body;

    // Validation
    if (!title || !description || !category || !event_date || !start_time || !end_time || !location || !capacity) {
      return res.status(400).json({ message: 'All event fields are required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ message: 'Capacity must be a positive number.' });
    }

    // Status is always PENDING for Organizer; Admin may directly approve if desired, but defaults to PENDING
    const initialStatus = 'PENDING';
    const organizerId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO events (title, description, category, event_date, start_time, end_time, location, capacity, organizer_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        category,
        event_date,
        start_time,
        end_time,
        location.trim(),
        parsedCapacity,
        organizerId,
        initialStatus
      ]
    );

    const newEventId = result.insertId;

    // Optional notification to Faculty
    try {
      const [facultyUsers] = await pool.query("SELECT id FROM users WHERE role = 'FACULTY' AND is_active = TRUE");
      for (const faculty of facultyUsers) {
        await pool.query(
          "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
          [faculty.id, `New event "${title.trim()}" created by ${req.user.name} is waiting for faculty approval.`, 'INFO']
        );
      }
    } catch (notifErr) {
      console.warn('Could not send notification to faculty:', notifErr.message);
    }

    return res.status(201).json({
      message: 'Event created successfully. Waiting for faculty approval.',
      eventId: newEventId
    });
  } catch (error) {
    next(error);
  }
}

// Update Event (Organizer of event or Admin)
async function updateEvent(req, res, next) {
  try {
    const eventId = req.params.id;
    const {
      title,
      description,
      category,
      event_date,
      start_time,
      end_time,
      location,
      capacity
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = existing[0];

    // Authorization: Only event's organizer or admin
    if (req.user.role !== 'ADMIN' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You can only edit your own events.' });
    }

    const parsedCapacity = capacity ? parseInt(capacity, 10) : event.capacity;
    if (capacity && (isNaN(parsedCapacity) || parsedCapacity <= 0)) {
      return res.status(400).json({ message: 'Capacity must be a positive number.' });
    }

    // If organizer edits a rejected event, reset status back to PENDING for review
    let newStatus = event.status;
    let rejectionReason = event.rejection_reason;
    if (event.status === 'REJECTED') {
      newStatus = 'PENDING';
      rejectionReason = null;
    }

    await pool.query(
      `UPDATE events
       SET title = ?, description = ?, category = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, capacity = ?, status = ?, rejection_reason = ?
       WHERE id = ?`,
      [
        title ? title.trim() : event.title,
        description ? description.trim() : event.description,
        category || event.category,
        event_date || event.event_date,
        start_time || event.start_time,
        end_time || event.end_time,
        location ? location.trim() : event.location,
        parsedCapacity,
        newStatus,
        rejectionReason,
        eventId
      ]
    );

    return res.json({ message: 'Event updated successfully.' });
  } catch (error) {
    next(error);
  }
}

// Delete Event (Organizer of event or Admin)
async function deleteEvent(req, res, next) {
  try {
    const eventId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = existing[0];

    if (req.user.role !== 'ADMIN' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You can only delete your own events.' });
    }

    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

    return res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// Approve Event (Faculty or Admin)
async function approveEvent(req, res, next) {
  try {
    const eventId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = existing[0];

    // Institutional Restriction: Faculty can ONLY approve events from their same school or college
    if (req.user.role === 'FACULTY') {
      const [orgRows] = await pool.query('SELECT institution FROM users WHERE id = ?', [event.organizer_id]);
      const orgInstitution = orgRows.length > 0 ? orgRows[0].institution : null;
      const facultyInstitution = req.user.institution;

      if (orgInstitution && facultyInstitution && orgInstitution.toLowerCase() !== facultyInstitution.toLowerCase()) {
        return res.status(403).json({
          message: `Forbidden. You can only approve events from your own school/college (${facultyInstitution}). This event belongs to ${orgInstitution}.`
        });
      }
    }

    await pool.query(
      "UPDATE events SET status = 'APPROVED', rejection_reason = NULL WHERE id = ?",
      [eventId]
    );

    // Notify Organizer
    await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [event.organizer_id, `Your event "${event.title}" has been approved by ${req.user.name} (${req.user.institution || 'Faculty'}). Students can now register.`, 'SUCCESS']
    );

    return res.json({ message: 'Event approved successfully.' });
  } catch (error) {
    next(error);
  }
}

// Reject Event (Faculty or Admin)
async function rejectEvent(req, res, next) {
  try {
    const eventId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Please provide a valid rejection reason.' });
    }

    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = existing[0];

    // Institutional Restriction: Faculty can ONLY reject events from their same school or college
    if (req.user.role === 'FACULTY') {
      const [orgRows] = await pool.query('SELECT institution FROM users WHERE id = ?', [event.organizer_id]);
      const orgInstitution = orgRows.length > 0 ? orgRows[0].institution : null;
      const facultyInstitution = req.user.institution;

      if (orgInstitution && facultyInstitution && orgInstitution.toLowerCase() !== facultyInstitution.toLowerCase()) {
        return res.status(403).json({
          message: `Forbidden. You can only review events from your own school/college (${facultyInstitution}). This event belongs to ${orgInstitution}.`
        });
      }
    }

    await pool.query(
      "UPDATE events SET status = 'REJECTED', rejection_reason = ? WHERE id = ?",
      [reason.trim(), eventId]
    );

    // Notify Organizer
    await pool.query(
      'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
      [event.organizer_id, `Your event "${event.title}" has been rejected. Reason: ${reason.trim()}`, 'WARNING']
    );

    return res.json({ message: 'Event rejected with reason recorded.' });
  } catch (error) {
    next(error);
  }
}

// Cancel Event (Organizer or Admin)
async function cancelEvent(req, res, next) {
  try {
    const eventId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = existing[0];

    if (req.user.role !== 'ADMIN' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden. You can only cancel your own events.' });
    }

    await pool.query("UPDATE events SET status = 'CANCELLED' WHERE id = ?", [eventId]);

    // Notify registered students
    const [registeredStudents] = await pool.query(
      "SELECT student_id FROM registrations WHERE event_id = ? AND status = 'REGISTERED'",
      [eventId]
    );

    for (const student of registeredStudents) {
      await pool.query(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
        [student.student_id, `Notice: The event "${event.title}" has been cancelled by the organizer.`, 'WARNING']
      );
    }

    return res.json({ message: 'Event has been cancelled and participants have been notified.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  cancelEvent
};
