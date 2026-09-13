const pool = require('../db');
const bcrypt = require('bcryptjs');

// Get All Users (Admin only, supports search and filters)
async function getUsers(req, res, next) {
  try {
    const { role, is_active, search } = req.query;

    const conditions = [];
    const params = [];

    if (role && role !== 'All') {
      conditions.push('role = ?');
      params.push(role);
    }

    if (is_active !== undefined && is_active !== '') {
      conditions.push('is_active = ?');
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    }

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR department LIKE ?)');
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, name, email, role, institution, department, phone, is_active, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const [users] = await pool.query(sql, params);
    return res.json({ users });
  } catch (error) {
    next(error);
  }
}

// Get User by ID (Admin or Self)
async function getUserById(req, res, next) {
  try {
    const userId = req.params.id;

    if (req.user.role !== 'ADMIN' && parseInt(req.user.id, 10) !== parseInt(userId, 10)) {
      return res.status(403).json({ message: 'Forbidden. You can only view your own account.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, role, institution, department, phone, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
}

// Update User (Admin or Self updating details)
async function updateUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, institution, department, phone, role, is_active, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = rows[0];

    // Check permissions
    const isAdmin = req.user.role === 'ADMIN';
    const isSelf = parseInt(req.user.id, 10) === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Forbidden. You cannot update other users.' });
    }

    // Role & is_active change permissions: ONLY Admin can change role and is_active
    let updatedRole = targetUser.role;
    if (isAdmin && role) {
      updatedRole = role;
    }

    let updatedIsActive = targetUser.is_active;
    if (isAdmin && is_active !== undefined) {
      updatedIsActive = is_active ? 1 : 0;
    }

    // Safeguard: Do not allow deactivating or changing role of the LAST active admin
    if (targetUser.role === 'ADMIN' && (updatedRole !== 'ADMIN' || updatedIsActive === 0)) {
      const [adminCount] = await pool.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN' AND is_active = TRUE AND id != ?",
        [userId]
      );
      if (adminCount[0].count === 0) {
        return res.status(400).json({
          message: 'Action prohibited. Cannot deactivate or demote the only active Administrator account.'
        });
      }
    }

    // Optional password update
    let passwordClause = '';
    const updateParams = [
      name ? name.trim() : targetUser.name,
      institution !== undefined ? institution : targetUser.institution,
      department !== undefined ? department : targetUser.department,
      phone !== undefined ? phone : targetUser.phone,
      updatedRole,
      updatedIsActive
    ];

    if (password && password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      passwordClause = ', password = ?';
      updateParams.push(hashedPassword);
    }

    updateParams.push(userId);

    const updateSql = `
      UPDATE users
      SET name = ?, institution = ?, department = ?, phone = ?, role = ?, is_active = ? ${passwordClause}
      WHERE id = ?
    `;

    await pool.query(updateSql, updateParams);

    const [updatedUserRows] = await pool.query(
      'SELECT id, name, email, role, institution, department, phone, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    return res.json({
      message: 'User updated successfully.',
      user: updatedUserRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// Delete User (Admin only)
async function deleteUser(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const targetUser = rows[0];

    // Safeguard: Never delete the last active admin
    if (targetUser.role === 'ADMIN') {
      const [adminCount] = await pool.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN' AND is_active = TRUE AND id != ?",
        [userId]
      );
      if (adminCount[0].count === 0) {
        return res.status(400).json({
          message: 'Action prohibited. Cannot delete the only remaining Administrator account.'
        });
      }
    }

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    return res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
