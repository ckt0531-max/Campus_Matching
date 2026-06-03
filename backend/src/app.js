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

let dbStatus = {
    connected: false,
    message: "데이터베이스 연결 확인 전",
};

app.use(morgan("dev"));

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "프론트엔드와 백엔드가 연결되었습니다.",
        serverTime: new Date().toISOString(),
        db: dbStatus,
    });
});

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
        await sequelize.authenticate();
        await sequelize.sync({ force: false });

        dbStatus = {
            connected: true,
            message: "데이터베이스 연결 성공",
        };

        console.log("데이터베이스 연결 성공");
    } catch (err) {
        dbStatus = {
            connected: false,
            message: err.message,
        };

        console.error("데이터베이스 연결 실패");
        console.error(err.message);
        console.error("DB가 없어도 백엔드 서버는 실행됩니다. DB 기능은 MySQL 설정 후 사용할 수 있습니다.");
    }

    app.listen(app.get("port"), () => {
        console.log(`${app.get("port")} 번 포트 서버 실행 중 🚀`);
    });
}

startServer();