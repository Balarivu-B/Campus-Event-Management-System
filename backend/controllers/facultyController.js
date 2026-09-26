const db = require("../config/db");


exports.getProfile = (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            f.faculty_id,
            f.department,
            f.institution

        FROM users u

        JOIN faculty f
            ON u.user_id = f.user_id

        WHERE u.user_id = ?
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
                data: results[0]
            });
        }
    );
};


exports.getEventRequests = (req, res) => {

    const sql = `
        SELECT
            e.event_id,
            e.event_name,
            e.category,
            e.event_date,
            e.start_time,
            e.end_time,
            e.venue,
            e.capacity,
            e.description,

            o.organization_name,
            o.institution

        FROM events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        JOIN faculty f
            ON f.user_id = ?

        WHERE e.status = 'PENDING'
        AND o.institution = f.institution

        ORDER BY e.created_at DESC
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


exports.approveEvent = (req, res) => {

    const eventId = req.params.eventId;


    const sql = `
        UPDATE events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        JOIN faculty f
            ON f.user_id = ?

        SET
            e.status = 'APPROVED',
            e.approved_by = ?

        WHERE e.event_id = ?
        AND e.status = 'PENDING'

        AND o.institution = f.institution
    `;

    db.query(
        sql,
        [
            req.user.user_id,
            req.user.user_id,
            eventId
        ],
        (error, result) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Approval failed"
                });
            }

            if (result.affectedRows === 0) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Event not found or institution mismatch"
                });
            }

            res.json({
                success: true,
                message: "Event approved successfully"
            });
        }
    );
};


exports.rejectEvent = (req, res) => {

    const eventId = req.params.eventId;

    const { reason } = req.body;


    const sql = `
        UPDATE events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        JOIN faculty f
            ON f.user_id = ?

        SET
            e.status = 'REJECTED',
            e.approved_by = ?,
            e.rejection_reason = ?

        WHERE e.event_id = ?
        AND e.status = 'PENDING'

        AND o.institution = f.institution
    `;

    db.query(
        sql,
        [
            req.user.user_id,
            req.user.user_id,
            reason || null,
            eventId
        ],
        (error, result) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Rejection failed"
                });
            }

            if (result.affectedRows === 0) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Event not found or institution mismatch"
                });
            }

            res.json({
                success: true,
                message: "Event rejected successfully"
            });
        }
    );
};


exports.getApprovedEvents = (req, res) => {

    const sql = `
        SELECT
            e.*,
            o.organization_name,
            o.institution

        FROM events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        JOIN faculty f
            ON f.user_id = ?

        WHERE e.status = 'APPROVED'
        AND o.institution = f.institution

        ORDER BY e.event_date ASC
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