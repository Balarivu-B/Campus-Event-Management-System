const db = require("../config/db");


exports.getProfile = (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            o.organizer_id,
            o.organization_name,
            o.institution
        FROM users u
        JOIN organizers o
            ON u.user_id = o.user_id
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


exports.createEvent = (req, res) => {

    const {
        event_name,
        category,
        event_date,
        start_time,
        end_time,
        venue,
        capacity,
        description
    } = req.body;


    const organizerSql = `
        SELECT organizer_id
        FROM organizers
        WHERE user_id = ?
    `;

    db.query(
        organizerSql,
        [req.user.user_id],
        (error, results) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Organizer profile not found"
                });
            }

            const organizerId =
                results[0].organizer_id;


            const sql = `
                INSERT INTO events
                (
                    organizer_id,
                    event_name,
                    category,
                    event_date,
                    start_time,
                    end_time,
                    venue,
                    capacity,
                    description
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    organizerId,
                    event_name,
                    category,
                    event_date,
                    start_time,
                    end_time,
                    venue,
                    capacity,
                    description
                ],
                (error, result) => {

                    if (error) {
                        return res.status(500).json({
                            success: false,
                            message: "Event creation failed"
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Event created and sent for approval",
                        event_id: result.insertId
                    });
                }
            );
        }
    );
};


exports.getEvents = (req, res) => {

    const sql = `
        SELECT
            e.*
        FROM events e
        JOIN organizers o
            ON e.organizer_id = o.organizer_id
        WHERE o.user_id = ?
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


exports.updateEvent = (req, res) => {

    const eventId = req.params.eventId;

    const {
        event_name,
        category,
        event_date,
        start_time,
        end_time,
        venue,
        capacity,
        description
    } = req.body;


    const sql = `
        UPDATE events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        SET
            e.event_name = ?,
            e.category = ?,
            e.event_date = ?,
            e.start_time = ?,
            e.end_time = ?,
            e.venue = ?,
            e.capacity = ?,
            e.description = ?,
            e.status = 'PENDING'

        WHERE e.event_id = ?
        AND o.user_id = ?
    `;

    db.query(
        sql,
        [
            event_name,
            category,
            event_date,
            start_time,
            end_time,
            venue,
            capacity,
            description,
            eventId,
            req.user.user_id
        ],
        (error, result) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Update failed"
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
                message: "Event updated and sent for approval"
            });
        }
    );
};


exports.deleteEvent = (req, res) => {

    const sql = `
        DELETE e
        FROM events e

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        WHERE e.event_id = ?
        AND o.user_id = ?
    `;

    db.query(
        sql,
        [
            req.params.eventId,
            req.user.user_id
        ],
        (error, result) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Delete failed"
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
                message: "Event deleted successfully"
            });
        }
    );
};


exports.getRegistrations = (req, res) => {

    const sql = `
        SELECT
            r.registration_id,
            r.status,
            r.registered_at,

            u.name,
            u.email,

            s.register_number,
            s.department,
            s.year

        FROM registrations r

        JOIN students s
            ON r.student_id = s.student_id

        JOIN users u
            ON s.user_id = u.user_id

        JOIN events e
            ON r.event_id = e.event_id

        JOIN organizers o
            ON e.organizer_id = o.organizer_id

        WHERE r.event_id = ?
        AND o.user_id = ?

        ORDER BY r.registered_at DESC
    `;

    db.query(
        sql,
        [
            req.params.eventId,
            req.user.user_id
        ],
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