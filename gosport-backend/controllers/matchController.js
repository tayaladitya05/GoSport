const Match = require("../models/Match");
const MatchPlayer = require("../models/MatchPlayer");
const Player = require("../models/Player");
const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");
const MatchScore = require("../models/MatchScore");
const {
  DEFAULT_SQUAD_SIZE,
  scoreCricketPlayer,
  scoreFootballPlayer,
} = require("../utils/aiSquad");

// @desc    Create a new match
// @route   POST /api/matches
// @access  Admin
exports.createMatch = async (req, res) => {
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
};

// @desc    Add player to match
// @route   POST /api/matches/:matchId/add-player
// @access  Admin
exports.addPlayerToMatch = async (req, res) => {
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
};

// @desc    Get all players assigned to a match
// @route   GET /api/matches/:matchId/players
// @access  Protected
exports.getMatchPlayers = async (req, res) => {
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
};

// @desc    AI squad suggestion for Cricket match
// @route   POST /api/matches/:matchId/ai-squad/cricket
// @access  Admin
exports.getCricketAiSquad = async (req, res) => {
  try {
    const maxSlots = Math.min(
      Number(req.body?.maxSlots) || DEFAULT_SQUAD_SIZE,
      DEFAULT_SQUAD_SIZE
    );
    const targetTeam = req.body?.teamName;

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
      (mp) => mp.player && mp.player.sportType === "cricket" && mp.teamName === targetTeam && !mp.isStarting
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
      message = "No cricket players linked to this match. Add players with POST /api/matches/:matchId/add-player.";
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
};

// @desc    AI squad suggestion for Football match
// @route   POST /api/matches/:matchId/ai-squad/football
// @access  Admin
exports.getFootballAiSquad = async (req, res) => {
  try {
    const maxSlots = Math.min(
      Number(req.body?.maxSlots) || DEFAULT_SQUAD_SIZE,
      DEFAULT_SQUAD_SIZE
    );
    const targetTeam = req.body?.teamName;

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
      (mp) => mp.player && mp.player.sportType === "football" && mp.teamName === targetTeam && !mp.isStarting
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
      message = "No football players linked to this match. Add players with POST /api/matches/:matchId/add-player.";
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
};

// @desc    Get all matches
// @route   GET /api/matches
// @access  Public / Protected
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match status (e.g. upcoming, live, completed)
// @route   PUT /api/matches/:matchId/status
// @access  Admin
exports.updateMatchStatus = async (req, res) => {
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
};

// @desc    Mark availability for logged in player for a match
// @route   POST /api/matches/:matchId/availability
// @access  Protected (Player)
exports.markPlayerAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const player = await Player.findOne({ user: req.user._id });
    if (!player) return res.status(404).json({ message: "Player profile not found" });

    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    let matchPlayer = await MatchPlayer.findOne({ match: req.params.matchId, player: player._id });

    if (matchPlayer) {
      matchPlayer.availability = availability;
      await matchPlayer.save();
    } else {
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
};

// @desc    Admin update match player team assignment or starting status
// @route   PUT /api/matches/matchplayer/:matchPlayerId
// @access  Admin
exports.updateMatchPlayer = async (req, res) => {
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
};

// @desc    Bulk apply AI squad recommendations to starting XI
// @route   PUT /api/matches/:matchId/ai-squad-apply
// @access  Admin
exports.applyAiSquad = async (req, res) => {
  try {
    const { matchPlayerIds } = req.body;
    if (!Array.isArray(matchPlayerIds)) {
      return res.status(400).json({ message: "matchPlayerIds must be an array" });
    }

    await MatchPlayer.updateMany(
      { _id: { $in: matchPlayerIds }, match: req.params.matchId },
      { $set: { isStarting: true } }
    );

    res.json({ message: "Squad successfully applied to Starting 11." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update player availability by MatchPlayer entry ID
// @route   PUT /api/matches/availability/:matchPlayerId
// @access  Protected
exports.updatePlayerAvailabilityById = async (req, res) => {
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
};

// @desc    Get complete match scorecard
// @route   GET /api/matches/:matchId/scorecard
// @access  Protected
exports.getMatchScorecard = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const matchPlayers = await MatchPlayer.find({ match: match._id, isStarting: true }).populate({
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
            isOut: stat.isOut ?? false,
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
};
