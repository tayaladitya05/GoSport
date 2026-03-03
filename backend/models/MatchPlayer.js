const mongoose = require("mongoose");

const matchPlayerSchema = new mongoose.Schema(
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

    teamName: {
      type: String,
      required: true
    },

    isStarting: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MatchPlayer", matchPlayerSchema);