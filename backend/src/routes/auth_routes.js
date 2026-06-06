import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controller/auth_controller.js";
import authMiddleware from "../middleware/auth_middle.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.patch("/profile", authMiddleware, updateProfile);

export default router;