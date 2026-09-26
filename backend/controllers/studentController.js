const db = require("../config/db");


exports.getProfile = (req, res) => {

    const sql = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            s.student_id,
            s.register_number,
            s.department,
            s.year
        FROM users u
        JOIN students s
            ON u.user_id = s.user_id
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


exports.getEvents = (req, res) => {

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
        WHERE e.status = 'APPROVED'
        ORDER BY e.event_date ASC
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


exports.registerEvent = (req, res) => {

    const eventId = req.params.eventId;

    const getStudent = `
        SELECT student_id
        FROM students
        WHERE user_id = ?
    `;

    db.query(
        getStudent,
        [req.user.user_id],
        (error, studentResults) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (studentResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found"
                });
            }

            const studentId =
                studentResults[0].student_id;


            const checkEvent = `
                SELECT *
                FROM events
                WHERE event_id = ?
                AND status = 'APPROVED'
            `;

            db.query(
                checkEvent,
                [eventId],
                (error, eventResults) => {

                    if (error) {
                        return res.status(500).json({
                            success: false,
                            message: "Database error"
                        });
                    }

                    if (eventResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Approved event not found"
                        });
                    }

                    const event =
                        eventResults[0];


                    const countSql = `
                        SELECT COUNT(*) AS total
                        FROM registrations
                        WHERE event_id = ?
                        AND status = 'REGISTERED'
                    `;

                    db.query(
                        countSql,
                        [eventId],
                        (error, countResults) => {

                            if (error) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Database error"
                                });
                            }

                            const total =
                                countResults[0].total;

                            if (
                                event.capacity &&
                                total >= event.capacity
                            ) {
                                return res.status(400).json({
                                    success: false,
                                    message: "Event capacity is full"
                                });
                            }


                            const insertSql = `
                                INSERT INTO registrations
                                (event_id, student_id)
                                VALUES (?, ?)
                            `;

                            db.query(
                                insertSql,
                                [eventId, studentId],
                                (error) => {

                                    if (error) {

                                        if (
                                            error.code ===
                                            "ER_DUP_ENTRY"
                                        ) {
                                            return res.status(400).json({
                                                success: false,
                                                message: "Already registered"
                                            });
                                        }

                                        return res.status(500).json({
                                            success: false,
                                            message: "Registration failed"
                                        });
                                    }

                                    res.json({
                                        success: true,
                                        message: "Event registration successful"
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


exports.getMyEvents = (req, res) => {

    const sql = `
        SELECT
            e.event_id,
            e.event_name,
            e.category,
            e.event_date,
            e.start_time,
            e.end_time,
            e.venue,
            r.status,
            r.registered_at
        FROM registrations r

        JOIN students s
            ON r.student_id = s.student_id

        JOIN events e
            ON r.event_id = e.event_id

        WHERE s.user_id = ?

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


exports.submitFeedback = (req, res) => {

    const eventId = req.params.eventId;

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {

        return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5"
        });
    }

    const studentSql = `
        SELECT student_id
        FROM students
        WHERE user_id = ?
    `;

    db.query(
        studentSql,
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
                    message: "Student not found"
                });
            }

            const studentId =
                results[0].student_id;

            const sql = `
                INSERT INTO feedback
                (event_id, student_id, rating, comment)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    eventId,
                    studentId,
                    rating,
                    comment
                ],
                (error) => {

                    if (error) {

                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        ) {
                            return res.status(400).json({
                                success: false,
                                message: "Feedback already submitted"
                            });
                        }

                        return res.status(500).json({
                            success: false,
                            message: "Feedback failed"
                        });
                    }

                    res.json({
                        success: true,
                        message: "Feedback submitted successfully"
                    });
                }
            );
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


exports.markNotificationRead = (req, res) => {

    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = ?
        AND user_id = ?
    `;

    db.query(
        sql,
        [
            req.params.id,
            req.user.user_id
        ],
        (error) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            res.json({
                success: true,
                message: "Notification marked as read"
            });
        }
    );
};