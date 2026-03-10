const mongoose = require("mongoose");

const cricketStatSchema = new mongoose.Schema(
{
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true
  },

  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true
  },

  runs: {
    type: Number,
    default: 0
  },

  ballsFaced: {
    type: Number,
    default: 0
  },

  fours: {
    type: Number,
    default: 0
  },

  sixes: {
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
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("CricketStat", cricketStatSchema);