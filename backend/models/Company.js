import mongoose, { Schema } from "mongoose";

const StartupSchema = new Schema(
  {
    userSupaId: String,
    companyName: String,
    startupName: String, // slug used in routes, e.g. "my-startup"
    companyWebsite: String,
    location: String,
    companyOneLiner: String,
    companyDescription: String, // rich HTML from campaign editor
    industries: [String],
    raise: { want: String, already: String },
    mainCoverPhoto: String,
    mainCoverVideo: String,
    linkedInLink: String,
    InstagramLink: String,
    YoutubeLink: String,
    companyLogo: String,

    round: {
      days: Number,
      target: String,
      minInvest: Number,
      isLive: Boolean,
    },

    team: [
      {
        fullName: String,
        workEmail: String,
        isFounder: Boolean,
        linkedInProfile: String,
        about: String,
        title: String,
        profilePicture: String,
      },
    ],
    product: [
      {
        productName: String,
        productDescription: String,
        price: String,
        quantityAvailable: String,
        deliveryDays: String,
        colour: [String],
        thumbnailImage: String,
        images: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Company ||
  mongoose.model("Company", StartupSchema);
