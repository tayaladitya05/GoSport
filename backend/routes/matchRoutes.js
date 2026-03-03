const express = require("express");
const Match = require("../models/Match");
const MatchPlayer = require("../models/MatchPlayer");

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

// ADD PLAYER TO MATCH (Admin Only)
router.post("/:matchId/add-player", protect, adminOnly, async (req, res) => {
  try {
    const { playerId, teamName, isStarting } = req.body;

    const matchPlayer = await MatchPlayer.create({
      match: req.params.matchId,
      player: playerId,
      teamName,
      isStarting
    });

    res.status(201).json(matchPlayer);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET ALL PLAYERS OF A MATCH
router.get("/:matchId/players", protect, async (req, res) => {
  try {
    const players = await MatchPlayer.find({
      match: req.params.matchId
    }).populate({
      path: "player",
      populate: {
        path: "user",
        select: "name email"
      }
    });

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
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