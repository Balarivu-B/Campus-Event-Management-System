const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function seedData() {
    console.log("Seeding sample data into MySQL database...");

    const studentPass = await bcrypt.hash("student123", 10);
    const facultyPass = await bcrypt.hash("faculty123", 10);
    const organizerPass = await bcrypt.hash("organizer123", 10);

    // 1. Create Student
    db.query("SELECT user_id FROM users WHERE email = 'student@campus.edu'", (err, existing) => {
        if (err) return console.error(err);
        if (existing.length === 0) {
            const sqlUser = "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'STUDENT', 'ACTIVE')";
            db.query(sqlUser, ["Aarav Sharma", "student@campus.edu", studentPass], (err2, resUser) => {
                if (err2) return console.error("Error creating student user:", err2.message);
                const userId = resUser.insertId;
                const sqlStudent = "INSERT INTO students (user_id, register_number, department, year) VALUES (?, ?, ?, ?)";
                db.query(sqlStudent, [userId, "2026CSE001", "Computer Science and Engineering", 3], (err3) => {
                    if (err3) return console.error("Error creating student profile:", err3.message);
                    console.log("✓ Added 1 Student: Aarav Sharma (student@campus.edu / 2026CSE001)");
                });
            });
        } else {
            console.log("Student already exists in database.");
        }
    });

    // 2. Create Faculty
    db.query("SELECT user_id FROM users WHERE email = 'faculty@campus.edu'", (err, existing) => {
        if (err) return console.error(err);
        if (existing.length === 0) {
            const sqlUser = "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'FACULTY', 'ACTIVE')";
            db.query(sqlUser, ["Dr. S. Venkatesh", "faculty@campus.edu", facultyPass], (err2, resUser) => {
                if (err2) return console.error("Error creating faculty user:", err2.message);
                const userId = resUser.insertId;
                const sqlFaculty = "INSERT INTO faculty (user_id, department, institution) VALUES (?, ?, ?)";
                db.query(sqlFaculty, [userId, "Computer Science and Engineering", "Main College Campus"], (err3) => {
                    if (err3) return console.error("Error creating faculty profile:", err3.message);
                    console.log("✓ Added 1 Faculty: Dr. S. Venkatesh (faculty@campus.edu)");
                });
            });
        } else {
            console.log("Faculty already exists in database.");
        }
    });

    // 3. Create Organizer & 2 Events
    db.query("SELECT user_id FROM users WHERE email = 'organizer@campus.edu'", (err, existing) => {
        if (err) return console.error(err);
        if (existing.length === 0) {
            const sqlUser = "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'ORGANIZER', 'ACTIVE')";
            db.query(sqlUser, ["Campus Tech Club Lead", "organizer@campus.edu", organizerPass], (err2, resUser) => {
                if (err2) return console.error("Error creating organizer user:", err2.message);
                const userId = resUser.insertId;
                const sqlOrg = "INSERT INTO organizers (user_id, organization_name, institution) VALUES (?, ?, ?)";
                db.query(sqlOrg, [userId, "Computer Science Club", "Main College Campus"], (err3, orgRes) => {
                    if (err3) return console.error("Error creating organizer profile:", err3.message);
                    const organizerId = orgRes.insertId;
                    console.log("✓ Added 1 Organizer: Computer Science Club (organizer@campus.edu)");

                    // 4. Add 2 Events for this Organizer
                    const sqlEvent1 = `
                        INSERT INTO events 
                        (organizer_id, event_name, category, event_date, start_time, end_time, venue, capacity, description, status, approved_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', 1)
                    `;
                    db.query(sqlEvent1, [
                        organizerId,
                        "Full-Stack Web Development Bootcamp",
                        "Workshop",
                        "2026-10-15",
                        "09:30:00",
                        "16:30:00",
                        "Seminar Hall A",
                        60,
                        "Comprehensive practical bootcamp covering modern JavaScript, Express REST APIs, and database integration."
                    ], (evErr1, evRes1) => {
                        if (evErr1) console.error("Event 1 error:", evErr1.message);
                        else console.log("✓ Added Event 1: Full-Stack Web Development Bootcamp (ID: " + evRes1.insertId + ")");

                        const sqlEvent2 = `
                            INSERT INTO events 
                            (organizer_id, event_name, category, event_date, start_time, end_time, venue, capacity, description, status, approved_by)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', 1)
                        `;
                        db.query(sqlEvent2, [
                            organizerId,
                            "AI & Cloud Innovation Summit 2026",
                            "Seminar",
                            "2026-10-25",
                            "10:00:00",
                            "14:00:00",
                            "Main Auditorium",
                            120,
                            "Keynote sessions on reasoning models, autonomous systems, and enterprise cloud architecture."
                        ], (evErr2, evRes2) => {
                            if (evErr2) console.error("Event 2 error:", evErr2.message);
                            else console.log("✓ Added Event 2: AI & Cloud Innovation Summit 2026 (ID: " + evRes2.insertId + ")");

                            setTimeout(() => {
                                console.log("Seeding completed successfully.");
                                process.exit(0);
                            }, 500);
                        });
                    });
                });
            });
        } else {
            console.log("Organizer already exists in database.");
        }
    });
}

seedData();
