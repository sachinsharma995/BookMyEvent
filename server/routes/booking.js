const express = require("express");

const router = express.Router();

const { protect, admin } = require("../middleware/auth.js");

const {
  bookEvent,
  getMyBookings,
  getAllBookings,
  confirmBooking,
  cancelBooking,
  rejectBooking,
} = require("../controllers/bookingController.js");

// Create booking
router.post("/", protect, bookEvent);

// Admin - get all bookings
router.get("/", protect, admin, getAllBookings);

// User - get my bookings
router.get("/my", protect, getMyBookings);

// Admin - approve booking
router.put("/:id/confirm", protect, admin, confirmBooking);

// Admin - reject booking
router.put("/:id/reject", protect, admin, rejectBooking);

// User - cancel booking
router.delete("/:id", protect, cancelBooking);

module.exports = router;