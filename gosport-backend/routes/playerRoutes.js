const express = require("express");
const Player = require("../models/Player");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");

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

// GET LOGGED IN PLAYER PROFILE
router.get("/me", protect, async (req, res) => {
  try {
    const player = await Player.findOne({ user: req.user._id }).populate("user", "name email");
    if (!player) return res.status(404).json({ message: "Player profile not found" });
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET PLAYER CAREER STATS
router.get("/:playerId/stats", protect, async (req, res) => {
  try {

    const playerId = req.params.playerId;

    // cricket stats
    const cricketStats = await CricketStat.find({ player: playerId });

    // football stats
    const footballStats = await FootballStat.find({ player: playerId });

    // aggregate cricket data
    const totalRuns = cricketStats.reduce((sum, s) => sum + s.runs, 0);
    const totalWickets = cricketStats.reduce((sum, s) => sum + s.wickets, 0);
    const matchesPlayedCricket = cricketStats.length;

    // aggregate football data
    const totalGoals = footballStats.reduce((sum, s) => sum + s.goals, 0);
    const totalAssists = footballStats.reduce((sum, s) => sum + s.assists, 0);
    const matchesPlayedFootball = footballStats.length;

    res.json({
      cricket: {
        matches: matchesPlayedCricket,
        runs: totalRuns,
        wickets: totalWickets
      },
      football: {
        matches: matchesPlayedFootball,
        goals: totalGoals,
        assists: totalAssists
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;