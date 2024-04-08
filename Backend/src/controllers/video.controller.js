import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/videos.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!{ title, description }) {
        throw new ApiError(401, "Title and Description are required fields .");
    }

    let videoLocalPath = req?.files?.video[0]?.path;
    let thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(401, "Video file is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);

    if (!videoFile) {
        throw new ApiError(401, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(401, "Video thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(401, "Video thumbnail is required");
    }

    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title: title,
        description: description,
        duration: videoFile?.duration,
    });

    const uploadedVideo = await Video.find(video);

    if (!uploadedVideo) {
        throw new ApiError(500, "Error uploading video.");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, uploadedVideo, "Video uploaded successfully")
        );
});

const getVideo = asyncHandler(async (req, res) => {
    const { _id, title } = req?.query;
    console.log(_id, title);
    let video;
    if (_id && title) {
        // If both _id and title are provided, find the video using both criteria
        video = await Video.findOne({ _id, title });
    } else if (_id) {
        // If only _id is provided, find the video by ID
        video = await Video.findById(_id);
    } else if (title) {
        // If only title is provided, find the video by title
        video = await Video.findOne({ title });
    }

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video retrieved successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {});

const updateVideo = asyncHandler(async (req, res) => {
    const { title } = req?.query;
    const { newTitle, description } = req.body;

    if (!(newTitle || description)) {
        throw new ApiError(401, "Must pass at least one field to update");
    }

    const updateFields = {};

    if (title) {
        updateFields.title = newTitle;
    }

    if (description) {
        updateFields.description = description;
    }

    const videoToUpdate = await Video.findOne({ title });

    if (!videoToUpdate) {
        throw new ApiError(404, "Video not found");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoToUpdate._id,
        { $set: updateFields },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Error updating video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {});

export { uploadVideo, publishVideo, updateVideo, deleteVideo, getVideo };
