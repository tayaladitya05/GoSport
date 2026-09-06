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
  },
  // Incremented on logout so previously issued JWTs stop working.
  tokenVersion: {
    type: Number,
    default: 0
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      tokenVersion: this.tokenVersion || 0,
    },
    process.env.JWT_SECRET || "dev-secret-change-in-production",
    { expiresIn: "1d" }
  );
};

module.exports = mongoose.model("User", userSchema);
