const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.js");

const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController.js");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;