const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    if (role === 'STUDENT') {
      // 1. Student stats
      const [regStats] = await pool.query(
        `SELECT
           COUNT(CASE WHEN r.status = 'REGISTERED' THEN 1 END) as total_registered,
           COUNT(CASE WHEN r.status = 'REGISTERED' AND e.event_date >= CURRENT_DATE() THEN 1 END) as upcoming_events,
           COUNT(CASE WHEN r.status = 'REGISTERED' AND e.event_date < CURRENT_DATE() THEN 1 END) as completed_events
         FROM registrations r
         JOIN events e ON r.event_id = e.id
         WHERE r.student_id = ?`,
        [userId]
      );

      const [unreadNotif] = await pool.query(
        'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );

      const [recentRegistrations] = await pool.query(
        `SELECT r.id as registration_id, r.registered_at, r.status as registration_status,
                e.id as event_id, e.title, e.category, e.event_date, e.start_time, e.location
         FROM registrations r
         JOIN events e ON r.event_id = e.id
         WHERE r.student_id = ? AND r.status = 'REGISTERED'
         ORDER BY e.event_date ASC
         LIMIT 5`,
        [userId]
      );

      return res.json({
        role: 'STUDENT',
        stats: {
          totalRegistered: regStats[0].total_registered || 0,
          upcomingEvents: regStats[0].upcoming_events || 0,
          completedEvents: regStats[0].completed_events || 0,
          unreadNotifications: unreadNotif[0].unread_count || 0
        },
        recentRegistrations
      });
    }

    if (role === 'ORGANIZER') {
      // 2. Organizer stats
      const [eventStats] = await pool.query(
        `SELECT
           COUNT(*) as total_events,
           COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_events,
           COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_events,
           COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_events
         FROM events
         WHERE organizer_id = ?`,
        [userId]
      );

      const [partStats] = await pool.query(
        `SELECT COUNT(*) as total_participants
         FROM registrations r
         JOIN events e ON r.event_id = e.id
         WHERE e.organizer_id = ? AND r.status = 'REGISTERED'`,
        [userId]
      );

      const [recentEvents] = await pool.query(
        `SELECT e.*,
          COUNT(CASE WHEN r.status = 'REGISTERED' THEN 1 END) as participant_count
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id
         WHERE e.organizer_id = ?
         GROUP BY e.id
         ORDER BY e.created_at DESC
         LIMIT 5`,
        [userId]
      );

      return res.json({
        role: 'ORGANIZER',
        stats: {
          totalEvents: eventStats[0].total_events || 0,
          pendingEvents: eventStats[0].pending_events || 0,
          approvedEvents: eventStats[0].approved_events || 0,
          rejectedEvents: eventStats[0].rejected_events || 0,
          totalParticipants: partStats[0].total_participants || 0
        },
        recentEvents
      });
    }

    if (role === 'FACULTY') {
      // 3. Faculty stats scoped to same school / college
      const facInstitution = req.user.institution || '';
      const [facStats] = await pool.query(
        `SELECT
           COUNT(e.id) as total_events,
           COUNT(CASE WHEN e.status = 'PENDING' THEN 1 END) as pending_events,
           COUNT(CASE WHEN e.status = 'APPROVED' THEN 1 END) as approved_events,
           COUNT(CASE WHEN e.status = 'REJECTED' THEN 1 END) as rejected_events
         FROM events e
         JOIN users u ON e.organizer_id = u.id
         WHERE u.institution = ?`,
        [facInstitution]
      );

      const [pendingQueue] = await pool.query(
        `SELECT e.*, u.name as organizer_name, u.email as organizer_email, u.institution as organizer_institution, u.department as organizer_department
         FROM events e
         JOIN users u ON e.organizer_id = u.id
         WHERE e.status = 'PENDING' AND u.institution = ?
         ORDER BY e.created_at ASC
         LIMIT 5`,
        [facInstitution]
      );

      return res.json({
        role: 'FACULTY',
        institution: facInstitution,
        stats: {
          totalEvents: facStats[0].total_events || 0,
          pendingEvents: facStats[0].pending_events || 0,
          approvedEvents: facStats[0].approved_events || 0,
          rejectedEvents: facStats[0].rejected_events || 0
        },
        pendingQueue
      });
    }

    if (role === 'ADMIN') {
      // 4. Admin stats
      const [userStats] = await pool.query(
        `SELECT
           COUNT(*) as total_users,
           COUNT(CASE WHEN role = 'STUDENT' THEN 1 END) as total_students,
           COUNT(CASE WHEN role = 'ORGANIZER' THEN 1 END) as total_organizers,
           COUNT(CASE WHEN role = 'FACULTY' THEN 1 END) as total_faculty,
           COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as total_admins,
           COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users
         FROM users`
      );

      const [eventStats] = await pool.query(
        `SELECT
           COUNT(*) as total_events,
           COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_events,
           COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_events,
           COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_events,
           COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_events
         FROM events`
      );

      const [regStats] = await pool.query(
        "SELECT COUNT(*) as total_registrations FROM registrations WHERE status = 'REGISTERED'"
      );

      return res.json({
        role: 'ADMIN',
        stats: {
          totalUsers: userStats[0].total_users || 0,
          activeUsers: userStats[0].active_users || 0,
          totalStudents: userStats[0].total_students || 0,
          totalOrganizers: userStats[0].total_organizers || 0,
          totalFaculty: userStats[0].total_faculty || 0,
          totalAdmins: userStats[0].total_admins || 0,
          totalEvents: eventStats[0].total_events || 0,
          approvedEvents: eventStats[0].approved_events || 0,
          pendingEvents: eventStats[0].pending_events || 0,
          totalRegistrations: regStats[0].total_registrations || 0
        }
      });
    }

    return res.status(400).json({ message: 'Invalid role for statistics.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
