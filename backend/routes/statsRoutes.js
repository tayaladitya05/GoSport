const express = require("express");
const router = express.Router();

const CricketStat = require("../models/CricketStat");
const FootballStat = require("../models/FootballStat");

const { protect, adminOnly } = require("../middleware/authMiddleware");

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

module.exports = router;