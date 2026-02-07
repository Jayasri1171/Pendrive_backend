const User = require("../models/User");

// Register pendrive + email
exports.registerPendrive = async (req, res) => {
  const { pendriveId, email } = req.body;

  try {
    const existing = await User.findOne({ pendriveId });
    if (existing) {
      return res.status(400).json({ message: "Pendrive already registered" });
    }

    const user = new User({ pendriveId, email });
    await user.save();

    res.json({ message: "Pendrive registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



const Otp = require("../models/Otp");
const sendOtp = require("../utils/sendOtp");

exports.verifyEmail = async (req, res) => {
  const { pendriveId, email } = req.body;

  try {
    const user = await User.findOne({ pendriveId });

    if (!user || user.email !== email) {
      return res.status(401).json({ message: "Email not authorized" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ pendriveId }); // clear old OTPs

    await Otp.create({
      pendriveId,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min
    });

    await sendOtp(email, otp);

    res.json({ message: "OTP sent to registered email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};




exports.verifyOtp = async (req, res) => {
  const { pendriveId, otp } = req.body;

  try {
    const record = await Otp.findOne({ pendriveId, otp });

    if (!record) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ pendriveId });
      return res.status(401).json({ message: "OTP expired" });
    }

    // OTP is valid → clear it
    await Otp.deleteMany({ pendriveId });

    res.json({
      accessGranted: true,
      message: "OTP verified, access granted"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
