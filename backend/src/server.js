

import dotenv from "dotenv"

dotenv.config();

import cors from "cors";
import { connectDB } from "./db/db.js";
import express from "express";
import userRoutes from "./routes/userRoutes.js";



connectDB()


const app=express();

app.use(express.json());


app.use(cors({
    origin: "http://localhost:5173"
}))


app.use('/api/users',userRoutes)


app.listen(5000,()=>{
    console.log("server is runnig on: 5000 ")
    })