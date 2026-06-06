import bcrypt from "bcryptjs";
import db from "../models/index.js";
const { User } = db;

import { serializeUser, signAccessToken } from "../service/auth_service.js";

export const signup = async (req, res) => {
  try {
    const { studentId, name, department, password, preferredRole, skills, introduction } = req.body;

    if (!studentId || !name || !department || !password) {
      return res.status(400).json({
        message: "학번(studentId), 이름(name), 학과(department), 비밀번호(password)는 필수입니다.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "비밀번호는 6자 이상이어야 합니다.",
      });
    }

    const trimmedStudentId = studentId.trim();

    const existingUser = await User.findOne({ where: { studentId: trimmedStudentId } });
    if (existingUser) {
      return res.status(409).json({
        message: "이미 사용 중인 학번입니다.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      studentId: trimmedStudentId,
      name: name.trim(),
      department: department.trim(),
      password: hashedPassword,
      preferredRole: preferredRole || "all-rounder",
      skills: skills || "",
      introduction: introduction || "",
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
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({
        message: "학번(studentId)과 비밀번호(password)는 필수입니다.",
      });
    }

    const trimmedStudentId = studentId.trim();

    const user = await User.findOne({
      where: {
        studentId: trimmedStudentId,
      },
      attributes: ["studentId", "name", "department", "password", "preferredRole", "skills", "introduction"],
    });

    if (!user) {
      return res.status(401).json({
        message: "학번 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({
        message: "학번 또는 비밀번호가 올바르지 않습니다.",
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

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const { name, department, preferredRole, skills, introduction } = req.body;

    const user = await User.findByPk(req.user.studentId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (name) user.name = name.trim();
    if (department) user.department = department.trim();
    if (preferredRole) user.preferredRole = preferredRole;
    if (skills !== undefined) user.skills = skills;
    if (introduction !== undefined) user.introduction = introduction;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "프로필이 성공적으로 수정되었습니다.",
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({
      message: "프로필 수정 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

export default {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
};