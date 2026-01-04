const express = require("express");
const crypto = require("crypto");

let AccessLog = require("../models/AccessLog");

// 🧯 SAFETY CHECK
if (AccessLog.AccessLog) {
  AccessLog = AccessLog.AccessLog;
}

const auth = require("../middleware/authMiddleware");

const {
  verifyProofOnChain,
  generateVerificationHash,
  storeProofOnChain,
} = require("../services/blockchainService");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/verify/generate
|--------------------------------------------------------------------------
*/
router.post("/generate", auth, async (req, res) => {
  try {
    const { purpose, attributes } = req.body;

    if (!purpose || !Array.isArray(attributes)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const verificationId = crypto.randomUUID();

    const canonicalPayload = {
      verificationId,
      userId: req.user.id,
      purpose,
      attributes,
    };

    const proofHash = generateVerificationHash(canonicalPayload);
    const txHash = await storeProofOnChain(proofHash);

    await AccessLog.create({
      userId: req.user.id,
      verificationId,
      purpose,
      attributes,
      proofHash,
      blockchainTx: txHash,
      status: "Authorized",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return res.status(201).json({
      verificationId,
      proofHash,
    });
  } catch (err) {
    console.error("GENERATE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/verify/:verificationId
|--------------------------------------------------------------------------
*/
router.get("/:verificationId", auth, async (req, res) => {
  try {
    if (typeof AccessLog.findOne !== "function") {
      throw new Error("AccessLog model not initialized correctly");
    }

    const log = await AccessLog.findOne({
      verificationId: req.params.verificationId,
      status: "Authorized",
    });

    if (!log) {
      return res.status(404).json({ valid: false });
    }

    if (log.expiresAt && log.expiresAt < new Date()) {
      return res.status(200).json({ valid: false, reason: "Expired" });
    }

    const isValid = await verifyProofOnChain(log.proofHash);

    if (!isValid) {
      return res.status(200).json({
        valid: false,
        reason: "Blockchain proof invalid",
      });
    }

    return res.json({
      valid: true,
      purpose: log.purpose,
      attributes: log.attributes,
      verifiedAt: new Date(),
      verifiedBy: req.user.id,
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({
      valid: false,
      reason: err.message,
    });
  }
});

module.exports = router;
