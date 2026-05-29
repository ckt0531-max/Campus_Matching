import Sequelize from "sequelize";
import db from "../models/index.js";
const { User, Post, Comment } = db;

const safeString = (value = "") => String(value).trim();

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const maskName = (name = "") => {
  const trimmed = safeString(name);
  if (!trimmed) return "익명";
  if (trimmed.length === 1) return trimmed;
  return trimmed[0] + "*".repeat(Math.max(1, trimmed.length - 1));
};

const isPostOwner = (post, req) => {
  if (!req.user) return false;
  return String(post.userId) === String(req.user.id);
};

const serializePost = async (postInstance) => {
  const commentsCount = await Comment.count({
    where: { postId: postInstance.id },
  });

  const authorName = postInstance.User?.nick || "익명";

  return {
    id: postInstance.id,
    title: postInstance.title,
    content: postInstance.content,
    author: maskName(authorName),
    date: formatDate(postInstance.createdAt),
    comments: commentsCount,
  };
};

export const createPost = async (req, res, next) => {
  try {
    const title = safeString(req.body.title);
    const content = safeString(req.body.content);

    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (!title || !content) {
      return res.status(400).json({ message: "제목과 내용은 필수입니다." });
    }

    if (title.length > 60) {
      return res.status(400).json({ message: "제목은 최대 60자까지 가능합니다." });
    }

    const post = await Post.create({
      title,
      content,
      userId: req.user.id,
    });

    const populatedPost = await Post.findByPk(post.id, {
      include: [{ model: User, attributes: ["nick"] }],
    });

    return res.status(201).json(await serializePost(populatedPost));
  } catch (error) {
    console.error("createPost error:", error);
    next(error);
  }
};

export const uploadPost = createPost;

export const getPosts = async (req, res, next) => {
  try {
    const keyword = safeString(req.query.keyword || req.query.search || req.query.q || "");

    const whereCondition = {};
    if (keyword) {
      whereCondition[Sequelize.Op.or] = [
        { title: { [Sequelize.Op.like]: `%${keyword}%` } },
        { content: { [Sequelize.Op.like]: `%${keyword}%` } },
      ];
    }

    const posts = await Post.findAll({
      where: whereCondition,
      include: [{ model: User, attributes: ["nick"] }],
      order: [["createdAt", "DESC"]],
    });

    const result = await Promise.all(posts.map((post) => serializePost(post)));
    return res.status(200).json(result);
  } catch (error) {
    console.error("getPosts error:", error);
    next(error);
  }
};

export const getPostDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [{ model: User, attributes: ["nick"] }],
    });

    if (!post) {
      return res.status(404).json({ message: "게시글 없음" });
    }

    return res.status(200).json(await serializePost(post));
  } catch (error) {
    console.error("getPostDetail error:", error);
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const title = safeString(req.body.title || "");
    const content = safeString(req.body.content || "");

    const post = await Post.findByPk(id, {
      include: [{ model: User, attributes: ["nick"] }],
    });

    if (!post) {
      return res.status(404).json({ message: "게시글 없음" });
    }

    if (!isPostOwner(post, req)) {
      return res.status(403).json({ message: "권한 없음" });
    }

    if (title) {
      if (title.length > 60) {
        return res.status(400).json({ message: "제목은 최대 60자까지 가능합니다." });
      }
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    await post.save();

    return res.status(200).json(await serializePost(post));
  } catch (error) {
    console.error("updatePost error:", error);
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: "게시글 없음" });
    }

    if (!isPostOwner(post, req)) {
      return res.status(403).json({ message: "권한 없음" });
    }

    await Comment.destroy({ where: { postId: post.id } });
    await post.destroy();

    return res.json({ message: "삭제 완료" });
  } catch (error) {
    console.error("deletePost error:", error);
    next(error);
  }
};

export default {
  createPost,
  uploadPost,
  getPosts,
  getPostDetail,
  updatePost,
  deletePost,
};