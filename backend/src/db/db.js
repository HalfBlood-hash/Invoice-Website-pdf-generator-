

import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_CONNECTION_URI || process.env.MONGODBCONNECTIONURI || process.env.MONOGOCONNECTIONURI;
        if (!uri) {
            throw new Error("Missing MongoDB connection URI. Set MONGODB_CONNECTION_URI in env.");
        }

        const dbName = process.env.NODE_ENV === "development"
            ? process.env.MONGO_DB_NAME_LOCAL || "invoice_web_app_test"
            : process.env.MONGO_DB_NAME_PROD || "invoice_web_app";

        await mongoose.connect(uri, {
            dbName,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            connectTimeoutMS: 10000
        });

        // console.log(`Db connection successful! database=${dbName}`);
    } catch (error) {
        console.error("Db connection failed!", error);
        process.exit(1);
    }
}