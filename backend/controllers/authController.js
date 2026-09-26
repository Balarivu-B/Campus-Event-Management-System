const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        AND status = 'ACTIVE'
    `;

    db.query(sql, [email], async (error, results) => {

        if (error) {

            return res.status(500).json({
                success: false,
                message: "Database error",
                error: error.message
            });
        }

        if (results.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        let userProfile = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        if (user.role === "STUDENT") {
            db.query("SELECT register_number, department, year FROM students WHERE user_id = ?", [user.user_id], (err, pRes) => {
                if (!err && pRes && pRes.length > 0) {
                    userProfile = { ...userProfile, ...pRes[0] };
                }
                return res.json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: userProfile
                });
            });
        } else if (user.role === "FACULTY") {
            db.query("SELECT department, institution FROM faculty WHERE user_id = ?", [user.user_id], (err, pRes) => {
                if (!err && pRes && pRes.length > 0) {
                    userProfile = { ...userProfile, ...pRes[0] };
                }
                return res.json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: userProfile
                });
            });
        } else if (user.role === "ORGANIZER") {
            db.query("SELECT organization_name, institution FROM organizers WHERE user_id = ?", [user.user_id], (err, pRes) => {
                if (!err && pRes && pRes.length > 0) {
                    userProfile = { ...userProfile, ...pRes[0] };
                }
                return res.json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: userProfile
                });
            });
        } else {
            return res.json({
                success: true,
                message: "Login successful",
                token,
                user: userProfile
            });
        }
    });
};

exports.register = (req, res) => {

    const {
        name,
        email,
        password,
        role,

        register_number,
        department,
        year,

        institution,
        organization_name
    } = req.body;


    /*
    --------------------------------
    BASIC VALIDATION
    --------------------------------
    */

    if (
        !name ||
        !email ||
        !password ||
        !role
    ) {

        return res.status(400).json({
            success: false,
            message: "Name, email, password and role are required"
        });
    }

    if (password.length < 5) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 5 characters"
        });
    }


    /*
    --------------------------------
    ADMIN REGISTRATION NOT ALLOWED
    --------------------------------
    */

    if (role === "ADMIN") {

        return res.status(403).json({
            success: false,
            message: "Admin accounts cannot be created through registration"
        });
    }


    /*
    --------------------------------
    VALID ROLE
    --------------------------------
    */

    const allowedRoles = [
        "STUDENT",
        "FACULTY",
        "ORGANIZER"
    ];


    if (!allowedRoles.includes(role)) {

        return res.status(400).json({
            success: false,
            message: "Invalid account type"
        });
    }


    /*
    --------------------------------
    ROLE-SPECIFIC VALIDATION
    --------------------------------
    */

    if (role === "STUDENT") {

        if (
            !register_number ||
            !department ||
            !year
        ) {

            return res.status(400).json({
                success: false,
                message: "Student details are required"
            });
        }
    }


    if (role === "FACULTY") {

        if (
            !department ||
            !institution
        ) {

            return res.status(400).json({
                success: false,
                message: "Faculty details are required"
            });
        }
    }


    if (role === "ORGANIZER") {

        if (
            !organization_name ||
            !institution
        ) {

            return res.status(400).json({
                success: false,
                message: "Organizer details are required"
            });
        }
    }


    /*
    --------------------------------
    CHECK EMAIL
    --------------------------------
    */

    const checkEmailSql = `
        SELECT user_id
        FROM users
        WHERE email = ?
    `;


    db.query(
        checkEmailSql,
        [email],
        async (error, results) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message: "Database error",
                    error: error.message
                });
            }


            if (results.length > 0) {

                return res.status(409).json({
                    success: false,
                    message: "Email already registered"
                });
            }


            const proceedWithRegistration = async () => {

                try {

                    const hashedPassword =
                        await bcrypt.hash(
                            password,
                            10
                        );


                    /*
                    --------------------------------
                    INSERT USER
                    --------------------------------
                    */

                    const insertUserSql = `
                        INSERT INTO users
                        (
                            name,
                            email,
                            password,
                            role
                        )
                        VALUES (?, ?, ?, ?)
                    `;


                    db.query(
                        insertUserSql,
                        [
                            name,
                            email,
                            hashedPassword,
                            role
                        ],
                        (error, result) => {

                            if (error) {

                                return res.status(500).json({
                                    success: false,
                                    message: "User registration failed",
                                    error: error.message
                                });
                            }


                            const userId =
                                result.insertId;


                            /*
                            --------------------------------
                            STUDENT
                            --------------------------------
                            */

                            if (role === "STUDENT") {

                                const studentSql = `
                                    INSERT INTO students
                                    (
                                        user_id,
                                        register_number,
                                        department,
                                        year
                                    )
                                    VALUES (?, ?, ?, ?)
                                `;


                                db.query(
                                    studentSql,
                                    [
                                        userId,
                                        register_number,
                                        department,
                                        year
                                    ],
                                    (error) => {

                                        if (error) {

                                            db.query("DELETE FROM users WHERE user_id = ?", [userId]);

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Student profile creation failed",
                                                error:
                                                    error.message
                                            });
                                        }


                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Student account created successfully"
                                        });
                                    }
                                );

                                return;
                            }


                            /*
                            --------------------------------
                            FACULTY
                            --------------------------------
                            */

                            if (role === "FACULTY") {

                                const facultySql = `
                                    INSERT INTO faculty
                                    (
                                        user_id,
                                        department,
                                        institution
                                    )
                                    VALUES (?, ?, ?)
                                `;


                                db.query(
                                    facultySql,
                                    [
                                        userId,
                                        department,
                                        institution
                                    ],
                                    (error) => {

                                        if (error) {

                                            db.query("DELETE FROM users WHERE user_id = ?", [userId]);

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Faculty profile creation failed",
                                                error:
                                                    error.message
                                            });
                                        }


                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Faculty account created successfully"
                                        });
                                    }
                                );

                                return;
                            }


                            /*
                            --------------------------------
                            ORGANIZER
                            --------------------------------
                            */

                            if (role === "ORGANIZER") {

                                const organizerSql = `
                                    INSERT INTO organizers
                                    (
                                        user_id,
                                        organization_name,
                                        institution
                                    )
                                    VALUES (?, ?, ?)
                                `;


                                db.query(
                                    organizerSql,
                                    [
                                        userId,
                                        organization_name,
                                        institution
                                    ],
                                    (error) => {

                                        if (error) {

                                            db.query("DELETE FROM users WHERE user_id = ?", [userId]);

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Organizer profile creation failed",
                                                error:
                                                    error.message
                                            });
                                        }


                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Organizer account created successfully"
                                        });
                                    }
                                );

                                return;
                            }

                        }
                    );

                } catch (error) {

                    return res.status(500).json({
                        success: false,
                        message: "Password encryption failed"
                    });
                }
            };


            if (role === "STUDENT") {

                const checkRegSql = `
                    SELECT student_id
                    FROM students
                    WHERE register_number = ?
                `;

                db.query(
                    checkRegSql,
                    [register_number],
                    (regError, regResults) => {

                        if (regError) {

                            return res.status(500).json({
                                success: false,
                                message: "Database error",
                                error: regError.message
                            });
                        }

                        if (regResults.length > 0) {

                            return res.status(409).json({
                                success: false,
                                message: "Register number is already registered"
                            });
                        }

                        proceedWithRegistration();
                    }
                );

            } else {

                proceedWithRegistration();
            }

        }
    );
};