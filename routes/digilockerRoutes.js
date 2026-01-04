const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Identity = require("../models/Identity");
const crypto = require("crypto");

const router = express.Router();

router.post("/verify", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate ANDI only once
    let andiId = user.andiId;
    if (!andiId) {
      andiId = `ANDI-IN-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;
    }

    // ✅ UPDATE USER
    user.verified = true;
    user.verifiedBy = "DigiLocker (Mock)";
    user.verifiedAt = new Date();
    user.andiId = andiId;
    await user.save();

    // ✅ UPDATE IDENTITY (THIS WAS NEVER DONE)
    await Identity.findOneAndUpdate(
      { userId },
      {
        verified: true,
        verifiedBy: "DigiLocker (Mock)",
        verifiedAt: user.verifiedAt,
        andiId,
      },
      { new: true, upsert: false }
    );

    res.json({
      message: "Identity verified successfully",
      andiId,
    });
  } catch (err) {
    console.error("DigiLocker verification failed", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;
