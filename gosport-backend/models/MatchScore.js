const mongoose = require("mongoose");

const matchScoreSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true
  },

  teamName: {
    type: String,
    required: true
  },

  runs: {
    type: Number,
    default: 0
  },

  wickets: {
    type: Number,
    default: 0
  },

  overs: {
    type: Number,
    default: 0
  },

  // Football: total goals for this team in this match
  goals: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("MatchScore", matchScoreSchema);