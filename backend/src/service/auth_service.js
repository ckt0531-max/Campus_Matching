import jwt from "jsonwebtoken";

export const serializeUser = (user) => ({
  id: user.id,
  nick: user.nick,
  preferredRole: user.preferredRole,
  provider: user.provider || "local",
});

export const signAccessToken = (user) => {
  const secretKey = process.env.JWT_SECRET || process.env.COOKIE_SECRET || "campus_secret";

  return jwt.sign(
    {
      sub: user.id,
      nick: user.nick,
      provider: user.provider,
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