const express = require("express");
const Player = require("../models/Player");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/* CREATE PLAYER (Admin Only) */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const player = await Player.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* GET ALL PLAYERS */
router.get("/", protect, async (req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;