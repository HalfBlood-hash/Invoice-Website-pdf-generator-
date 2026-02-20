

import mongoose from "mongoose"

export const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONOGOCONNECTIONURI)
        console.log("Db connection successfull !")
    } catch (error) {
    console.error("Db connection failed !",error);
    }
}