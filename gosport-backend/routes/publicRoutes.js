const express = require("express");
const router = express.Router();
const { getPlayerSkills } = require("../controllers/publicController");

/**
 * PUBLIC — no login required.
 * GET /api/public/players/:playerId/skills
 */
router.get("/players/:playerId/skills", getPlayerSkills);

module.exports = router;
