const { Resend } = require("resend");
const dotenv = require("dotenv");

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "BookMyEvent <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <h2>Hi ${userName}!</h2>
        <p>
          Your booking for the event
          <strong>${eventTitle}</strong>
          is successfully confirmed.
        </p>
        <p>Thank you for choosing BookMyEvent.</p>
      `,
    });

    if (error) {
      console.error("Error sending booking email:", error);
      return;
    }

    console.log("Booking email sent successfully:", data.id);
  } catch (error) {
    console.error("Error sending booking email:", error);
  }
};

const sendOTPEmail = async (email, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Verify your BookMyEvent Account"
        : type === "password_reset"
          ? "Reset your BookMyEvent Password"
          : "BookMyEvent Booking Verification";

    const msg =
      type === "account_verification"
        ? "Please use the following OTP to verify your new BookMyEvent account."
        : type === "password_reset"
          ? "Please use the following OTP to reset your BookMyEvent password."
          : "Please use the following OTP to verify and confirm your event booking.";

    const { data, error } = await resend.emails.send({
      from: "BookMyEvent <onboarding@resend.dev>",
      to: [email],
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          
          <h2 style="color: #111;">
            ${title}
          </h2>

          <p style="color: #555; font-size: 16px;">
            ${msg}
          </p>

          <div style="
            margin: 20px auto;
            padding: 15px;
            font-size: 24px;
            font-weight: bold;
            background: #f4f4f4;
            width: max-content;
            letter-spacing: 5px;
          ">
            ${otp}
          </div>

          <p style="color: #999; font-size: 12px;">
            This code expires in 5 minutes.
            If you didn't request this, please ignore this email.
          </p>

        </div>
      `,
    });

    if (error) {
      console.error("Error sending OTP email:", error);
      return;
    }

    console.log(`OTP email sent to ${email} for ${type}. ID: ${data.id}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

module.exports = {
  sendBookingEmail,
  sendOTPEmail,
};