const User = require("../models/User");


const { v4: uuidv4 } = require("uuid");

const sessions = {}; // token -> pendriveId




exports.createSession = (req, res) => {
  const { pendriveId } = req.body;
  
  if (!pendriveId) {
    return res.status(400).json({ message: "pendriveId required" });
  }

  const token = uuidv4();

  sessions[token] = {
    pendriveId,
    createdAt: Date.now()
  };

  res.json({ token });
};




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
  const { token, email } = req.body;
  if (!token || !sessions[token]) {
  return res.status(400).json({ message: "Invalid session" });
}

const session = sessions[token];

if (!session) {
  return res.status(400).json({ message: "Invalid session" });
}

const pendriveId = session.pendriveId;


  console.log("Sending email to:", email);
  try {
    const user = await User.findOne({ pendriveId });
    // console.log("User found for email verification:", pendriveId);
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

    res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" ,error: error.message});
  }
};




exports.verifyOtp = async (req, res) => {
  const { token, otp } = req.body;
  if (!token || !sessions[token]) {
  return res.status(400).json({ message: "Invalid session" });
}

const session = sessions[token];
if (!session) {
  return res.status(400).json({ message: "Invalid session" });
}

const pendriveId = session.pendriveId;

  try {


    const user = await User.findOne({ pendriveId });
    if (!user) {
      return res.status(404).json({ message: "Pendrive not registered" });
    }  


    const record = await Otp.findOne({ pendriveId, otp });

    if (!record) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ pendriveId });
      return res.status(401).json({ message: "OTP expired" });
    }


     user.isOtpVerified = true;
    await user.save();


    // OTP is valid → clear it
    await Otp.deleteMany({ pendriveId });
    delete sessions[token];
    res.json({
      accessGranted: true,
      message: "OTP verified, access granted"
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

setInterval(() => {
  const now = Date.now();

  for (let token in sessions) {
    if (now - sessions[token].createdAt > 5 * 60 * 1000) {
      delete sessions[token];
    }
  }
}, 60 * 1000);


exports.getPendriveStatus = async (req, res) => {
  const { pendriveId } = req.params;

  const user = await User.findOne({ pendriveId });

  if (!user) {
    return res.json({ status: "NOT_REGISTERED" });
  }
  // console.log("Pendrive found:", pendriveId, "OTP Verified:", user.isOtpVerified);
  if (user.isOtpVerified) {
    console.log("Pendrive authorized:", pendriveId);
    return res.json({ status: "AUTHORIZED" });
  }
  // console.log("Pendrive pending OTP verification:", pendriveId);

  return res.json({ status: "PENDING" });
};



// POST /api/pendrive/revoke
exports.revokePendrive = async (req, res) => {
  const { pendriveId } = req.body;

  await User.findOneAndUpdate(
    { pendriveId },
    { isOtpVerified: false }
  );

  console.log("Authorization revoked:", pendriveId);
  res.json({ revoked: true });
};






