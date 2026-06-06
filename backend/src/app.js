import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import Sequelize from "sequelize";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import db from "./models/index.js";

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

async function seedDatabase() {
    try {
        const userCount = await db.User.count();
        let demoUserId = "20231234";

        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash("123456", 10);

            // 데모 유저 4명 생성
            await db.User.create({
                studentId: "20231234",
                name: "김철수",
                department: "컴퓨터공학과",
                password: hashedPassword,
                preferredRole: "all-rounder",
                introduction: "안녕하세요! 컴공 3학년 김철수입니다.",
            });
            await db.User.create({
                studentId: "20212001",
                name: "이민준",
                department: "전자공학과",
                password: hashedPassword,
                preferredRole: "backend",
                introduction: "백엔드 개발에 관심 많은 이민준입니다.",
            });
            await db.User.create({
                studentId: "20223456",
                name: "박지영",
                department: "소프트웨어학과",
                password: hashedPassword,
                preferredRole: "frontend",
                introduction: "UI/UX 디자인과 프론트엔드를 즐기는 박지영입니다.",
            });
            await db.User.create({
                studentId: "20190987",
                name: "최현우",
                department: "인공지능학과",
                password: hashedPassword,
                preferredRole: "all-rounder",
                introduction: "AI 연구에 관심 많은 최현우입니다.",
            });

            console.log("데모 유저 4명 생성 완료 👤");
        } else {
            const firstUser = await db.User.findOne();
            if (firstUser) {
                demoUserId = firstUser.studentId;
            }
        }

        const postCount = await db.Post.count();
        if (postCount === 0) {
            await db.Post.create({
                title: "인공지능 팀플 팀원 모집",
                content: "함께 인공지능 팀플을 진행할 팀원을 모집합니다. AI 기초 지식이 있는 분 대환영합니다!",
                category: "인공지능",
                people: "4명",
                place: "성결관 401호",
                userId: "20190987",
            });

            await db.Post.create({
                title: "웹 프로젝트 팀원 모집",
                content: "React를 활용한 웹 프로젝트를 같이 할 팀원을 구합니다. 프론트/백엔드 가리지 않고 환영합니다.",
                category: "웹응용기술",
                people: "3명",
                place: "학술정보관",
                userId: "20223456",
            });

            console.log("데모 게시글 2개 생성 완료 📝");
        }

        const closedCount = await db.Post.count({ where: { isClosed: true } });
        if (closedCount === 0) {
            await db.Post.create({
                title: "모바일 프로그래밍 스터디 모집",
                content: "모바일 프로그래밍 과제와 시험 대비 스터디 그룹원 모집이 마감되었습니다.",
                category: "모바일 프로그래밍",
                people: "3명",
                place: "온라인 (Zoom)",
                userId: "20212001",
                isClosed: true,
            });
            console.log("마감 상태의 데모 게시글 생성 완료 📝");
        }
    } catch (err) {
        console.error("데이터베이스 시딩 실패:", err.message);
    }
}


async function startServer() {
    try {
        if (process.env.DB_DIALECT === "sqlite") {
            throw new Error("Force SQLite mode via environment variable");
        }
        await db.sequelize.authenticate();
        await db.sequelize.sync({ alter: true });
        await seedDatabase();

        dbStatus = {
            connected: true,
            message: "MySQL 데이터베이스 연결 성공",
        };

        console.log("MySQL 데이터베이스 연결 성공 🐬");
    } catch (err) {
        console.log("MySQL 연결에 실패하여 SQLite(로컬 파일) 모드로 자동 전환을 시도합니다...");
        console.error("MySQL 연결 실패 사유:", err.message);

        try {
            const sqliteSequelize = new Sequelize({
                dialect: "sqlite",
                storage: path.resolve(__dirname, "../database.sqlite"),
                logging: false,
            });

            db.sequelize = sqliteSequelize;

            db.User.initiate(sqliteSequelize);
            db.Notification.initiate(sqliteSequelize);
            db.Post.initiate(sqliteSequelize);

            Object.keys(db).forEach((modelName) => {
                if (db[modelName].associate) {
                    db[modelName].associate(db);
                }
            });

            await sqliteSequelize.authenticate();
            await sqliteSequelize.sync({ alter: true });
            await seedDatabase();

            dbStatus = {
                connected: true,
                message: "SQLite 데이터베이스 연결 성공 (로컬 파일)",
            };

            console.log("SQLite 데이터베이스 연결 성공 (로컬 파일) 📁");
        } catch (sqliteErr) {
            dbStatus = {
                connected: false,
                message: sqliteErr.message,
            };

            console.error("SQLite 연결도 실패했습니다:", sqliteErr.message);
            console.error("DB 기능 없이 서버만 실행됩니다.");
        }
    }

    app.listen(app.get("port"), () => {
        console.log(`${app.get("port")} 번 포트 서버 실행 중 🚀`);
    });
}

startServer();