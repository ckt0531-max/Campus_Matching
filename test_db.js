import Sequelize from 'sequelize';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqliteSequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.resolve(__dirname, "backend/database.sqlite"),
    logging: false,
});

async function test() {
    await sqliteSequelize.authenticate();
    const [results, metadata] = await sqliteSequelize.query("SELECT * FROM posts");
    console.log("Posts:");
    console.log(results);
    const [users, uMeta] = await sqliteSequelize.query("SELECT * FROM users");
    console.log("Users:");
    console.log(users);
}

test().catch(console.error);
