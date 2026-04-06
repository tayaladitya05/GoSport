const express = require("express");
const Match = require("../models/Match");
const MatchPlayer = require("../models/MatchPlayer");
const Player = require("../models/Player");

const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");
const MatchScore = require("../models/MatchScore");
const {
  DEFAULT_SQUAD_SIZE,
  scoreCricketPlayer,
  scoreFootballPlayer,
} = require("../utils/aiSquad");

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
 * AI squad suggestion (cricket) — admin only.
 * Ranks players in this match by career CricketStat; returns up to min(11, maxSlots, N).
 * POST /api/matches/:matchId/ai-squad/cricket
 * Body (optional): { "maxSlots": 11 }
 */
router.post("/:matchId/ai-squad/cricket", protect, adminOnly, async (req, res) => {
  try {
    const maxSlots = Math.min(
      Number(req.body?.maxSlots) || DEFAULT_SQUAD_SIZE,
      DEFAULT_SQUAD_SIZE
    );

    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    if (match.sportType !== "cricket") {
      return res.status(400).json({ message: "This match is not a cricket match" });
    }

    const matchPlayers = await MatchPlayer.find({ match: match._id }).populate({
      path: "player",
      populate: { path: "user", select: "name" },
    });

    const candidates = matchPlayers.filter(
      (mp) => mp.player && mp.player.sportType === "cricket"
    );

    const ranked = [];
    for (const mp of candidates) {
      const stats = await CricketStat.find({ player: mp.player._id });
      const { score, reason, career } = scoreCricketPlayer(mp.player.role, stats);
      ranked.push({
        matchPlayerId: mp._id,
        playerId: mp.player._id,
        playerName: mp.player.user?.name ?? "Unknown",
        teamName: mp.teamName,
        role: mp.player.role,
        score: Math.round(score * 100) / 100,
        reason,
        careerMatches: career.matches,
      });
    }

    ranked.sort((a, b) => b.score - a.score);
    const cap = Math.min(maxSlots, ranked.length);
    const squad = ranked.slice(0, cap);

    let message = "";
    if (ranked.length === 0) {
      message =
        "No cricket players linked to this match. Add players with POST /api/matches/:matchId/add-player.";
    } else if (ranked.length < maxSlots) {
      message = `Only ${ranked.length} cricket player(s) in this match squad — returning all, ranked.`;
    } else {
      message = `Top ${squad.length} picks by career form (heuristic score).`;
    }

    res.json({
      matchId: match._id,
      sportType: "cricket",
      requestedSlots: maxSlots,
      availablePlayers: ranked.length,
      filledSlots: squad.length,
      squad,
      message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * AI squad suggestion (football) — admin only.
 * POST /api/matches/:matchId/ai-squad/football
 */
router.post("/:matchId/ai-squad/football", protect, adminOnly, async (req, res) => {
  try {
    const maxSlots = Math.min(
      Number(req.body?.maxSlots) || DEFAULT_SQUAD_SIZE,
      DEFAULT_SQUAD_SIZE
    );

    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    if (match.sportType !== "football") {
      return res.status(400).json({ message: "This match is not a football match" });
    }

    const matchPlayers = await MatchPlayer.find({ match: match._id }).populate({
      path: "player",
      populate: { path: "user", select: "name" },
    });

    const candidates = matchPlayers.filter(
      (mp) => mp.player && mp.player.sportType === "football"
    );

    const ranked = [];
    for (const mp of candidates) {
      const stats = await FootballStat.find({ player: mp.player._id });
      const { score, reason, career } = scoreFootballPlayer(mp.player.role, stats);
      ranked.push({
        matchPlayerId: mp._id,
        playerId: mp.player._id,
        playerName: mp.player.user?.name ?? "Unknown",
        teamName: mp.teamName,
        role: mp.player.role,
        score: Math.round(score * 100) / 100,
        reason,
        careerMatches: career.matches,
      });
    }

    ranked.sort((a, b) => b.score - a.score);
    const cap = Math.min(maxSlots, ranked.length);
    const squad = ranked.slice(0, cap);

    let message = "";
    if (ranked.length === 0) {
      message =
        "No football players linked to this match. Add players with POST /api/matches/:matchId/add-player.";
    } else if (ranked.length < maxSlots) {
      message = `Only ${ranked.length} football player(s) in this match squad — returning all, ranked.`;
    } else {
      message = `Top ${squad.length} picks by career form (heuristic score).`;
    }

    res.json({
      matchId: match._id,
      sportType: "football",
      requestedSlots: maxSlots,
      availablePlayers: ranked.length,
      filledSlots: squad.length,
      squad,
      message,
    });
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

// UPDATE MATCH STATUS (Admin Only)
router.put("/:matchId/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.status = status;
    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PLAYER MARK AVAILABILITY FOR A MATCH
router.post("/:matchId/availability", protect, async (req, res) => {
  try {
    const { availability } = req.body;
    
    // Find player profile of the logged-in user
    const player = await Player.findOne({ user: req.user._id });
    if (!player) return res.status(404).json({ message: "Player profile not found" });

    // Check if match exists
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Check if player is already in MatchPlayer for this match
    let matchPlayer = await MatchPlayer.findOne({ match: req.params.matchId, player: player._id });

    if (matchPlayer) {
      matchPlayer.availability = availability;
      await matchPlayer.save();
    } else {
      // Create new matchPlayer entry as Unassigned
      matchPlayer = await MatchPlayer.create({
        match: req.params.matchId,
        player: player._id,
        teamName: "Unassigned",
        isStarting: false,
        availability: availability
      });
    }

    res.json(matchPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN UPDATE MATCHPLAYER (Assign to Team / Starting)
router.put("/matchplayer/:matchPlayerId", protect, adminOnly, async (req, res) => {
  try {
    const { teamName, isStarting } = req.body;
    const matchPlayer = await MatchPlayer.findById(req.params.matchPlayerId);
    if (!matchPlayer) return res.status(404).json({ message: "MatchPlayer not found" });

    if (teamName !== undefined) matchPlayer.teamName = teamName;
    if (isStarting !== undefined) matchPlayer.isStarting = isStarting;

    await matchPlayer.save();
    
    res.json(matchPlayer);
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