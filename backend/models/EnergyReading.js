
const mongoose = require("mongoose");

const energyReadingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    readingDate: {
      type: Date,
      required: [true, "Reading date is required."],
    },

    consumptionKwh: {
      type: Number,
      required: [true, "Energy consumption is required."],
      min: [0, "Energy consumption cannot be negative."],
      max: [1000000, "Energy consumption is too high."],
    },

    ratePerKwh: {
      type: Number,
      required: [true, "Electricity rate is required."],
      min: [0, "Electricity rate cannot be negative."],
      max: [1000, "Electricity rate is too high."],
    },

    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters."],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Calculate the electricity cost before saving.
energyReadingSchema.pre("save", function () {
  this.totalCost =
    Math.round(
      this.consumptionKwh * this.ratePerKwh * 100
    ) / 100;
});

// Improve performance when retrieving a user's readings.
energyReadingSchema.index({
  user: 1,
  readingDate: -1,
});

const EnergyReading =
  mongoose.models.EnergyReading ||
  mongoose.model("EnergyReading", energyReadingSchema);

module.exports = EnergyReading;
