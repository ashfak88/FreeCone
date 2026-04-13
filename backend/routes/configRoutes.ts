import express from "express";
import SystemConfig from "../models/Config";

const router = express.Router();

// @desc    Get public system configurations
// @route   GET /api/config/commission
// @access  Public
router.get("/commission", async (req, res) => {
  try {
    let commission = await SystemConfig.findOne({ key: "platformCommission" });
    if (!commission) {
      commission = { value: 5 };
    }
    res.json({ platformCommission: commission.value });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
