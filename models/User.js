const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  pendriveId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  isOtpVerified: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

