

import express from  "express"
import { getUser, registerUser } from "../controllers/user.controllers.js";
const router=express.Router();


router.get('/getallusers',getUser)
router.post('/register',registerUser);


export default router;