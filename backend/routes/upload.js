import express from "express";
import ImageKit from "imagekit";
import User from "../models/User.js";
import Company from "../models/Company.js";

const router = express.Router();

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// POST /api/upload/profile-image
// Body: { email, fileBase64, fileName }
router.post("/profile-image", async (req, res) => {
  try {
    const { email, fileBase64, fileName } = req.body || {};
    if (!email) return res.status(400).json({ error: "email is required" });
    if (!fileBase64)
      return res.status(400).json({ error: "fileBase64 is required" });

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: fileBase64,
      fileName: fileName || `profile_${Date.now()}.jpg`,
      folder: "/venture-x/profiles",
      useUniqueFileName: true,
    });

    // Save URL to user
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { profileURL: uploadResponse?.url } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ url: uploadResponse?.url, user });
  } catch (err) {
    console.error("upload/profile-image error:", err?.message || err);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;

// POST /api/upload/company-asset
// Body: { userSupaId, field: 'mainCoverPhoto'|'mainCoverVideo'|'companyLogo', fileBase64, fileName }
router.post("/company-asset", async (req, res) => {
  try {
    const { userSupaId, field, fileBase64, fileName } = req.body || {};
    if (!userSupaId)
      return res.status(400).json({ error: "userSupaId is required" });
    if (!fileBase64)
      return res.status(400).json({ error: "fileBase64 is required" });
    if (
      !field ||
      !["mainCoverPhoto", "mainCoverVideo", "companyLogo"].includes(field)
    ) {
      return res.status(400).json({
        error:
          "field must be one of 'mainCoverPhoto' | 'mainCoverVideo' | 'companyLogo'",
      });
    }

    const company = await Company.findOne({ userSupaId });
    if (!company)
      return res.status(404).json({ error: "Company not found for user" });

    const folderSafeName = company.startupName || `user_${userSupaId}`;
    const uploadResponse = await imagekit.upload({
      file: fileBase64,
      fileName:
        fileName ||
        `${folderSafeName}_${field}_${Date.now()}` +
          (field === "mainCoverVideo" ? ".mp4" : ".jpg"),
      folder: `/venture-x/companies/${folderSafeName}`,
      useUniqueFileName: true,
    });

    const set = { [field]: uploadResponse?.url };
    const updated = await Company.findOneAndUpdate(
      { _id: company._id },
      { $set: set },
      { new: true }
    );

    return res.json({ url: uploadResponse?.url, field, company: updated });
  } catch (err) {
    console.error("upload/company-asset error:", err?.message || err);
    return res.status(500).json({ error: "Failed to upload asset" });
  }
});

// POST /api/upload/team-profile
// Body: { userSupaId, fileBase64, fileName }
router.post("/team-profile", async (req, res) => {
  try {
    const { userSupaId, fileBase64, fileName } = req.body || {};
    if (!userSupaId)
      return res.status(400).json({ error: "userSupaId is required" });
    if (!fileBase64)
      return res.status(400).json({ error: "fileBase64 is required" });
    const company = await Company.findOne({ userSupaId });
    if (!company)
      return res.status(404).json({ error: "Company not found for user" });
    const folderSafeName = company.startupName || `user_${userSupaId}`;
    const uploadResponse = await imagekit.upload({
      file: fileBase64,
      fileName: fileName || `${folderSafeName}_team_${Date.now()}.jpg`,
      folder: `/venture-x/companies/${folderSafeName}/team`,
      useUniqueFileName: true,
    });
    return res.json({ url: uploadResponse?.url });
  } catch (err) {
    console.error("upload/team-profile error:", err?.message || err);
    return res
      .status(500)
      .json({ error: "Failed to upload team profile image" });
  }
});
