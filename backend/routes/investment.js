import express from "express";
import Company from "../models/Company.js";
import Investment from "../models/Investment.js";

const router = express.Router();

// Helper to resolve company by userSupaId or startupName
async function findCompany({ userSupaId, startupName }) {
  if (userSupaId) {
    return Company.findOne({ userSupaId });
  }
  if (startupName) {
    return Company.findOne({ startupName });
  }
  return null;
}

// POST /api/investment
// Body: { userSupaId|startupName, investorSupaId, investorEmail, amount, note }
router.post("/", async (req, res) => {
  try {
    const {
      userSupaId,
      startupName,
      investorSupaId,
      investorEmail,
      amount,
      note,
    } = req.body || {};
    if (amount === undefined)
      return res.status(400).json({ error: "amount is required" });

    const company = await findCompany({ userSupaId, startupName });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const investment = await Investment.create({
      company: company._id,
      investorSupaId,
      investorEmail,
      amount,
      note,
    });
    return res.json({ investment });
  } catch (err) {
    console.error("investment.post error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/investment/list?userSupaId=... | startupName=...
router.get("/list", async (req, res) => {
  try {
    const { userSupaId, startupName, limit = 50 } = req.query || {};
    const company = await findCompany({ userSupaId, startupName });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const items = await Investment.find({ company: company._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    return res.json({ investments: items });
  } catch (err) {
    console.error("investment.list error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/investment/portfolio?investorSupaId=...&investorEmail=...
// Get investments made by a specific investor (their portfolio)
router.get("/portfolio", async (req, res) => {
  try {
    const { investorSupaId, investorEmail, limit = 50 } = req.query || {};

    if (!investorSupaId && !investorEmail) {
      return res.status(400).json({ error: "investorSupaId or investorEmail is required" });
    }

    // Build query to find investments by this investor
    const query = {};
    if (investorSupaId) {
      query.investorSupaId = investorSupaId;
    } else if (investorEmail) {
      query.investorEmail = investorEmail;
    }

    const items = await Investment.find(query)
      .populate("company", "companyName startupName companyLogo companyOneLiner location industries")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ investments: items });
  } catch (err) {
    console.error("investment.portfolio error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
