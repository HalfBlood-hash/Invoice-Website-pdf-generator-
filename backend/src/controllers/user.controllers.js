

import userModel from "../model/user.model.js";

export const getUser= async(req,res)=>{
    try {
        const user =await userModel.find();
        return res.status(200).json({message:"all uses",payload:user})  
    } catch (error) {
        
    }
}
export const registerUser=async(req,res)=>{


    try {
        const {name,email,password}=req.body;
        
        const user=await userModel.create({name,email,password});
    
        res.status(200).json({message:"user registered "})
    } catch (error) {
        console.error(error);
    }

}