const pool = require('../db');

// Get Notifications for Current User
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;

    const [notifications] = await pool.query(
      'SELECT id, user_id, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return res.json({
      notifications,
      unreadCount: countRows && countRows[0] ? countRows[0].unread_count : 0
    });
  } catch (error) {
    next(error);
  }
}

// Mark Notification as Read
async function markNotificationRead(req, res, next) {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
}

// Mark All as Read
async function markAllNotificationsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
