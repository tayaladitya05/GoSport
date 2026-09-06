const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getAccessToken } = require("../utils/authCookie");

const JWT_SECRET = () => process.env.JWT_SECRET || "dev-secret-change-in-production";

const protect = async (req, res, next) => {
  try {
    const token = getAccessToken(req);
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET());
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }

    if ((user.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
      return res.status(401).json({ message: "Not authorized, token invalidated" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};

module.exports = { protect, adminOnly };
