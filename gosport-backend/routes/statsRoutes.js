const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  addCricketStat,
  addFootballStat,
  updateCricketScore,
  updateFootballScore
} = require("../controllers/statsController");

// ADD CRICKET STATS
router.post("/cricket", protect, adminOnly, addCricketStat);

// ADD FOOTBALL STATS
router.post("/football", protect, adminOnly, addFootballStat);

// UPDATE CRICKET MATCH SCORE
router.put("/cricket/update", protect, adminOnly, updateCricketScore);

// UPDATE FOOTBALL MATCH SCORE
router.put("/football/update", protect, adminOnly, updateFootballScore);

module.exports = router;