const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth');

// Public / discovery routes (enhanced if authenticated)
router.get('/', optionalAuthenticate, eventController.getEvents);
router.get('/:id', optionalAuthenticate, eventController.getEventById);
router.get('/:id/participants', authenticate, registrationController.getEventParticipants);

// Organizer / Admin routes
router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.createEvent);
router.put('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.updateEvent);
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.deleteEvent);
router.put('/:id/cancel', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.cancelEvent);

// Faculty / Admin approval routes
router.put('/:id/approve', authenticate, authorize('FACULTY', 'ADMIN'), eventController.approveEvent);
router.put('/:id/reject', authenticate, authorize('FACULTY', 'ADMIN'), eventController.rejectEvent);

module.exports = router;
