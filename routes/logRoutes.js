const express = require("express");
const AccessLog = require("../models/AccessLog");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const logs = await AccessLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // ✅ FIXED
      .lean();

    res.json(logs);
  } catch (err) {
    console.error("Access log fetch error", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;
