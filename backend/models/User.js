import mongoose, { Schema } from "mongoose";

// We rely on Supabase for authentication and password storage.
// Only store public/profile data here; never store raw passwords.
const UserSchema = new Schema(
  {
    supabaseId: { type: String, index: true },
    email: { type: String, required: true, index: true, unique: true },
    fullName: { type: String, default: "" },
    birthday: Date,
    address: {
      street: String,
      city: String,
      region: String,
      country: String,
    },
    interests: [String],
    investmentPlan: { from: String, to: String },
    annualInvestmentRange: String,
    notifyPopularStartups: { type: Boolean, default: true },
    profileURL: String,
    bio: String,
    websiteURL: String,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
