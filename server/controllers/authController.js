const User = require("../models/User.js");
const OTP = require("../models/OTP.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {sendOTPEmail} = require("../utils/email.js");


const generateToken = (id , role) =>{
   return jwt.sign({id,role}, process.env.JWT_SECRET, {expiresIn: "7d"});
}

// Register user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  let userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      error: "User already exists",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: true,
    });

    res.status(201).json({
      message: "User registered successfully. Please login.",
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};



// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      error: "Invalid credentials Please Sign Up first",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      error: "Invalid credentials",
    });
  }

  res.json({
    message: "Login successful",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
};



// verify OTP 
exports.verifyOtp = async(req,res)=>{
  const {email , otp} = req.body;
  const otpRecord = await OTP.findOne({email, otp , action: "account_verification"});

  if(!otpRecord){
    return res.status(400).json({error: "Invalid or expired OTP"});
  }

  const user = await User.findOneAndUpdate({email},{isVerified : true},{new : true});
  await OTP.deleteMany({email , action: "account_verification"});  // Remove used OTPs
  res.json({
    message: "Account verified successfully. You can now log in.",
    _id: user._id,
    name:user.name,
    email:user.email,
    role: user.role,
    token: generateToken(user._id , user.role)
  }
  );

} 




// Send OTP for Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "User not found. Please check your email.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`Password reset OTP for ${email}: ${otp}`);

    // Delete old password reset OTP
    await OTP.deleteMany({
      email,
      action: "password_reset",
    });

    // Create new OTP
    await OTP.create({
      email,
      otp,
      action: "password_reset",
    });

    // Send OTP
    await sendOTPEmail(email, otp, "password_reset");

    res.json({
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};


// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      action: "password_reset",
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Delete used OTP
    await OTP.deleteMany({
      email,
      action: "password_reset",
    });

    res.json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};