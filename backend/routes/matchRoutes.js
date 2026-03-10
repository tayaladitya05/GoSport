const express = require("express");
const Match = require("../models/Match");
const MatchPlayer = require("../models/MatchPlayer");

const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");
// const Match = require("../models/Match");

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

// PLAYER MARK AVAILABILITY
router.put("/availability/:matchPlayerId", protect, async (req, res) => {
  try {

    const { availability } = req.body;

    const matchPlayer = await MatchPlayer.findById(req.params.matchPlayerId);

    if (!matchPlayer) {
      return res.status(404).json({ message: "Entry not found" });
    }

    matchPlayer.availability = availability;

    await matchPlayer.save();

    res.json(matchPlayer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET MATCH SCORECARD
router.get("/:matchId/scorecard", protect, async (req, res) => {
  try {

    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    let stats;

    if (match.sportType === "cricket") {
      stats = await CricketStat.find({ match: match._id })
        .populate({
          path: "player",
          populate: { path: "user", select: "name" }
        });
    } 
    else if (match.sportType === "football") {
      stats = await FootballStat.find({ match: match._id })
        .populate({
          path: "player",
          populate: { path: "user", select: "name" }
        });
    }

    res.json({
      match,
      stats
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;