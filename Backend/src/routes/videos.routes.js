import { Router } from "express";
import {
    uploadVideo,
    updateVideo,
    publishVideo,
    deleteVideo,
    getVideo,
} from "../controllers/video.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload-video").post(
    verifyjwt,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    uploadVideo
);

router.route("/get-video").get(verifyjwt, getVideo);

router.route("/update-video").put(verifyjwt, updateVideo);

router.route("/publish-video").post(verifyjwt, publishVideo);

router.route("/delete-video").post(verifyjwt, deleteVideo);

export default router;
