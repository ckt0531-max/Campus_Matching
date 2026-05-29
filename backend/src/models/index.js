import Sequelize from "sequelize";
import { createRequire } from "module";

import User from "./user_db.js"; 
import Post from "./post_db.js"; 

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
User.initiate(sequelize);

db.Post = Post;
Post.initiate(sequelize);

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

export default db;