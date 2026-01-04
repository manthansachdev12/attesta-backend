const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    hasIdentity: {
      type: Boolean,
      default: false,
    },

    /* =========================
       DIGILOCKER / ANDI FIELDS
    ========================= */
    verified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: String,
    andiId: String,
    verifiedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
