const express = require("express");
const Match = require("../models/Match");

const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

/**
 * CREATE MATCH
 * POST /api/matches
 */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.create({...req.body,createdBy: req.user._id,});
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET ALL MATCHES
 * GET /api/matches
 */
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;