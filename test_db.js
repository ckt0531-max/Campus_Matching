import Sequelize from 'sequelize';

const sqliteSequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./backend/database.sqlite",
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
