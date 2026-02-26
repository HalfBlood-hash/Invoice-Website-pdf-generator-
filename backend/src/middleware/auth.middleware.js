

import jwt from "jsonwebtoken"

import userModel from "../model/user.model.js"

export const verifyJwt = async (req,res, next) => {

    console.log("cookeis:",req.cookies)

    try {
        // Try Authorization header first
        let token;
        const auth = req.headers.authorization;
        if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];
        // Fallback to cookie
        if (!token && req.cookies?.token) token = req.cookies.token;

        if (!token) return res.status(401).json({ message: 'Unauthorized: token missing' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid/expired
        const user = await userModel.findById(decoded.sub).select('-passwordHash');
        if (!user) return res.status(401).json({ message: 'Unauthorized: user not found' });

        req.user = user;
        next()



    }
    catch (error) {

        console.error('verifyJwt error:', err.message);
        return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });

    }


}