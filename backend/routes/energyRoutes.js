
const express = require("express");
const mongoose = require("mongoose");

const EnergyReading = require("../models/EnergyReading");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// All energy routes require a signed-in user.
router.use(requireAuth);

// Validate and prepare energy reading information.
function validateReading(body) {
  const { readingDate, consumptionKwh, ratePerKwh, notes } = body;

  if (
    typeof readingDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(readingDate)
  ) {
    return { error: "Please enter a valid reading date." };
  }

  const date = new Date(`${readingDate}T12:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== readingDate
  ) {
    return { error: "Please enter a valid reading date." };
  }

  if (
    typeof consumptionKwh !== "number" ||
    !Number.isFinite(consumptionKwh) ||
    consumptionKwh < 0 ||
    consumptionKwh > 1000000
  ) {
    return {
      error: "Energy consumption must be between 0 and 1,000,000 kWh.",
    };
  }

  if (
    typeof ratePerKwh !== "number" ||
    !Number.isFinite(ratePerKwh) ||
    ratePerKwh < 0 ||
    ratePerKwh > 1000
  ) {
    return {
      error: "Electricity rate must be between 0 and 1,000.",
    };
  }

  if (notes !== undefined && typeof notes !== "string") {
    return { error: "Notes must be text." };
  }

  if (typeof notes === "string" && notes.trim().length > 500) {
    return { error: "Notes cannot exceed 500 characters." };
  }

  return {
    value: {
      readingDate: date,
      consumptionKwh,
      ratePerKwh,
      totalCost:
        Math.round(consumptionKwh * ratePerKwh * 100) / 100,
      notes: typeof notes === "string" ? notes.trim() : "",
    },
  };
}

// CREATE — Add a new energy reading.
router.post("/", async (req, res) => {
  try {
    const result = validateReading(req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const reading = await EnergyReading.create({
      user: req.user._id,
      ...result.value,
    });

    return res.status(201).json({
      success: true,
      message: "Energy reading added successfully.",
      reading,
    });
  } catch (error) {
    console.error("Create energy reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add energy reading.",
    });
  }
});

// READ — Get all readings belonging to the current user.
router.get("/", async (req, res) => {
  try {
    const readings = await EnergyReading.find({
      user: req.user._id,
    }).sort({
      readingDate: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });
  } catch (error) {
    console.error("Get energy readings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve energy readings.",
    });
  }
});

// READ — Get one energy reading by ID.
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid energy reading ID.",
      });
    }

    const reading = await EnergyReading.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Energy reading not found.",
      });
    }

    return res.status(200).json({
      success: true,
      reading,
    });
  } catch (error) {
    console.error("Get energy reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve energy reading.",
    });
  }
});

// UPDATE — Edit an existing energy reading.
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid energy reading ID.",
      });
    }

    const result = validateReading(req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const reading = await EnergyReading.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        $set: result.value,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Energy reading not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Energy reading updated successfully.",
      reading,
    });
  } catch (error) {
    console.error("Update energy reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update energy reading.",
    });
  }
});

// DELETE — Remove an energy reading.
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid energy reading ID.",
      });
    }

    const reading = await EnergyReading.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Energy reading not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Energy reading deleted successfully.",
    });
  } catch (error) {
    console.error("Delete energy reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete energy reading.",
    });
  }
});

module.exports = router;
