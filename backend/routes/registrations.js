const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middleware/auth');

// Student registers for an event (Admin may also test)
router.post('/', authenticate, authorize('STUDENT', 'ADMIN'), registrationController.registerEvent);

// Student views their registrations
router.get('/my', authenticate, authorize('STUDENT', 'ADMIN'), registrationController.getMyRegistrations);

// Cancel a registration
router.delete('/:id', authenticate, registrationController.cancelRegistration);

module.exports = router;
