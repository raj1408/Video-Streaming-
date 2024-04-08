import mongoose, { Schema } from "mongoose";

const tweetsSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Tweets = mongoose.model("Tweets", tweetsSchema);
