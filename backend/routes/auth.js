import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/sync
// Contract: { supabaseId, email, fullName }
router.post("/sync", async (req, res) => {
  try {
    const { supabaseId, email, fullName } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Upsert by email to avoid duplicates if user signs up with another provider in Supabase later.
    const update = {
      $setOnInsert: { supabaseId: supabaseId || undefined },
      $set: { fullName: fullName || "" },
    };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const user = await User.findOneAndUpdate({ email }, update, options);
    return res.json({ user });
  } catch (err) {
    console.error("auth/sync error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
