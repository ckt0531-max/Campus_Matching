import bcrypt from "bcryptjs";
import db from "../models/index.js";
const { User } = db;

import { serializeUser, signAccessToken } from "../service/auth_service.js";

export const signup = async (req, res) => {
  try {
    const { id, nick, password, preferredRole } = req.body;

    if (!id || !nick || !password) {
      return res.status(400).json({
        message: "아이디(id), 닉네임(nick), 비밀번호(password)는 필수입니다.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "비밀번호는 6자 이상이어야 합니다.",
      });
    }

    const normalizedId = id.trim().toLowerCase();

    const existingUser = await User.findOne({ where: { id: normalizedId } });
    if (existingUser) {
      return res.status(409).json({
        message: "이미 사용 중인 아이디입니다.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: normalizedId,
      nick: nick.trim(),
      password: hashedPassword,
      provider: "local",
      preferredRole: preferredRole || "all-rounder",
    });

    const token = signAccessToken(user);

    return res.status(201).json({
      user: serializeUser(user),
      token,
    });
  } catch (error) {
    console.error("signup error:", error);
    return res.status(500).json({
      message: "회원가입 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({
        message: "아이디(id)와 비밀번호(password)는 필수입니다.",
      });
    }

    const normalizedId = id.trim().toLowerCase();

    const user = await User.findOne({
      where: {
        id: normalizedId,
        provider: "local",
      },
      attributes: ["id", "nick", "password", "provider", "preferredRole"],
    });

    if (!user) {
      return res.status(401).json({
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const token = signAccessToken(user);

    return res.status(200).json({
      user: serializeUser(user),
      token,
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      message: "로그인 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    message: "로그아웃 성공",
  });
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json(serializeUser(req.user));
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({
      message: "사용자 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
};

export default {
  signup,
  login,
  logout,
  getMe,
};