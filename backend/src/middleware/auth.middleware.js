

import jwt from "jsonwebtoken"

import userModel from "../model/user.model.js"

export const verifyJwt = async (req,res, next) => {

    try {
        // Try Authorization header first
        // console.log('verifyJwt: Checking Authorization header for token');
        let token;
        const auth = req.headers.authorization;
        if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];
       // Fallback to cookie
        if (!token && req.cookies?.accesstoken) token = req.cookies.accesstoken;

        if (!token) return res.status(401).json({ message: 'Unauthorized: token missing' });

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // throws if invalid/expired
        const user = await userModel.findById(decoded._id).select('-password');
        if (!user) return res.status(401).json({ message: 'Unauthorized: user not found' });
        // console.log('verifyJwt: Token valid, user authenticated', { userId: user._id, email: user.email }); 
        req.user = user;
        next()



    }
    catch (error) {

        console.error('verifyJwt error:', error.message);
        return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });

    }


}