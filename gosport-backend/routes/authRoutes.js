const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
  resendVerificationValidator,
} = require("../validators/authValidator");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationValidator, resendVerification);

module.exports = router;
