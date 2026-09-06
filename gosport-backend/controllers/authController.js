const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Player = require("../models/Player");
const { sendVerificationEmail } = require("../utils/sendEmail");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    hashed: hashToken(token),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

function frontendBaseUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function issueVerificationEmail(user) {
  const { token, hashed, expires } = createVerificationToken();
  user.verificationToken = hashed;
  user.verificationExpires = expires;
  await user.save();

  const verifyUrl = `${frontendBaseUrl()}/verify-email?token=${token}`;
  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verifyUrl,
  });
}

// @desc    Register a new user (and Player profile if role === 'player')
// @route   POST /api/auth/register
// @access  Public / Admin
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      sportType,
      teamName,
      playerRole,
      jerseyNumber
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isSpectator = role === "spectator";

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: !isSpectator,
    });

    await user.save();

    if (role === "player") {
      await Player.create({
        user: user._id,
        sportType,
        teamName,
        role: playerRole,
        jerseyNumber,
        createdBy: user._id
      });
    }

    if (isSpectator) {
      try {
        await issueVerificationEmail(user);
      } catch (mailErr) {
        console.error("Verification email failed:", mailErr.message);
        return res.status(201).json({
          message: "Account created, but the verification email could not be sent. Use resend verification.",
          requiresVerification: true,
          emailSent: false,
        });
      }

      return res.status(201).json({
        message: "Check your email to verify your spectator account.",
        requiresVerification: true,
        emailSent: true,
      });
    }

    res.json({ message: "User registered successfully" });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    if (user.role === "spectator" && user.isVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before signing in.",
        requiresVerification: true,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret-change-in-production",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Verify spectator email from the frontend /verify-email page
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Verification token is missing" });
    }

    const hashed = hashToken(token);
    const user = await User.findOne({
      role: "spectator",
      verificationToken: hashed,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "This verification link is invalid or has expired" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    res.json({ message: "Email verified. You can now sign in." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Resend spectator verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email, role: "spectator" });
    if (!user) {
      return res.json({ message: "If that email needs verification, a new link has been sent." });
    }

    if (user.isVerified) {
      return res.json({ message: "This account is already verified. You can sign in." });
    }

    await issueVerificationEmail(user);
    res.json({ message: "A new verification email has been sent." });
  } catch (err) {
    console.error("Resend verification failed:", err.message);
    res.status(500).json({ message: "Could not send verification email. Check SMTP settings." });
  }
};
