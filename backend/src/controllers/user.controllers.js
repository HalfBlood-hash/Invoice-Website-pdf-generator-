

import userModel from "../model/user.model.js";
import {accessandrefreshtoken} from "../utils/generateRefreshandAccessToken.js"
export const getUser= async(req,res)=>{
    try {
        const user =await userModel.find();
        return res.status(200).json({message:"All users",payload:user})  
    } catch (error) {
        console.error("getUser: Error in fetching the users data",error);
    }
}
export const registerUser=async(req,res)=>{
    const {name,email,password}= req.body
    if(!name || !email || !password)
        return res.status(400).json({message:"All feild is required"})

    const existinguser=await userModel.findOne({email:email})
        if(existinguser)
            return res.status(400).json({message:"User is already existed"})

    try {
        const {name,email,password}=req.body;
        
        const user=await userModel.create({name,email,password});
    
        return res.status(200).json({message:"user registered sucessfull!"})
    } catch (error) {
        console.error(error);
    }

}


export const userLogin =async(req,res)=>{
    const {email,password}=req.body
    // console.log(req.body);

    if(!email || ! password) 
       return res.status(400).json({message:"All Feild is Required"})

    try {
        const user= await userModel.findOne({email:email})
        if(!user)
            return res.status(400).json({message:"Email is incorrect"})

        const isPasswordCorrect= await user.isPasswordCorrect(password);
        if(!isPasswordCorrect)
            return res.status(400).json({message:"password is incorrect"})

        const {accesstoken,refreshtoken}= await accessandrefreshtoken(user._id)
        
        const loggedUser= await userModel.findById(user._id).select(
            "-password -refreshtoken"
        )
        const options={
            httpOnly:true,
            secure:true
        }
        return res
        .status(200)
        .cookie("refreshtoken",refreshtoken,options)
        .cookie("accesstoken",accesstoken,options)
        .json({message:"Login Succssfull!",payload:loggedUser})

    } catch (error) {
        console.error("login Error ",error)
        return res.status(400).json({message:"server Error during login "})
    }

}


// export const getcurrentuser = async (req, res) => {
//     // verifyJwt put the user on req.user
//     return res.json({
//       payload: {
//         user: {
//           _id: req.user._id,
//           name: req.user.name,
//           email: req.user.email
//         }
//       }
//     });
//   };
  
export const getcurrentuser=async(req,res)=>{


    return res.status(200).json({message:"get user sucessful",payload:req.user});
}