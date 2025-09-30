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

// GET /api/company/status?supabaseId=...
// Returns current company status, including if startupName exists and completeness of required fields
router.get("/status", async (req, res) => {
  const supabaseId = req.query.supabaseId;
  if (!supabaseId)
    return res.status(400).json({ error: "supabaseId is required" });
  try {
    const company = await Company.findOne({ userSupaId: supabaseId });
    if (!company) {
      return res.json({
        hasCompany: false,
        startupName: null,
        hasLocation: false,
        hasTags: false,
        hasIndustries: false,
        hasRaise: false,
        isComplete: false,
      });
    }
    let startupName = company.startupName
      ? String(company.startupName).trim()
      : "";
    // If startupName is empty but companyName exists, derive and persist
    if (!startupName && company.companyName) {
      const candidate = slugify(company.companyName);
      if (candidate) {
        company.startupName = candidate;
        await company.save();
        startupName = candidate;
      }
    }
    const hasLocation = !!(company.location && String(company.location).trim());
    const hasTags = Array.isArray(company.tags) && company.tags.length > 0;
    const hasIndustries =
      Array.isArray(company.industries) && company.industries.length > 0;
    const raiseObj = company.raise || {};
    const hasRaise = !!(
      raiseObj &&
      (String(raiseObj.want || "").trim() ||
        String(raiseObj.already || "").trim())
    );
    const isComplete = hasLocation && hasTags && hasIndustries && hasRaise;
    return res.json({
      hasCompany: true,
      startupName: startupName || null,
      hasLocation,
      hasTags,
      hasIndustries,
      hasRaise,
      isComplete,
    });
  } catch (err) {
    console.error("company.status error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/company/redirect?supabaseId=...
// Ensures there's a company for the user, and returns where to go.
// Response: { path: string } where path is either
//   "/raise_money/start" or "/raise_money/:startupName/overview"
router.get("/redirect", async (req, res) => {
  const supabaseId = req.query.supabaseId;
  if (!supabaseId)
    return res.status(400).json({ error: "supabaseId is required" });
  try {
    let company = await Company.findOne({ userSupaId: supabaseId });
    if (!company) {
      // Create a minimal placeholder company so it gets associated
      company = await Company.create({ userSupaId: supabaseId });
      return res.json({ path: "/raise_money/start" });
    }
    let startupName = company.startupName || slugify(company.companyName || "");
    if (!startupName) {
      // No valid name yet; ensure association exists and send to start
      if (!company.startupName) {
        // keep it empty until user sets companyName; do not set random slug
        await company.save();
      }
      return res.json({ path: "/raise_money/start" });
    }
    // Persist startupName if it was derived and not saved yet
    if (!company.startupName) {
      company.startupName = startupName;
      await company.save();
    }
    return res.json({ path: `/raise_money/${startupName}/overview` });
  } catch (err) {
    console.error("company.redirect error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
// Create/Update company details
router.post("/save", async (req, res) => {
  try {
    const {
      supabaseId,
      companyName,
      companyWebsite,
      location,
      industries,
      raiseAlready,
      raiseWant,
      tags,
    } = req.body || {};
    if (!supabaseId)
      return res.status(400).json({ error: "supabaseId is required" });

    const update = {};
    if (companyName !== undefined) update.companyName = companyName;
    if (companyWebsite !== undefined) update.companyWebsite = companyWebsite;
    if (location !== undefined) update.location = location;
    if (Array.isArray(industries)) update.industries = industries;
    if (Array.isArray(tags)) update.tags = tags;
    if (raiseAlready !== undefined || raiseWant !== undefined) {
      update.raise = {
        want: raiseWant ?? undefined,
        already: raiseAlready ?? undefined,
      };
    }
    // Derive startupName from companyName when provided
    if (companyName) {
      const s = slugify(companyName);
      if (s) update.startupName = s;
    }

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const company = await Company.findOneAndUpdate(
      { userSupaId: supabaseId },
      { $set: update, $setOnInsert: { userSupaId: supabaseId } },
      options
    );
    return res.json({ company, startupName: company.startupName || null });
  } catch (err) {
    console.error("company.save error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
