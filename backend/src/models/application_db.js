import Sequelize from 'sequelize';

class Application extends Sequelize.Model {
    static initiate(sequelize) {
        Application.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            postId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            applicantId: {
                type: Sequelize.STRING(40),
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: true,
            modelName: 'Application',
            tableName: 'applications',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
                {
                    unique: true,
                    fields: ['postId', 'applicantId']
                }
            ]
        });
    }

    static associate(db) {
        // associations if needed
    }
}

export default Application;
