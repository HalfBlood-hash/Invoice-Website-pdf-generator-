

import dotenv from "dotenv"

dotenv.config();

import cors from "cors";
import { connectDB } from "./db/db.js";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import path, { dirname } from "path"
import cookieParser from "cookie-parser"

const __dirname=path.resolve();
const port=process.env.PORT || 8000
connectDB()
const app=express();

app.use(express.json());
if(process.env.NODE_ENV!=="production")
    {
        app.use(cors({
            origin: ["http://localhost:5173", "http://localhost:5174"],
            credentials:true
        }))
    }
    app.use(cookieParser());


app.use('/api/users',userRoutes)
app.use('/api/invoices',invoiceRoutes)
app.use('/api/payments',paymentRoutes)

if(process.env.NODE_ENV==="production")
    {
    
        app.use(express.static(path.join(__dirname,"../client/dist")))
        app.get(/.*/,(req,res)=>{
            res.sendFile(path.join(__dirname,"../client","dist","index.html"))
        })
        
    }
app.listen(port,()=>{
    // console.log(`Server is running on port ${port}`);
    })
