import Sequelize from 'sequelize';
import db from './src/models/index.js';

const sqliteSequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
});

async function fixPosts() {
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
    
    // 1. "인공지능 팀플 팀원 모집" -> userId: "20190987"
    await db.Post.update({ userId: "20190987" }, { where: { title: "인공지능 팀플 팀원 모집" } });
    
    // 2. "웹 프로젝트 팀원 모집" -> userId: "20223456"
    await db.Post.update({ userId: "20223456" }, { where: { title: "웹 프로젝트 팀원 모집" } });
    
    // 3. "모바일 프로그래밍 스터디 모집" -> userId: "20212001"
    await db.Post.update({ userId: "20212001" }, { where: { title: "모바일 프로그래밍 스터디 모집" } });

    console.log("Existing dummy posts have been fixed with proper userIds.");
}

fixPosts().catch(console.error);
