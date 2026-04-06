const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sportType: {
      type: String,
      enum: ["cricket", "football"],
      required: true
    },

    teamName: {
      type: String,
      required: true
    },

    role: {
      type: String,  // batsman, bowler, striker, defender
      required: true
    },

    jerseyNumber: {
      type: Number
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", playerSchema);