import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Helper to build $set update only with provided keys
function buildSet(body) {
  const set = {};
  if (!body || typeof body !== "object") return set;

  if (body.fullName !== undefined) set.fullName = body.fullName;
  if (body.birthday !== undefined) {
    const d = body.birthday ? new Date(body.birthday) : null;
    set.birthday = d && !Number.isNaN(d.getTime()) ? d : undefined;
  }
  if (body.address !== undefined) {
    const a = body.address || {};
    set.address = {
      street: a.street ?? undefined,
      city: a.city ?? undefined,
      region: a.region ?? undefined,
      country: a.country ?? undefined,
    };
  }
  if (body.interests !== undefined && Array.isArray(body.interests)) {
    set.interests = body.interests;
  }
  if (body.investmentPlan !== undefined) {
    const p = body.investmentPlan || {};
    set.investmentPlan = { from: p.from ?? undefined, to: p.to ?? undefined };
  }
  if (body.annualInvestmentRange !== undefined) {
    set.annualInvestmentRange = body.annualInvestmentRange || undefined;
  }
  if (body.notifyPopularStartups !== undefined) {
    set.notifyPopularStartups = !!body.notifyPopularStartups;
  }
  if (body.profileURL !== undefined) set.profileURL = body.profileURL;
  if (body.bio !== undefined) set.bio = body.bio;
  if (body.websiteURL !== undefined) set.websiteURL = body.websiteURL;

  return set;
}

// GET /api/welcome?email=...
// Returns current saved data for welcome flow
router.get("/", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "email is required" });
  try {
    const user = await User.findOne({ email });
    return res.json({ user });
  } catch (err) {
    console.error("welcome.get error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/welcome
// Body: { email, ...partial fields... }
// Saves partial progress; upserts on first write.
router.patch("/", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "email is required" });

    const set = buildSet(req.body);
    const update = { $set: set };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const user = await User.findOneAndUpdate({ email }, update, options);
    return res.json({ user });
  } catch (err) {
    console.error("welcome.patch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
