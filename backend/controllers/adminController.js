const db = require("../config/db");


exports.getDashboard = (req, res) => {

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM users
             WHERE role = 'STUDENT') AS students,

            (SELECT COUNT(*) FROM users
             WHERE role = 'FACULTY') AS faculty,

            (SELECT COUNT(*) FROM users
             WHERE role = 'ORGANIZER') AS organizers,

            (SELECT COUNT(*) FROM events) AS events,

            (SELECT COUNT(*) FROM events
             WHERE status = 'PENDING') AS pending_events,

            (SELECT COUNT(*) FROM events
             WHERE status = 'APPROVED') AS approved_events
    `;

    db.query(sql, (error, results) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};


exports.getStudents = (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.status,
            s.student_id,
            s.register_number,
            s.department,
            s.year

        FROM users u

        JOIN students s
            ON u.user_id = s.user_id

        WHERE u.role = 'STUDENT'

        ORDER BY u.name
    `;

    db.query(sql, (error, results) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};


exports.getFaculty = (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.status,
            f.faculty_id,
            f.department,
            f.institution

        FROM users u

        JOIN faculty f
            ON u.user_id = f.user_id

        WHERE u.role = 'FACULTY'

        ORDER BY u.name
    `;

    db.query(sql, (error, results) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};


exports.getOrganizers = (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.status,
            o.organizer_id,
            o.organization_name,
            o.institution

        FROM users u

        JOIN organizers o
            ON u.user_id = o.user_id

        WHERE u.role = 'ORGANIZER'

        ORDER BY u.name
    `;

    db.query(sql, (error, results) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};


exports.getEvents = (req, res) => {

    const sql = `
        SELECT
            e.*,
            o.organization_name,
            o.institution

        FROM events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        ORDER BY e.created_at DESC
    `;

    db.query(sql, (error, results) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};


exports.cancelEvent = (req, res) => {

    const sql = `
        UPDATE events
        SET status = 'CANCELLED'
        WHERE event_id = ?
    `;

    db.query(
        sql,
        [req.params.eventId],
        (error, result) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Cancel failed"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found"
                });
            }

            res.json({
                success: true,
                message: "Event cancelled"
            });
        }
    );
};


exports.getReports = (req, res) => {

    const sql = `
        SELECT
            e.event_id,
            e.event_name,
            e.event_date,
            e.status,
            o.organization_name,

            COUNT(r.registration_id)
                AS total_registrations,

            ROUND(
                AVG(f.rating),
                2
            ) AS average_rating

        FROM events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        LEFT JOIN registrations r
            ON e.event_id = r.event_id
            AND r.status = 'REGISTERED'

        LEFT JOIN feedback f
            ON e.event_id = f.event_id

        GROUP BY
            e.event_id,
            e.event_name,
            e.event_date,
            e.status,
            o.organization_name

        ORDER BY e.event_date DESC
    `;

    db.query(sql, (error, results) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Report generation failed"
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};


exports.getNotifications = (req, res) => {

    const sql = `
        SELECT *
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [req.user.user_id],
        (error, results) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            res.json({
                success: true,
                data: results
            });
        }
    );
};