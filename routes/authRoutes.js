const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  let { email, password } = req.body;

  // ✅ NORMALIZE INPUT
  email = email.trim().toLowerCase();
  password = password.trim();

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    hasIdentity: user.hasIdentity,
  });
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("📩 LOGIN REQUEST:", email, password);

  const user = await User.findOne({ email });
  console.log("👤 USER FROM DB:", user);

  if (!user) {
    console.log("❌ USER NOT FOUND");
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  console.log("🔐 PASSWORD MATCH:", match);

  if (!match) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, hasIdentity: user.hasIdentity });
});




module.exports = router;
