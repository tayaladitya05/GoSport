const Player = require("../models/Player");
const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");

// @desc    Get public skill profile & scouting data for a player
// @route   GET /api/public/players/:playerId/skills
// @access  Public
exports.getPlayerSkills = async (req, res) => {
  try {
    const playerId = req.params.playerId;

    const player = await Player.findById(playerId).populate("user", "name");

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const cricketStats = await CricketStat.find({ player: playerId });
    const footballStats = await FootballStat.find({ player: playerId });

    const cricket = {
      matches: cricketStats.length,
      runs: cricketStats.reduce((s, x) => s + x.runs, 0),
      ballsFaced: cricketStats.reduce((s, x) => s + x.ballsFaced, 0),
      fours: cricketStats.reduce((s, x) => s + x.fours, 0),
      sixes: cricketStats.reduce((s, x) => s + x.sixes, 0),
      wickets: cricketStats.reduce((s, x) => s + x.wickets, 0),
      overs: cricketStats.reduce((s, x) => s + x.overs, 0),
    };

    const football = {
      matches: footballStats.length,
      goals: footballStats.reduce((s, x) => s + x.goals, 0),
      assists: footballStats.reduce((s, x) => s + x.assists, 0),
      yellowCards: footballStats.reduce((s, x) => s + x.yellowCards, 0),
      redCards: footballStats.reduce((s, x) => s + x.redCards, 0),
      minutesPlayed: footballStats.reduce((s, x) => s + x.minutesPlayed, 0),
    };

    res.json({
      player: {
        id: player._id,
        displayName: player.user?.name ?? null,
        sportType: player.sportType,
        teamName: player.teamName,
        role: player.role,
        jerseyNumber: player.jerseyNumber,
      },
      cricket,
      football,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
