import express from "express";
import Company from "../models/Company.js";

const router = express.Router();

function slugify(name = "") {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildSet(body) {
  const set = {};
  if (!body || typeof body !== "object") return set;

  if (body.companyName !== undefined) {
    set.companyName = body.companyName;
    // Always generate and persist slug from companyName when provided
    const slug = slugify(String(body.companyName || ""));
    if (slug) set.startupName = slug;
  }
  if (body.companyWebsite !== undefined)
    set.companyWebsite = body.companyWebsite;
  if (body.location !== undefined) set.location = body.location;
  if (body.industries !== undefined && Array.isArray(body.industries))
    set.industries = body.industries;
  if (body.companyOneLiner !== undefined)
    set.companyOneLiner = body.companyOneLiner;
  if (body.raise !== undefined) {
    const r = body.raise || {};
    set["raise.want"] = r.want ?? undefined;
    set["raise.already"] = r.already ?? undefined;
  }
  // Social links
  if (body.linkedInLink !== undefined) set.linkedInLink = body.linkedInLink;
  if (body.InstagramLink !== undefined) set.InstagramLink = body.InstagramLink;
  if (body.YoutubeLink !== undefined) set.YoutubeLink = body.YoutubeLink;
  // Asset direct URLs (usually set by upload endpoint, but allow manual set)
  if (body.mainCoverPhoto !== undefined)
    set.mainCoverPhoto = body.mainCoverPhoto;
  if (body.mainCoverVideo !== undefined)
    set.mainCoverVideo = body.mainCoverVideo;
  if (body.companyLogo !== undefined) set.companyLogo = body.companyLogo;
  return set;
}

// GET /api/raise_money/start?userSupaId=...
router.get("/start", async (req, res) => {
  const { userSupaId } = req.query || {};
  if (!userSupaId)
    return res.status(400).json({ error: "userSupaId is required" });
  try {
    const doc = await Company.findOne({ userSupaId });
    return res.json({ company: doc });
  } catch (err) {
    console.error("raise_money.get error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/raise_money/start
// Body: { userSupaId, ...fields }
router.patch("/start", async (req, res) => {
  try {
    const { userSupaId } = req.body || {};
    if (!userSupaId)
      return res.status(400).json({ error: "userSupaId is required" });

    const update = { $set: buildSet(req.body), $setOnInsert: { userSupaId } };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const company = await Company.findOneAndUpdate(
      { userSupaId },
      update,
      options
    );
    return res.json({ company });
  } catch (err) {
    console.error("raise_money.patch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
