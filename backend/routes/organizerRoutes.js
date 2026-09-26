const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/organizerController");

const {
    verifyToken,
    allowRole
} = require("../middleware/authMiddleware");


router.get(
    "/profile",
    verifyToken,
    allowRole("ORGANIZER"),
    controller.getProfile
);


router.post(
    "/events",
    verifyToken,
    allowRole("ORGANIZER"),
    controller.createEvent
);


router.get(
    "/events",
    verifyToken,
    allowRole("ORGANIZER"),
    controller.getEvents
);


router.put(
    "/events/:eventId",
    verifyToken,
    allowRole("ORGANIZER"),
    controller.updateEvent
);


router.delete(
    "/events/:eventId",
    verifyToken,
    allowRole("ORGANIZER"),
    controller.deleteEvent
);


router.get(
    "/events/:eventId/registrations",
    verifyToken,
    allowRole("ORGANIZER"),
    controller.getRegistrations
);


router.get(
    "/notifications",
    verifyToken,
    allowRole("ORGANIZER"),
    controller.getNotifications
);


module.exports = router;