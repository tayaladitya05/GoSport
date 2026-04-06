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
    let playerStat = await CricketStat.findOne({
      match: matchId,
      player: playerId
    });

    if (!playerStat) {
      playerStat = new CricketStat({ match: matchId, player: playerId });
    }

    playerStat.runs += runs;
    playerStat.ballsFaced += 1;
    if (runs === 4) playerStat.fours += 1;
    if (runs === 6) playerStat.sixes += 1;

    await playerStat.save();

    let teamScore = await MatchScore.findOne({
      match: matchId,
      teamName
    });

    if (!teamScore) {
      teamScore = new MatchScore({
          match: matchId,
          teamName: teamName,
          runs: 0,
          wickets: 0,
          overs: 0
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

    let playerStat = await FootballStat.findOne({
      match: matchId,
      player: playerId,
    });

    if (!playerStat) {
      playerStat = new FootballStat({ match: matchId, player: playerId });
    }

    playerStat.goals += 1;
    await playerStat.save();

    let teamScore = await MatchScore.findOne({
      match: matchId,
      teamName,
    });

    if (!teamScore) {
      teamScore = new MatchScore({
          match: matchId,
          teamName: teamName,
          goals: 0
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