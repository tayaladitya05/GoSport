const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "player", "spectator"],
    required: true
  },
  // Spectators must verify email. Admin/player accounts created in-app skip this.
  isVerified: {
    type: Boolean,
    default: true
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
