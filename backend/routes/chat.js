import express from "express";
import { StreamChat } from "stream-chat";
import User from "../models/User.js";
import crypto from "crypto";

const router = express.Router();

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

/**
 * POST /api/chat/token
 * Generate a Stream Chat token for the authenticated user
 * Body: { userId, userName, userEmail }
 */
router.post("/token", async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Create or update user in Stream
    await serverClient.upsertUser({
      id: userId,
      name: userName || userEmail || userId,
      email: userEmail,
    });

    // Generate token for the user
    const token = serverClient.createToken(userId);

    res.json({ token, userId });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Failed to generate chat token" });
  }
});

/**
 * POST /api/chat/channel
 * Create or get a channel between two users
 * Body: { userId, companyOwnerId, companyOwnerEmail, companyName }
 * If companyOwnerId is not provided, will look up by companyOwnerEmail
 */
router.post("/channel", async (req, res) => {
  try {
    const { userId, companyOwnerId, companyOwnerEmail, companyName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    let ownerUserId = companyOwnerId;

    // If no companyOwnerId provided, try to look up by email
    if (!ownerUserId && companyOwnerEmail) {
      const ownerUser = await User.findOne({ email: companyOwnerEmail });
      if (ownerUser && ownerUser.supabaseId) {
        ownerUserId = ownerUser.supabaseId;
      } else {
        return res.status(404).json({ 
          error: "Company owner not found. The owner needs to sign in at least once." 
        });
      }
    }

    if (!ownerUserId) {
      return res.status(400).json({ 
        error: "Either companyOwnerId or companyOwnerEmail is required" 
      });
    }

    // Don't allow messaging yourself
    if (userId === ownerUserId) {
      return res.status(400).json({ error: "You cannot message yourself" });
    }

    // Get owner user details from database
    const ownerUserData = await User.findOne({ 
      supabaseId: ownerUserId 
    });

    // Ensure both users exist in Stream before creating channel
    // The current user should already exist from token generation
    // But we need to make sure the owner exists
    if (ownerUserData) {
      await serverClient.upsertUser({
        id: ownerUserId,
        name: ownerUserData.fullName || ownerUserData.email || ownerUserId,
        email: ownerUserData.email,
      });
    } else {
      // If we can't find the owner in our database, create a basic user
      await serverClient.upsertUser({
        id: ownerUserId,
        name: ownerUserId,
      });
    }

    // Create a unique channel ID based on the two user IDs (sorted to ensure consistency)
    // Use a hash to keep it under 64 characters
    const members = [userId, ownerUserId].sort();
    const membersString = members.join('-');
    const hash = crypto.createHash('sha256').update(membersString).digest('hex').substring(0, 32);
    const channelId = `dm-${hash}`;

    // Create or get the channel
    const channel = serverClient.channel("messaging", channelId, {
      members: members,
      name: companyName ? `Chat about ${companyName}` : "Direct Message",
      created_by_id: userId,
    });

    await channel.create();

    res.json({ 
      channelId: channel.id, 
      channelType: channel.type,
      members: members 
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Failed to create chat channel" });
  }
});

/**
 * GET /api/chat/channels/:userId
 * Get all channels for a user
 */
router.get("/channels/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const channels = await serverClient.queryChannels({
      members: { $in: [userId] },
    });

    const channelData = channels.map(channel => ({
      id: channel.id,
      type: channel.type,
      name: channel.data.name,
      members: channel.state.members,
      lastMessageAt: channel.state.last_message_at,
      unreadCount: channel.countUnread(userId),
    }));

    res.json({ channels: channelData });
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

export default router;
