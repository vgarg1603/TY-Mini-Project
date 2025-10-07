import express from "express";
import User from "../models/User.js";
import axios from "axios";

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
  if (body.GSTin !== undefined) set.GSTin = body.GSTin; // raw value; validate before save

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

    // GSTIN validation & verification (India) - ALWAYS store, mark verified only on success
    if (Object.prototype.hasOwnProperty.call(set, "GSTin")) {
      if (!set.GSTin) {
        // Clearing existing GSTIN
        set.GSTin = undefined;
        set.GSTinVerified = false;
      } else {
        const raw = String(set.GSTin).trim();
        const gstin = raw.toUpperCase();
        const formatValid = /^[0-9A-Z]{15}$/.test(gstin);
        // Always store normalized GSTIN
        set.GSTin = gstin;
        let verified = false;
        try {
          const existing = await User.findOne(
            { email },
            { GSTin: 1, GSTinVerified: 1 }
          );
          const alreadyVerifiedSame =
            existing && existing.GSTin === gstin && existing.GSTinVerified;
          if (alreadyVerifiedSame) {
            verified = true;
          } else if (formatValid) {
            // Attempt external verification only if format ok
            const clientId = process.env.CASHFREE_CLIENT_ID;
            const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
            if (clientId && clientSecret) {
              const base =
                process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com";
              try {
                const { data: resp } = await axios.post(
                  `${base}/verification/gstin`,
                  { GSTIN: gstin },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "x-client-id": clientId,
                      "x-client-secret": clientSecret,
                    },
                    timeout: 10000,
                  }
                );
                const success =
                  resp?.verification_status === "SUCCESS" ||
                  resp?.valid === true ||
                  resp?.status === "SUCCESS";
                if (success) verified = true;
              } catch (apiErr) {
                console.warn(
                  "GSTIN verification API error (non-blocking)",
                  apiErr?.response?.data || apiErr.message
                );
              }
            } else {
              // Missing credentials: skip verification silently
              console.warn(
                "GSTIN verification skipped: missing Cashfree credentials"
              );
            }
          }
        } catch (lookupErr) {
          console.warn(
            "GSTIN verification lookup error (non-blocking)",
            lookupErr
          );
        }
        set.GSTinVerified = verified;
      }
    }

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
