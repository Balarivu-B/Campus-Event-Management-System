const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'cems_secret_jwt_key_2026_super_secure_college_project';

// Public Registration
async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword, institution, department, phone, role } = req.body;

    // 1. Required field checks
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // 3. Password length and confirmation checks
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // 4. Role restriction: public registration defaults to STUDENT, allow ORGANIZER or FACULTY if requested, but NEVER ADMIN
    let assignedRole = 'STUDENT';
    if (role && ['STUDENT', 'ORGANIZER', 'FACULTY'].includes(role.toUpperCase())) {
      assignedRole = role.toUpperCase();
    }

    // 5. Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const assignedInstitution = institution ? institution.trim() : 'College of Engineering';

    // 7. Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, institution, department, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword, assignedRole, assignedInstitution, department || null, phone || null]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      institution: assignedInstitution,
      department: department || null,
      phone: phone || null
    };

    // Create welcome notification
    await pool.query(
      `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
      [result.insertId, `Welcome to CEMS, ${newUser.name}! Your account has been created successfully.`, 'INFO']
    );

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: newUser
    });
  } catch (error) {
    next(error);
  }
}

// Login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, institution, department, phone, is_active FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, institution: user.institution },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      department: user.department,
      phone: user.phone
    };

    return res.json({
      message: 'Login successful.',
      token,
      user: userProfile
    });
  } catch (error) {
    next(error);
  }
}

// Get Current Logged In User
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, institution, department, phone, is_active, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
}

// Check registered Faculty for an institution
async function getFacultyByInstitution(req, res, next) {
  try {
    const institution = (req.query.institution || '').trim();
    if (!institution) {
      return res.json({ faculty: [] });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, department, institution FROM users WHERE role = ? AND is_active = TRUE AND institution = ?',
      ['FACULTY', institution]
    );

    return res.json({ faculty: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  getFacultyByInstitution
};
