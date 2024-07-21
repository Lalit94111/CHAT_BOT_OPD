const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Patient = sequelize.define('Patient', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    history: {
        type: DataTypes.STRING,
        allowNull: false
    },
    symptoms: {
        type: DataTypes.STRING,
        allowNull: false
    },
    additionalInfo: {
        type: DataTypes.TEXT,
        allowNull: true 
    },
    patientSummary: {
        type: DataTypes.TEXT, 
        allowNull: false
    },
}, {
    timestamps: true, 
    tableName: 'patients' 
});

module.exports = Patient;
