const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createMatch,
  addPlayerToMatch,
  getMatchPlayers,
  getCricketAiSquad,
  getFootballAiSquad,
  getAllMatches,
  updateMatchStatus,
  markPlayerAvailability,
  updateMatchPlayer,
  applyAiSquad,
  updatePlayerAvailabilityById,
  getMatchScorecard
} = require("../controllers/matchController");

// CREATE MATCH
router.post("/", protect, adminOnly, createMatch);

// ADD PLAYER TO MATCH (Admin Only)
router.post("/:matchId/add-player", protect, adminOnly, addPlayerToMatch);

// GET ALL PLAYERS OF A MATCH
router.get("/:matchId/players", protect, getMatchPlayers);

// AI SQUAD SUGGESTION (CRICKET)
router.post("/:matchId/ai-squad/cricket", protect, adminOnly, getCricketAiSquad);

// AI SQUAD SUGGESTION (FOOTBALL)
router.post("/:matchId/ai-squad/football", protect, adminOnly, getFootballAiSquad);

// GET ALL MATCHES
router.get("/", getAllMatches);

// UPDATE MATCH STATUS
router.put("/:matchId/status", protect, adminOnly, updateMatchStatus);

// PLAYER MARK AVAILABILITY FOR A MATCH
router.post("/:matchId/availability", protect, markPlayerAvailability);

// ADMIN UPDATE MATCHPLAYER (Assign to Team / Starting)
router.put("/matchplayer/:matchPlayerId", protect, adminOnly, updateMatchPlayer);

// BULK APPLY AI SQUAD TO PLAYING 11
router.put("/:matchId/ai-squad-apply", protect, adminOnly, applyAiSquad);

// PLAYER MARK AVAILABILITY
router.put("/availability/:matchPlayerId", protect, updatePlayerAvailabilityById);

// GET MATCH SCORECARD
router.get("/:matchId/scorecard", protect, getMatchScorecard);

module.exports = router;