const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationValidator, resendVerification);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.post("/reset-password", resetPasswordValidator, resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
