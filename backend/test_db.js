import Sequelize from 'sequelize';
import db from './src/models/index.js';

const sqliteSequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false,
});

async function test() {
    // Re-initialize with sqlite
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
    
    const posts = await db.Post.findAll({ include: [{ model: db.User }] });
    console.log("=== Sequelize Posts with Users ===");
    console.log(JSON.stringify(posts, null, 2));

    const users = await db.User.findAll();
    console.log("=== Sequelize Users ===");
    console.log(JSON.stringify(users, null, 2));
}

test().catch(console.error);
