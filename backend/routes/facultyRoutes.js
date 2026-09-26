const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/facultyController");

const {
    verifyToken,
    allowRole
} = require("../middleware/authMiddleware");


router.get(
    "/profile",
    verifyToken,
    allowRole("FACULTY"),
    controller.getProfile
);


router.get(
    "/event-requests",
    verifyToken,
    allowRole("FACULTY"),
    controller.getEventRequests
);


router.put(
    "/events/:eventId/approve",
    verifyToken,
    allowRole("FACULTY"),
    controller.approveEvent
);


router.put(
    "/events/:eventId/reject",
    verifyToken,
    allowRole("FACULTY"),
    controller.rejectEvent
);


router.get(
    "/approved-events",
    verifyToken,
    allowRole("FACULTY"),
    controller.getApprovedEvents
);


router.get(
    "/notifications",
    verifyToken,
    allowRole("FACULTY"),
    controller.getNotifications
);


module.exports = router;