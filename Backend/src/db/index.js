import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(
            `MongoDb Connected !! DB Host : ${(await connectionInstance).connection.host}`
        );
    } catch (error) {
        console.error("Error connecting to DB : ", error);
        process.exit(1);
    }
};
export default connectDB;
