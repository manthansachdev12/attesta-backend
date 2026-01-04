const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    purpose: {
      type: String,
      required: true,
    },

    attributes: {
      type: Array,
      default: [],
    },

    status: {
      type: String,
      enum: ["Pending", "Authorized", "Expired", "Revoked"],
      default: "Pending",
    },

    requestedBy: {
      type: String,
    },

    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      index: true,
    },

    proofHash: {
      type: String,
      index: true,
    },

    blockchainTx: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 CRITICAL: prevent recompilation / bad exports
module.exports =
  mongoose.models.AccessLog ||
  mongoose.model("AccessLog", accessLogSchema);
