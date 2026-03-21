import userModel from "../model/user.model.js"




export const accessandrefreshtoken=async(userId)=>{
    
    try {

        const user= await userModel.findById(userId)
        const accesstoken=user.generateAccessToken();
        const refreshtoken=user.generateRefreshToken();
        user.refreshtoken=refreshtoken
        await user.save();
        return {accesstoken,refreshtoken}

        
    } catch (error) {
        return res.status(400).json({message:"Error in generting tokens"})
    }
}