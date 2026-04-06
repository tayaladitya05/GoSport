const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    sportType: {
      type: String,
      enum: ["cricket", "football"],
      required: true,
    },

    matchName: {
      type: String,
      required: true,
    },

    teams: [
      {
        type: String, // for now keep string (college / team name)
        required: true,
      },
    ],

    venue: {
      type: String,
      required: true,
    },

    matchDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);