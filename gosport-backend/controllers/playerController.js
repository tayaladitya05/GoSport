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

// @desc    Get all players with populated user and aggregated career stats
// @route   GET /api/players
// @access  Protected
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate("user", "name email").sort({ createdAt: -1 });

    const [cricketAgg, footballAgg] = await Promise.all([
      CricketStat.aggregate([
        {
          $group: {
            _id: "$player",
            matches: { $sum: 1 },
            runs: { $sum: "$runs" },
            fours: { $sum: "$fours" },
            sixes: { $sum: "$sixes" },
            wickets: { $sum: "$wickets" },
            overs: { $sum: "$overs" },
          },
        },
      ]),
      FootballStat.aggregate([
        {
          $group: {
            _id: "$player",
            matches: { $sum: 1 },
            goals: { $sum: "$goals" },
            assists: { $sum: "$assists" },
            yellowCards: { $sum: "$yellowCards" },
            redCards: { $sum: "$redCards" },
            minutesPlayed: { $sum: "$minutesPlayed" },
          },
        },
      ]),
    ]);

    const cricketMap = {};
    cricketAgg.forEach((c) => {
      cricketMap[c._id.toString()] = c;
    });

    const footballMap = {};
    footballAgg.forEach((f) => {
      footballMap[f._id.toString()] = f;
    });

    const enrichedPlayers = players.map((p) => {
      const pObj = p.toObject();
      if (p.sportType === "cricket") {
        pObj.stats = cricketMap[p._id.toString()] || {
          matches: 0,
          runs: 0,
          fours: 0,
          sixes: 0,
          wickets: 0,
          overs: 0,
        };
      } else {
        pObj.stats = footballMap[p._id.toString()] || {
          matches: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0,
        };
      }
      return pObj;
    });

    res.json(enrichedPlayers);
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

// @desc    Get player career stats and match performances
// @route   GET /api/players/:playerId/stats
// @access  Protected
exports.getPlayerCareerStats = async (req, res) => {
  try {
    const playerId = req.params.playerId;

    // cricket stats with populated match
    const cricketStats = await CricketStat.find({ player: playerId }).populate("match");

    // football stats with populated match
    const footballStats = await FootballStat.find({ player: playerId }).populate("match");

    // aggregate cricket data
    const totalRuns = cricketStats.reduce((sum, s) => sum + (s.runs || 0), 0);
    const totalFours = cricketStats.reduce((sum, s) => sum + (s.fours || 0), 0);
    const totalSixes = cricketStats.reduce((sum, s) => sum + (s.sixes || 0), 0);
    const totalWickets = cricketStats.reduce((sum, s) => sum + (s.wickets || 0), 0);
    const totalOvers = cricketStats.reduce((sum, s) => sum + (s.overs || 0), 0);
    const totalBallsFaced = cricketStats.reduce((sum, s) => sum + (s.ballsFaced || 0), 0);
    const matchesPlayedCricket = cricketStats.length;
    const strikeRate = totalBallsFaced > 0 ? ((totalRuns / totalBallsFaced) * 100).toFixed(1) : "0.0";

    // aggregate football data
    const totalGoals = footballStats.reduce((sum, s) => sum + (s.goals || 0), 0);
    const totalAssists = footballStats.reduce((sum, s) => sum + (s.assists || 0), 0);
    const totalYellowCards = footballStats.reduce((sum, s) => sum + (s.yellowCards || 0), 0);
    const totalRedCards = footballStats.reduce((sum, s) => sum + (s.redCards || 0), 0);
    const totalMinutes = footballStats.reduce((sum, s) => sum + (s.minutesPlayed || 0), 0);
    const matchesPlayedFootball = footballStats.length;

    // Format match performances sorted by matchDate descending
    const cricketMatches = cricketStats
      .filter((s) => s.match)
      .map((s) => ({
        statId: s._id,
        matchId: s.match._id,
        matchName: s.match.matchName,
        matchDate: s.match.matchDate,
        venue: s.match.venue,
        status: s.match.status,
        teams: s.match.teams,
        runs: s.runs || 0,
        ballsFaced: s.ballsFaced || 0,
        fours: s.fours || 0,
        sixes: s.sixes || 0,
        wickets: s.wickets || 0,
        overs: s.overs || 0,
        isOut: s.isOut || false,
        strikeRate: s.ballsFaced > 0 ? ((s.runs / s.ballsFaced) * 100).toFixed(1) : "0.0",
      }))
      .sort((a, b) => new Date(b.matchDate || 0) - new Date(a.matchDate || 0));

    const footballMatches = footballStats
      .filter((s) => s.match)
      .map((s) => ({
        statId: s._id,
        matchId: s.match._id,
        matchName: s.match.matchName,
        matchDate: s.match.matchDate,
        venue: s.match.venue,
        status: s.match.status,
        teams: s.match.teams,
        goals: s.goals || 0,
        assists: s.assists || 0,
        yellowCards: s.yellowCards || 0,
        redCards: s.redCards || 0,
        minutesPlayed: s.minutesPlayed || 0,
      }))
      .sort((a, b) => new Date(b.matchDate || 0) - new Date(a.matchDate || 0));

    res.json({
      cricket: {
        matches: matchesPlayedCricket,
        runs: totalRuns,
        fours: totalFours,
        sixes: totalSixes,
        wickets: totalWickets,
        overs: totalOvers,
        ballsFaced: totalBallsFaced,
        strikeRate,
      },
      football: {
        matches: matchesPlayedFootball,
        goals: totalGoals,
        assists: totalAssists,
        yellowCards: totalYellowCards,
        redCards: totalRedCards,
        minutesPlayed: totalMinutes,
      },
      cricketMatches,
      footballMatches,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
