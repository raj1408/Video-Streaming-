import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: "./env",
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`App is listening on PORT : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log(`MongoDb connection failed,Error encountered: ${err}`);
    });
