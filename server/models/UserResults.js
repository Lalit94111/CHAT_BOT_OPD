const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Patient = require('./Patient'); 
const User = require('./User'); 

const UserResults = sequelize.define('UserResults', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    patientId: {
        type: DataTypes.INTEGER,
        references: {
            model: Patient, 
            key: 'id'
        },
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User, 
            key: 'id'
        },
        allowNull: false
    },
    testPoint: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 5
        }
    },
    testAnswered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    diagnosisPoint: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 5
        }
    },
    diagnosisAnswered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'user_results' 
});

// Define associations
UserResults.belongsTo(Patient, { foreignKey: 'patientId' });
UserResults.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserResults;
