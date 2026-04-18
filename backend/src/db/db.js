

import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONOGOCONNECTIONURI || process.env.MONOGOCONNECTIONURI, {
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            connectTimeoutMS: 10000
        })
        console.log("Db connection successful!")
    } catch (error) {
        console.error("Db connection failed!", error);
        process.exit(1);
    }
}