import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    AccessRefreshToken,
    updatePassword,
} from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxcount: 1 },
        { name: "coverImage", maxcount: 1 },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyjwt, logoutUser);

router.route("/refresh-token").post(AccessRefreshToken);

router.route("/login/update-password").post(verifyjwt, updatePassword);

export default router;
