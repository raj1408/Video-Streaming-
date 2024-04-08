import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        decription: {
            type: String,
            trim: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            unique: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
