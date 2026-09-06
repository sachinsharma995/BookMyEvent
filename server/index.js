const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.js")
const eventRoutes = require("./routes/events.js")
const bookingRoutes = require("./routes/booking.js")
const paymentRoutes = require("./routes/payment.js");

dotenv.config();

const app = express();
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://bookmyevent-frontend.onrender.com"
        ],
        credentials: true,
    })
);
app.use(express.json());

// Routes
 app.use("/api/auth", authRoutes);
 app.use("/api/events", eventRoutes);
 app.use("/api/bookings", bookingRoutes);
 app.use("/api/payments", paymentRoutes);

// connect to mongodb
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("connected to mongodb");
})

.catch((error)=>{
   console.error("error connecting to mongodb",error);
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0",()=>{
    console.log(`server is running on port ${PORT}`);
})