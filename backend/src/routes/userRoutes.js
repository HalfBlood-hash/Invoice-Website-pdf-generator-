

import express from  "express"
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getUser, registerUser, userLogin ,getcurrentuser} from "../controllers/user.controllers.js";
const router=express.Router();


router.get('/getallusers',getUser)
router.post('/register',registerUser);
router.post('/login',userLogin)
router.get('/current-user',verifyJwt,getcurrentuser )
export default router;