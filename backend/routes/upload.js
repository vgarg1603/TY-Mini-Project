import express from "express";
import ImageKit from "imagekit";
import User from "../models/User.js";

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
