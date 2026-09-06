const express = require("express");

const router = express.Router();

const { protect, admin } = require("../middleware/auth.js");

const {
  bookEvent,
  sendBookingOTP,
  getMyBookings,
  getAllBookings,
  confirmBooking,
  cancelBooking,
  rejectBooking,
} = require("../controllers/bookingController.js");


router.post("/", protect, bookEvent);
router.post("/send-otp", protect, sendBookingOTP);
router.get("/", protect, admin, getAllBookings);
router.get("/my", protect, getMyBookings);
router.put("/:id/confirm", protect, admin, confirmBooking);
router.put("/:id/reject", protect, admin, rejectBooking);
router.delete("/:id", protect, cancelBooking);

module.exports = router;
