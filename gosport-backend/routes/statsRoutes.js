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

// ADD MATCH SCORE
router.put("/cricket/update", protect, adminOnly, async (req, res) => {

  try {

    const { matchId, playerId, teamName, runs, isWicket, wicketBowlerId } = req.body;
    const runsNum = Number(runs) || 0;
    const isWicketBool = Boolean(isWicket);

    // update player stats
    let playerStat = await CricketStat.findOne({
      match: matchId,
      player: playerId
    });

    if (!playerStat) {
      playerStat = new CricketStat({ match: matchId, player: playerId });
    }

    playerStat.runs += runsNum;
    playerStat.ballsFaced += 1;
    if (runsNum === 4) playerStat.fours += 1;
    if (runsNum === 6) playerStat.sixes += 1;
    if (isWicketBool) {
      playerStat.isOut = true;
    }

    await playerStat.save();

    // Increment bowler's wicket stat if a bowler is provided
    if (isWicketBool && wicketBowlerId) {
      let bowlerStat = await CricketStat.findOne({
        match: matchId,
        player: wicketBowlerId
      });
      if (!bowlerStat) {
        bowlerStat = new CricketStat({ match: matchId, player: wicketBowlerId });
      }
      bowlerStat.wickets += 1;
      await bowlerStat.save();
    }

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

    teamScore.runs += runsNum;
    
    if (isWicketBool) {
      teamScore.wickets += 1;
    }

    // overs logic: calculate total balls, add 1, then rewrite
    let totalBalls = Math.floor(teamScore.overs) * 6 + Math.round((teamScore.overs * 10) % 10);
    totalBalls += 1;
    teamScore.overs = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;

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

// UPDATE FOOTBALL MATCH SCORE
router.put("/football/update", protect, adminOnly, async (req, res) => {
  try {
    const { matchId, playerId, teamName, goals, assists, yellowCards, redCards, minutesPlayed } = req.body;

    let playerStat = await FootballStat.findOne({
      match: matchId,
      player: playerId,
    });

    if (!playerStat) {
      playerStat = new FootballStat({ match: matchId, player: playerId });
    }

    playerStat.goals += (Number(goals) || 0);
    playerStat.assists += (Number(assists) || 0);
    playerStat.yellowCards += (Number(yellowCards) || 0);
    playerStat.redCards += (Number(redCards) || 0);
    playerStat.minutesPlayed += (Number(minutesPlayed) || 0);
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

    teamScore.goals += (Number(goals) || 0);
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