import Sequelize from "sequelize";

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            id: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true,
                primaryKey: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            provider: {
                type: Sequelize.ENUM('local'),
                allowNull: false,
                defaultValue: 'local',
            },
            preferredRole: {
                type: Sequelize.ENUM('presentation', 'ppt', 'research', 'leader', 'all-rounder'),
                allowNull: false,
                defaultValue: 'all-rounder',
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
    }
}

export default User;