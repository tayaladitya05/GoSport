const express = require("express");
const Match = require("../models/Match");
const MatchPlayer = require("../models/MatchPlayer");

const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");
const MatchScore = require("../models/MatchScore");

/**
 * CREATE MATCH
 * POST /api/matches
 * For cricket: create MatchScore per team (runs, wickets, overs).
 * For football: create MatchScore per team (goals) so score updates work.
 */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.create({
      ...req.body,
      createdBy: req.user._id,
    });

    if (!match.teams || match.teams.length === 0) {
      return res.status(201).json(match);
    }

    if (match.sportType === "cricket") {
      await MatchScore.insertMany(
        match.teams.map((teamName) => ({
          match: match._id,
          teamName,
          runs: 0,
          wickets: 0,
          overs: 0,
        }))
      );
    } else if (match.sportType === "football") {
      await MatchScore.insertMany(
        match.teams.map((teamName) => ({
          match: match._id,
          teamName,
          goals: 0,
        }))
      );
    }

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
// Returns every playing player (from MatchPlayer) with their stats for this match.
// Cricket: R, B, 4s, 6s, SR (+ wickets, overs for bowling). Football: goals, assists, etc.
router.get("/:matchId/scorecard", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // All players selected for this match (playing XI / squad)
    const matchPlayers = await MatchPlayer.find({ match: match._id }).populate({
      path: "player",
      populate: { path: "user", select: "name" },
    });

    let stats;
    let playerScorecards = [];

    if (match.sportType === "cricket") {
      stats = await CricketStat.find({ match: match._id });
      const statByPlayer = new Map(stats.map((s) => [s.player.toString(), s]));

      for (const mp of matchPlayers) {
        const p = mp.player;
        const name = p?.user?.name ?? "Unknown";
        const stat = statByPlayer.get(p._id.toString()) || {};
        const runs = stat.runs ?? 0;
        const balls = stat.ballsFaced ?? 0;
        const strikeRate =
          balls > 0 ? ((runs / balls) * 100).toFixed(2) : "0.00";

        playerScorecards.push({
          playerId: p._id,
          playerName: name,
          teamName: mp.teamName,
          batting: {
            runs,
            balls,
            fours: stat.fours ?? 0,
            sixes: stat.sixes ?? 0,
            strikeRate,
          },
          bowling: {
            wickets: stat.wickets ?? 0,
            overs: stat.overs ?? 0,
          },
        });
      }
    } else if (match.sportType === "football") {
      stats = await FootballStat.find({ match: match._id });
      const statByPlayer = new Map(stats.map((s) => [s.player.toString(), s]));

      for (const mp of matchPlayers) {
        const p = mp.player;
        const name = p?.user?.name ?? "Unknown";
        const stat = statByPlayer.get(p._id.toString()) || {};

        playerScorecards.push({
          playerId: p._id,
          playerName: name,
          teamName: mp.teamName,
          goals: stat.goals ?? 0,
          assists: stat.assists ?? 0,
          yellowCards: stat.yellowCards ?? 0,
          redCards: stat.redCards ?? 0,
          minutesPlayed: stat.minutesPlayed ?? 0,
        });
      }
    }

    const teamScores = await MatchScore.find({ match: match._id });

    res.json({
      match,
      stats,
      teamScores,
      playerScorecards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;