import jwt from "jsonwebtoken";

export const serializeUser = (user) => ({
  studentId: user.studentId,
  name: user.name,
  department: user.department,
  preferredRole: user.preferredRole,
  skills: user.skills,
  introduction: user.introduction,
});

export const signAccessToken = (user) => {
  const secretKey = process.env.JWT_SECRET || process.env.COOKIE_SECRET || "campus_secret";

  return jwt.sign(
    {
      sub: user.studentId,
      name: user.name,
    },
    secretKey,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export const extractBearerToken = (authHeader = "") => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};