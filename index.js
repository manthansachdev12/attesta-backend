const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});



const authRoutes = require("./routes/authRoutes");
const identityRoutes = require("./routes/identityRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const logRoutes = require("./routes/logRoutes");
const digilockerRoutes = require("./routes/digilockerRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

mongoose.connection.on("connected", () => {
  console.log("Connected to Atlas:", mongoose.connection.name);
});


app.use("/api/auth", authRoutes);
app.use("/api/identity", identityRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/digilocker", digilockerRoutes);
app.use("/api/chat", chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

