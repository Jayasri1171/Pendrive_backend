const express = require("express");
const router = express.Router();
const {
  registerPendrive,
  verifyEmail,
  verifyOtp,
  getPendriveStatus,
  revokePendrive
} = require("../controllers/authController");

router.post("/verify-otp", verifyOtp);

router.post("/verify-email", verifyEmail);


router.post("/register", registerPendrive);


router.get("/status/:pendriveId", getPendriveStatus);

router.post("/revoke", revokePendrive)



module.exports = router;
