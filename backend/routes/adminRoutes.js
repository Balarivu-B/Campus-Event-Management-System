const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/adminController");

const {
    verifyToken,
    allowRole
} = require("../middleware/authMiddleware");


router.get(
    "/dashboard",
    verifyToken,
    allowRole("ADMIN"),
    controller.getDashboard
);


router.get(
    "/students",
    verifyToken,
    allowRole("ADMIN"),
    controller.getStudents
);


router.get(
    "/faculty",
    verifyToken,
    allowRole("ADMIN"),
    controller.getFaculty
);


router.get(
    "/organizers",
    verifyToken,
    allowRole("ADMIN"),
    controller.getOrganizers
);


router.get(
    "/events",
    verifyToken,
    allowRole("ADMIN"),
    controller.getEvents
);


router.put(
    "/events/:eventId/cancel",
    verifyToken,
    allowRole("ADMIN"),
    controller.cancelEvent
);


router.get(
    "/reports",
    verifyToken,
    allowRole("ADMIN"),
    controller.getReports
);


router.get(
    "/notifications",
    verifyToken,
    allowRole("ADMIN"),
    controller.getNotifications
);


module.exports = router;