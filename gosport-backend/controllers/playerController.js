const Player = require("../models/Player");
const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");

// @desc    Create player profile (Admin Only)
// @route   POST /api/players
// @access  Admin
exports.createPlayer = async (req, res) => {
  try {
    const player = await Player.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all players
// @route   GET /api/players
// @access  Protected
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in player profile
// @route   GET /api/players/me
// @access  Protected
exports.getLoggedInPlayer = async (req, res) => {
  try {
    const player = await Player.findOne({ user: req.user._id }).populate("user", "name email");
    if (!player) return res.status(404).json({ message: "Player profile not found" });
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get player career stats
// @route   GET /api/players/:playerId/stats
// @access  Protected
exports.getPlayerCareerStats = async (req, res) => {
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
};
