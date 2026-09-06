const Booking = require("../models/Bookings.js");
const Event = require("../models/Event.js");

// Create Booking
exports.bookEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({
        error: "No seats available",
      });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "You have already booked this event",
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      status: "pending",
      paymentStatus: "not_paid",
      amount: event.ticketPrice,
    });

    res.status(201).json({
      message: "Booking created. Please complete payment.",
      booking,
    });
  } catch (error) {
    console.error("BOOK EVENT ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// Confirm Booking - Admin Approval
exports.confirmBooking = async (req, res) => {
  try {
    const paymentStatus = req.body.paymentStatus;

    if (!["paid", "not_paid"].includes(paymentStatus)) {
      return res.status(400).json({
        error: "Invalid payment status",
      });
    }

    const booking = await Booking.findById(req.params.id).populate("eventId");

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({
        error: "Booking is already confirmed",
      });
    }

    const event = await Event.findById(booking.eventId._id);

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({
        error: "No seats available",
      });
    }

    // Admin approval ke baad booking confirm hogi
    booking.status = "confirmed";

    // Agar payment already paid hai to paid hi rahega
    if (booking.paymentStatus !== "paid") {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    // Seat sirf admin approval ke time decrease hogi
    event.availableSeats -= 1;
    await event.save();

    res.json({
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("CONFIRM BOOKING ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// Get All Bookings - Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("eventId");

    res.json(bookings);
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// Get My Bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
    }).populate("eventId");

    res.json(bookings);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        error: "Booking is already cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// Reject Booking - Admin
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        error: "Only pending bookings can be rejected",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      message: "Booking rejected successfully",
    });
  } catch (error) {
    console.error("REJECT BOOKING ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};