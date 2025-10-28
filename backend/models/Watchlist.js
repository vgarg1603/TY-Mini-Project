import mongoose, { Schema } from "mongoose";

const WatchlistSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      index: true,
      required: true,
    },
  },
  { timestamps: true }
);

WatchlistSchema.index({ user_id: 1, company_id: 1 }, { unique: true });

export default mongoose.models.Watchlist ||
  mongoose.model("Watchlist", WatchlistSchema);
