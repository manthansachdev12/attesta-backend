const mongoose = require("mongoose");

const IdentitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: String,
  dob: String,
  address: String,
  taxId: String,
  employer: String,
  creditScore: Number,
  bloodGroup: String,
});

module.exports = mongoose.model("Identity", IdentitySchema);
