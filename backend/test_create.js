import Sequelize from 'sequelize';
import db from './src/models/index.js';

const sqliteSequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: true,
});

async function test() {
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
    
    const post = await db.Post.create({
        title: "Test",
        content: "Test Content",
        userId: "20190987"
    });
    
    console.log("Created Post:", post.toJSON());
}

test().catch(console.error);
