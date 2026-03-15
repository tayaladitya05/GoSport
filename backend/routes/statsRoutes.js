const express = require("express");
const router = express.Router();

const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const MatchScore = require("../models/MatchScore");

// ADD CRICKET STATS
router.post("/cricket", protect, adminOnly, async (req, res) => {
  try {

    const stat = await CricketStat.create(req.body);

    res.status(201).json(stat);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ADD FOOTBALL STATS
router.post("/football", protect, adminOnly, async (req, res) => {
  try {

    const stat = await FootballStat.create(req.body);

    res.status(201).json(stat);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//ADD MATCH SCORE
router.put("/cricket/update", protect, adminOnly, async (req, res) => {

  try {

    const { matchId, playerId, teamName, runs } = req.body;

    // update player stats
    const playerStat = await CricketStat.findOne({
      match: matchId,
      player: playerId
    });

    if (!playerStat) {
      return res.status(404).json({ message: "Player stat not found" });
    }

    playerStat.runs += runs;
    playerStat.ballsFaced += 1;

    await playerStat.save();

    // update team score (MatchScore is created when admin creates a cricket match)
    const teamScore = await MatchScore.findOne({
      match: matchId,
      teamName
    });

    if (!teamScore) {
      return res.status(404).json({
        message: "Team score not found. Make sure the match was created with this team name."
      });
    }

    teamScore.runs += runs;

    await teamScore.save();

    // Real-time: notify all connected clients (spectators) so they see the update live
    const io = req.app.get("io");
    if (io) {
      const teamScores = await MatchScore.find({ match: matchId }).lean();
      io.emit("scoreUpdate", { matchId, sportType: "cricket", teamScores });
    }

    res.json({
      message: "Score updated",
      playerStat,
      teamScore
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE FOOTBALL MATCH SCORE (goal scored: update team total + scorer's stat)
router.put("/football/update", protect, adminOnly, async (req, res) => {
  try {
    const { matchId, playerId, teamName } = req.body;

    const playerStat = await FootballStat.findOne({
      match: matchId,
      player: playerId,
    });

    if (!playerStat) {
      return res.status(404).json({ message: "Player stat not found" });
    }

    playerStat.goals += 1;
    await playerStat.save();

    const teamScore = await MatchScore.findOne({
      match: matchId,
      teamName,
    });

    if (!teamScore) {
      return res.status(404).json({
        message: "Team score not found. Make sure the match was created with this team name.",
      });
    }

    teamScore.goals += 1;
    await teamScore.save();

    // Real-time: notify all connected clients (spectators) so they see the update live
    const io = req.app.get("io");
    if (io) {
      const teamScores = await MatchScore.find({ match: matchId }).lean();
      io.emit("scoreUpdate", { matchId, sportType: "football", teamScores });
    }

    res.json({
      message: "Goal recorded",
      playerStat,
      teamScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;