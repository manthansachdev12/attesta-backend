const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Identity = require("../models/Identity");

const router = express.Router();

/* =========================
   POST /api/identity
   Create or update identity
========================= */
router.post("/", auth, async (req, res) => {
  try {
    const payload = {
      userId: req.user.id,
      fullName: req.body.fullName,
      dob: req.body.dob,
      address: req.body.address,
      taxId: req.body.taxId,
      creditScore: req.body.creditScore,
      bloodGroup: req.body.bloodGroup,
    };

    const identity = await Identity.findOneAndUpdate(
      { userId: req.user.id },
      payload,
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user.id, {
      hasIdentity: true,
    });

    res.json(identity);
  } catch (err) {
    console.error("Identity save failed", err);
    res.status(500).json({ message: "Failed to save identity" });
  }
});

/* =========================
   GET /api/identity
   Unified identity response
========================= */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const identity = await Identity.findOne({ userId: req.user.id }).lean();

    res.json({
      // Identity (self-declared)
      fullName: identity?.fullName || null,
      dob: identity?.dob || null,
      address: identity?.address || null,
      taxId: identity?.taxId || null,
      creditScore: identity?.creditScore || null,
      bloodGroup: identity?.bloodGroup || null,

      // Verification (system-trusted)
      verified: user.verified,
      verifiedBy: user.verifiedBy || null,
      verifiedAt: user.verifiedAt || null,
      andiId: user.andiId || null,

      hasIdentity: user.hasIdentity,
    });
  } catch (err) {
    console.error("Identity fetch failed", err);
    res.status(500).json({ message: "Failed to fetch identity" });
  }
});

module.exports = router;
