import mongoose, { Schema } from "mongoose";

const commentsSchema = new Schema(
    {
        content: {
            type: String,
            trim: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Comments = mongoose.model("Comments", commentsSchema);
