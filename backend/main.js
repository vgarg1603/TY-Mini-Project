import "./loadEnvironment.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import welcomeRouter from "./routes/welcome.js";
import uploadRouter from "./routes/upload.js";
import raiseMoneyRouter from "./routes/raiseMoney.js";
import companyRouter from "./routes/company.js";
import investmentRouter from "./routes/investment.js";
import watchlistRouter from "./routes/watchlist.js";
import chatRouter from "./routes/chat.js";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function connectToDatabase() {
  const uri = process.env.ATLAS_URI;
  if (!uri) {
    throw new Error("Missing ATLAS_URI in environment variables");
  }

  const options = {
    dbName: process.env.DB_NAME || undefined,
    serverSelectionTimeoutMS: 15000, // fail faster with a clear error
  };

  try {
    await mongoose.connect(uri, options);
    const dbName = mongoose.connection?.db?.databaseName || options.dbName;
    console.log("Connected to MongoDB", dbName ? `(${dbName})` : "");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

async function start() {
  try {
    await connectToDatabase();

    app.use(
      cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true })
    );
    // Increase body size limits to support base64 image/video uploads
    app.use(express.json({ limit: "100mb" }));
    app.use(express.urlencoded({ limit: "100mb", extended: true }));

    app.get("/", (req, res) => {
      res.send("API is running");
    });

    app.use("/api/auth", authRouter);
    app.use("/api/welcome", welcomeRouter);
    app.use("/api/upload", uploadRouter);
    app.use("/api/raise_money", raiseMoneyRouter);
    app.use("/api/company", companyRouter);
    app.use("/api/investment", investmentRouter);
    app.use("/api/watchlist", watchlistRouter);
    app.use("/api/chat", chatRouter);

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (e) {
    console.error(
      "Server failed to start because the database connection could not be established."
    );
    process.exit(1);
  }
}

start();
