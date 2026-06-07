import Sequelize from "sequelize";

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
            },
            studentId: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
            },

            name: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },

            department: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },

            password: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            preferredRole: {
                type: Sequelize.ENUM(
                    'presentation',
                    'ppt',
                    'research',
                    'leader',
                    'all-rounder',
                    'frontend',
                    'backend',
                    'design'
                ),
                allowNull: false,
                defaultValue: 'all-rounder',
            },

            skills: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            introduction: {
                type: Sequelize.TEXT,
                allowNull: true,
            }

        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: 'User',
            tableName: 'users',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        User.hasMany(db.Post, { foreignKey: "userId", sourceKey: "id" });
    }
}

export default User;