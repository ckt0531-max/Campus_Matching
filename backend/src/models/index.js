import Sequelize from "sequelize";
import dotenv from "dotenv";

import User from "./user_db.js";
import Notification from "./notification_db.js";
import Post from "./post_db.js";

dotenv.config();

const config = {
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "campus_matching",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  dialect: process.env.DB_DIALECT || "mysql",
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  timezone: "+09:00",
};

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 등록
db.User = User;
db.Notification = Notification;
db.Post = Post;

// 모델 초기화
User.initiate(sequelize);
Notification.initiate(sequelize);
Post.initiate(sequelize);

// 관계 설정
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
