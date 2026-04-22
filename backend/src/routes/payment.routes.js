import express from "express";
import { addPayment } from "../controllers/payment.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", verifyJwt, addPayment);

export default router;
