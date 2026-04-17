

import express from  "express"
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getUser, registerUser, userLogin, getcurrentuser, userLogout, refreshAccessToken } from "../controllers/user.controllers.js";
const router=express.Router();


router.get('/getallusers',getUser)
router.post('/register',registerUser);
router.post('/login',userLogin)
router.get('/current-user',verifyJwt,getcurrentuser )
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', userLogout); 
export default router;