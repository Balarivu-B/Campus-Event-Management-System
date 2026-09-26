const express = require("express");
const cors = require("cors");

require("dotenv").config();

require("./config/db");


const authRoutes =
    require("./routes/authRoutes");

const studentRoutes =
    require("./routes/studentRoutes");

const facultyRoutes =
    require("./routes/facultyRoutes");

const organizerRoutes =
    require("./routes/organizerRoutes");

const adminRoutes =
    require("./routes/adminRoutes");


const app = express();


/* -------------------------
   MIDDLEWARE
------------------------- */

app.use(cors());

app.use(express.json());


/* -------------------------
   TEST ROUTE
------------------------- */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Campus Event Management API is running"
    });
});


/* -------------------------
   DATABASE TEST
------------------------- */

const db = require("./config/db");

app.get("/api/test-db", (req, res) => {

    db.query(
        "SELECT 1 AS test",
        (error, results) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message: "Database connection failed",
                    error: error.message
                });
            }

            res.json({
                success: true,
                message: "MySQL connection successful",
                result: results
            });
        }
    );
});


/* -------------------------
   PUBLIC EVENTS ENDPOINT
------------------------- */

app.get("/api/events", (req, res) => {

    const sql = `
        SELECT
            e.event_id AS id,
            e.event_name AS name,
            e.category,
            DATE_FORMAT(e.event_date, '%d %M %Y') AS date,
            e.event_date,
            IFNULL(TIME_FORMAT(e.start_time, '%h:%i %p'), '10:00 AM') AS start_time,
            IFNULL(TIME_FORMAT(e.end_time, '%h:%i %p'), '04:00 PM') AS end_time,
            CONCAT(IFNULL(TIME_FORMAT(e.start_time, '%h:%i %p'), '10:00 AM'), ' - ', IFNULL(TIME_FORMAT(e.end_time, '%h:%i %p'), '04:00 PM')) AS time,
            e.venue,
            e.capacity AS totalSeats,
            e.capacity AS seats,
            e.description,
            e.status,
            o.organization_name AS coordinator,
            o.organization_name AS organizer,
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
                message: "Database error",
                error: error.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});


/* -------------------------
   API ROUTES
------------------------- */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/student",
    studentRoutes
);

app.use(
    "/api/faculty",
    facultyRoutes
);

app.use(
    "/api/organizer",
    organizerRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


/* -------------------------
   START SERVER & INIT ADMIN
------------------------- */

const initAdmin = require("./config/initAdmin");

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

    initAdmin();
});