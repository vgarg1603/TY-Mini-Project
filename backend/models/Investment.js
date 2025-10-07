import mongoose, { Schema } from "mongoose";

// Basic investment schema linking an investor (by supabase user id or email) to a company
// Extend later with documents, status, payment references etc.
const InvestmentSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      index: true,
      required: true,
    },
    investorSupaId: { type: String, index: true },
    investorEmail: { type: String },
    amount: { type: Number, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Investment ||
  mongoose.model("Investment", InvestmentSchema);