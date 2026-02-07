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
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
