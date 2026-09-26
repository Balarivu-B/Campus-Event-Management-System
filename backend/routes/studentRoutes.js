const express = require("express");

const router = express.Router();

const studentController =
    require("../controllers/studentController");

const {
    verifyToken,
    allowRole
} = require("../middleware/authMiddleware");


router.get(
    "/profile",
    verifyToken,
    allowRole("STUDENT"),
    studentController.getProfile
);


router.get(
    "/events",
    verifyToken,
    allowRole("STUDENT"),
    studentController.getEvents
);


router.post(
    "/events/:eventId/register",
    verifyToken,
    allowRole("STUDENT"),
    studentController.registerEvent
);


router.get(
    "/my-events",
    verifyToken,
    allowRole("STUDENT"),
    studentController.getMyEvents
);


router.post(
    "/events/:eventId/feedback",
    verifyToken,
    allowRole("STUDENT"),
    studentController.submitFeedback
);


router.get(
    "/notifications",
    verifyToken,
    allowRole("STUDENT"),
    studentController.getNotifications
);


router.put(
    "/notifications/:id/read",
    verifyToken,
    allowRole("STUDENT"),
    studentController.markNotificationRead
);


module.exports = router;