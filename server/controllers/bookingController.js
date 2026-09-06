const Booking = require("../models/Bookings.js");
const OTP = require("../models/OTP.js");
const Event = require("../models/Event.js");
const { sendBookingEmail, sendOTPEmail } = require("../utils/email.js");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendBookingOTP = async (req, res) => {
  const otp = generateOtp();
  await OTP.findOneAndDelete({
    email: req.user.email,
    action: "event_booking",
  });
  await OTP.create({
    email: req.user.email,
    otp: otp,
    action: "event_booking",
  });
  await sendOTPEmail(req.user.email, otp, "event_booking");
  res.json({ message: "OTP sent to email" });
};

exports.bookEvent = async (req, res) => {
  const { eventId, otp } = req.body;

  const otpRecord = await OTP.findOne({
    email: req.user.email,
    otp,
    action: "event_booking",
  });
  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ error: "event not found" });
  }

  if (event.availableSeats <= 0) {
    return res.status(400).json({ error: "No seats available" });
  }

  const existingBooking = await Booking.findOne({
    userId: req.user._id,
    eventId,
  });
  if (existingBooking) {
    return res
      .status(400)
      .json({ error: "you have already booked this event" });
  }

  const booking = await Booking.create({
    userId: req.user._id,
    eventId,
    status: "pending",
    paymentStatus: "not_paid",
    amount: event.ticketPrice,
  });

  await OTP.deleteMany({ email: req.user.email, action: "event_booking" });
  res.status(201).json({
    message: "Booking created. Please check your email for confirmation",
    booking,
  });
};

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

    // Already confirmed booking ko dobara confirm nahi karna
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

    // Booking confirm
    booking.status = "confirmed";

    // Agar payment pehle Razorpay se paid ho chuka hai,
    // to usko not_paid nahi karenge.
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


exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
    }).populate("eventId");

    // console.log("USER ID:", req.user._id);
    // console.log("MY BOOKINGS:", bookings);

    res.json(bookings);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

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
        error: "unauthorized",
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



exports.rejectBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                error: "Booking not found"
            });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({
                error: "Only pending bookings can be rejected"
            });
        }

        booking.status = "cancelled";
        await booking.save();

        res.json({
            message: "Booking rejected successfully"
        });

    } catch (error) {
        console.error("REJECT BOOKING ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
};