import express from "express";
import authMiddleware from "../middleware/auth_middle.js";
import postController from "../controller/post_controller.js";

const router = express.Router();

router.get("/", postController.getPosts);
router.get("/:id", postController.getPostDetail);

router.post("/", authMiddleware, postController.createPost);
router.post("/upload", authMiddleware, postController.uploadPost);
router.patch("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

export default router;