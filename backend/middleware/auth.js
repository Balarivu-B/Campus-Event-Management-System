const jwt = require('jsonwebtoken');
const pool = require('../db');

// Authenticate token middleware
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'cems_secret_jwt_key_2026_super_secure_college_project';
    const decoded = jwt.verify(token, secret);

    // Optional safety verification: check user is active in DB
    try {
      const [rows] = await pool.query('SELECT id, name, email, role, institution, department, phone, is_active FROM users WHERE id = ?', [decoded.id]);
      if (!rows.length || !rows[0].is_active) {
        return res.status(401).json({ message: 'User account is inactive or no longer exists.' });
      }
      req.user = rows[0];
    } catch (dbErr) {
      // Fallback to decoded token payload if db error happens
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role, institution: decoded.institution };
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Optional authenticate: attaches req.user if token is valid, but does not block if missing
async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'cems_secret_jwt_key_2026_super_secure_college_project';
    const decoded = jwt.verify(token, secret);
    const [rows] = await pool.query('SELECT id, name, email, role, institution, department, phone, is_active FROM users WHERE id = ?', [decoded.id]);
    if (rows.length && rows[0].is_active) {
      req.user = rows[0];
    }
  } catch (err) {
    // Ignore invalid token in optional mode
  }
  next();
}

// Authorize roles middleware
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please login.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize
};
