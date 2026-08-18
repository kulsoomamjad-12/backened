import express from "express";
import {
  getUsers,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/", protect , getUsers);
userRouter.get("/profile", protect, getProfile);
userRouter.put("/profile", protect, updateProfile);
userRouter.put("/change-password", protect, changePassword);
userRouter.delete("/account", protect, deleteAccount);

export default userRouter;