import Sequelize from "sequelize";

class Post extends Sequelize.Model {
    static initiate(sequelize) {
        Post.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: Sequelize.STRING(120),
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
                {
                    name: 'title_content_fulltext_idx',
                    type: 'FULLTEXT',
                    fields: ['title', 'content'],
                }
            ]
        });
    }

    static associate(db) {
    Post.belongsTo(db.User, {
        foreignKey: "userId",
        targetKey: "studentId",
    });
}
}

export default Post;