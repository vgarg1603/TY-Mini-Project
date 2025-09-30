import mongoose, { Schema } from "mongoose";

const StartupSchema = new Schema(
    {
        userSupaId: String,
        companyName: String,
        companyWebsite: String,
        location: String,
        tags: [String],
        industries: [],
        raise: {want: String, already: String},
        mainCoverPhoto: String,
        mainCoverVideo: String,
        linkedInLink: String,
        InstagramLink: String,
        YoutubeLink: String,
        companyLogo: String,
        team: [{fullName: String, workEmail: String, isFounder: Boolean, linkedInProfile: String}],
        

        product: [{productName: String, productDescription: String, price: String, quantityAvailable: String, deliveryDays: String, colour: [String], thumbnailImage: String, images: [String]}],
    }
)