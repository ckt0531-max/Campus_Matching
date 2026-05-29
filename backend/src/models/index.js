import Sequelize from "sequelize";
import { createRequire } from "module";

<<<<<<< HEAD
import User from "./user_db.js";
import Notification from "./notification_db.js";
=======
import User from "./user_db.js"; 
import Post from "./post_db.js"; 
>>>>>>> 8014a63d55cdaaafe478e696fd4cb4f6a21f9349

const require = createRequire(import.meta.url);

const configAll = require("../../config/config.json");

const env = process.env.NODE_ENV || 'development';

const config = configAll[env];

const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

db.sequelize = sequelize;

db.Sequelize = Sequelize;

db.User = User;

db.Notification = Notification;

User.initiate(sequelize);

<<<<<<< HEAD
Notification.initiate(sequelize);
=======
db.Post = Post;
Post.initiate(sequelize);
>>>>>>> 8014a63d55cdaaafe478e696fd4cb4f6a21f9349

Object.keys(db).forEach(modelName => {

    if (db[modelName].associate) {

        db[modelName].associate(db);

    }

});

export default db;