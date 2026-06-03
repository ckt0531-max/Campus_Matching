import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;

import { extractBearerToken } from "../service/auth_service.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        message: "인증 토큰이 없습니다.",
      });
    }

    const secretKey = process.env.JWT_SECRET || process.env.COOKIE_SECRET || "campus_secret";
    const decoded = jwt.verify(token, secretKey);

    const user = await User.findByPk(decoded.sub);
    
    if (!user) {
      return res.status(401).json({
        message: "유효하지 않은 사용자입니다.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("JWT 인증 에러:", error.message);
    return res.status(401).json({
      message: "유효하지 않거나 만료된 토큰입니다.",
    });
  }
};

export default authMiddleware;