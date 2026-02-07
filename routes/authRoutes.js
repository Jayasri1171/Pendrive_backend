const express = require("express");
const router = express.Router();
const {
  registerPendrive,
  verifyEmail,
  verifyOtp
} = require("../controllers/authController");

router.post("/verify-otp", verifyOtp);

router.post("/verify-email", verifyEmail);


router.post("/register", registerPendrive);




module.exports = router;
