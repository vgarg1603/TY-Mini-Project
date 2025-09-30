import "./loadEnvironment.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import welcomeRouter from "./routes/welcome.js";
import uploadRouter from "./routes/upload.js";
const app = express();
const port = 3000;

import mongoose from "mongoose";

try {
  await mongoose.connect(process.env.ATLAS_URI);
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("MongoDB connection error:", error);
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true }));
// Increase body size limits to support base64 image uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", authRouter);
app.use("/api/welcome", welcomeRouter);
app.use("/api/upload", uploadRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
