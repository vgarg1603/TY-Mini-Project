import express from "express";
import Watchlist from "../models/Watchlist.js";
import User from "../models/User.js";
import Company from "../models/Company.js";

const router = express.Router();

async function resolveUserId({ user_id, supabaseId, email }) {
  if (user_id) return user_id;
  if (supabaseId) {
    const u = await User.findOne({ supabaseId }, { _id: 1 });
    if (u) return u._id;
  }
  if (email) {
    const u = await User.findOne({ email }, { _id: 1 });
    if (u) return u._id;
  }
  return null;
}

// GET /api/watchlist/list?user_id=... | supabaseId=... | email=...
router.get("/list", async (req, res) => {
  try {
    const userId = await resolveUserId({
      user_id: req.query.user_id,
      supabaseId: req.query.supabaseId,
      email: req.query.email,
    });
    if (!userId)
      return res
        .status(400)
        .json({ error: "valid user identifier is required" });

    const items = await Watchlist.find({ user_id: userId }, { company_id: 1 })
      .sort({ createdAt: -1 })
      .lean();
    const companyIds = items.map((i) => String(i.company_id));
    return res.json({ items, companyIds });
  } catch (err) {
    console.error("watchlist.list error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/watchlist/toggle
// Body: { companyId, user_id? | supabaseId? | email? }
router.post("/toggle", async (req, res) => {
  try {
    const { companyId, user_id, supabaseId, email } = req.body || {};
    if (!companyId)
      return res.status(400).json({ error: "companyId is required" });
    const userId = await resolveUserId({ user_id, supabaseId, email });
    if (!userId)
      return res
        .status(400)
        .json({ error: "valid user identifier is required" });

    const company = await Company.findById(companyId, { _id: 1 });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const existing = await Watchlist.findOne({
      user_id: userId,
      company_id: companyId,
    });
    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
      return res.json({ saved: false });
    }
    await Watchlist.create({ user_id: userId, company_id: companyId });
    return res.json({ saved: true });
  } catch (err) {
    if (err?.code === 11000) {
      // Duplicate: treat as saved
      return res.json({ saved: true });
    }
    console.error("watchlist.toggle error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
