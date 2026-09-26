const bcrypt = require("bcryptjs");
const db = require("./db");

async function initAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Campus Administrator";

    const checkSql = "SELECT user_id, email, password FROM users WHERE email = ? LIMIT 1";

    db.query(checkSql, [adminEmail], async (error, results) => {
        if (error) {
            console.error("Admin verification query failed:", error.message);
            return;
        }

        if (results.length === 0) {
            try {
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                const insertSql = `
                    INSERT INTO users (name, email, password, role, status)
                    VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')
                `;

                db.query(insertSql, [adminName, adminEmail, hashedPassword], (insertErr) => {
                    if (insertErr) {
                        console.error("Failed to initialize default admin account:", insertErr.message);
                    } else {
                        console.log(`Default admin account initialized in database (${adminEmail})`);
                    }
                });
            } catch (hashErr) {
                console.error("Error hashing admin password:", hashErr.message);
            }
        } else {
            console.log(`Admin account verified in database (${adminEmail})`);
        }
    });
}

module.exports = initAdmin;
