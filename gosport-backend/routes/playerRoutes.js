const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createPlayer,
  getAllPlayers,
  getLoggedInPlayer,
  getPlayerCareerStats
} = require("../controllers/playerController");

/* CREATE PLAYER (Admin Only) */
router.post("/", protect, adminOnly, createPlayer);

/* GET ALL PLAYERS */
router.get("/", protect, getAllPlayers);

/* GET LOGGED IN PLAYER PROFILE */
router.get("/me", protect, getLoggedInPlayer);

/* GET PLAYER CAREER STATS */
router.get("/:playerId/stats", protect, getPlayerCareerStats);

module.exports = router;