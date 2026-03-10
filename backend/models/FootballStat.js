const mongoose = require("mongoose");

const footballStatSchema = new mongoose.Schema(
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

  goals: {
    type: Number,
    default: 0
  },

  assists: {
    type: Number,
    default: 0
  },

  yellowCards: {
    type: Number,
    default: 0
  },

  redCards: {
    type: Number,
    default: 0
  },

  minutesPlayed: {
    type: Number,
    default: 0
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("FootballStat", footballStatSchema);