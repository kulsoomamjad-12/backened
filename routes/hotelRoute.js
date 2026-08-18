import express from "express";
import { protect } from "../middleware/authMiddleware";
import { registerHotel } from "../controllers/hotelController";

const hotelRouter = express.Router();

hotelRouter.post("/register", protect, registerHotel);

export default hotelRouter;