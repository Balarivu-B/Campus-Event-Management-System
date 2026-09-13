const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin only: list all users
router.get('/', authenticate, authorize('ADMIN'), userController.getUsers);

// Admin or Self: get user details
router.get('/:id', authenticate, userController.getUserById);

// Admin or Self: update user details
router.put('/:id', authenticate, userController.updateUser);

// Admin only: delete user
router.delete('/:id', authenticate, authorize('ADMIN'), userController.deleteUser);

module.exports = router;
