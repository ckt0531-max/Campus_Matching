import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import db from "./models/index.js";
const { sequelize } = db;

import matchingRouter from "./routes/matching.js";
import authRouter from "./routes/auth_routes.js";
import postRouter from "./routes/post_routes.js";

const app = express();

app.set("port", process.env.PORT || 3001);

app.use(morgan("dev"));

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET || "campus_secret"));

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET || "campus_secret",
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

app.use("/api", matchingRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message,
        error: process.env.NODE_ENV !== "production" ? err : {},
    });
});

async function startServer() {
    try {
        await sequelize.sync({ force: false });
        console.log("데이터베이스 연결 성공");

        app.listen(app.get("port"), () => {
            console.log(`${app.get("port")} 번 포트 서버 실행 중 🚀`);
        });
    } catch (err) {
        console.error("서버 실행 실패");
        console.error(err);
    }
}

startServer();