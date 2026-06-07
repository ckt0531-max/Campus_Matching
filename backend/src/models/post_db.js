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
            category: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            people: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            place: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                }
            },
            isClosed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
            indexes: sequelize.options.dialect === 'sqlite' ? [] : [
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
            targetKey: "id",
            onDelete: "CASCADE",
        });
    }
}


export default Post;