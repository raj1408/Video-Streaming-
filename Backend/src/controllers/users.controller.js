import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Users } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await Users.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating Acees token and Refresh Token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await Users.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(409, "Username/email already registered");
    }

    let avatarLocalPath = req?.files?.avatar[0]?.path;
    let coverImageLocalPath;

    // if (
    //     req.files &&
    //     req.files.avatar &&
    //     Array.isArray(req.files.avatar && req.files.avatar.length > 0)
    // ) {
    //     avatarLocalPath = req.files.avatar[0].path;
    // }

    if (
        req.files &&
        Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    const user = await Users.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url,
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await Users.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Internal Server error during registering , please try again"
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "Registerd successfully"));
});

const AccessRefreshToken = asyncHandler(async (req, res) => {
    const UserRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!UserRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }
    try {
        const decodedRefreshToken = jwt.verify(
            UserRefreshToken, // Use UserRefreshToken instead of token
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await Users.findById(decodedRefreshToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (UserRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token expired");
        }

        const { accessToken, newRefreshToken } =
            await generateAccessTokenAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    201,
                    (accessToken, newRefreshToken),
                    "Refresh Token Updated"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized Request");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(401, "Email/Username is required for login ");
    }

    const user = await Users.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(
            404,
            "Email/Username not found, Register using Email/Username"
        );
    }

    if (!password) {
        throw new ApiError(401, "Please enter your password for login");
    }

    const isValid = await user.isPasswordCorrect(password);

    if (!isValid) {
        throw new ApiError(401, "Please enter valid user credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await Users.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "Logged in successfully!"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await Users.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
    const user = await Users.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
        throw new ApiError(401, "Old password and updated password required");
    }

    const validPassword = await user.isPasswordCorrect(oldPassword);

    if (!validPassword) {
        throw new ApiError(
            401,
            "Password is incorrect , please provide valid o;d password"
        );
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Password updated sucessfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    AccessRefreshToken,
    updatePassword,
};
