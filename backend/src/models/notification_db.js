import Sequelize from 'sequelize';

class Notification extends Sequelize.Model {

    static initiate(sequelize) {

        Notification.init({

            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            senderId: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },

            receiverId: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },

            teamTitle: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            postId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },

            type: {
                type: Sequelize.ENUM('apply', 'accept', 'reject'),
                defaultValue: 'apply',
            },

            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            isRead: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }

        }, {

            sequelize,

            timestamps: true,

            paranoid: false,

            modelName: 'Notification',

            tableName: 'notifications',

            charset: 'utf8mb4',

            collate: 'utf8mb4_general_ci',

        });

    }

    static associate(db) {}

}

export default Notification;