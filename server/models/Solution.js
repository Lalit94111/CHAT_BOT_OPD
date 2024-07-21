const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Patient = require('./Patient'); 

const Solution = sequelize.define('Solution', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    correctTest: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correctDiagnosis: {
        type: DataTypes.STRING,
        allowNull: false
    },
    patientId: {
        type: DataTypes.INTEGER,
        references: {
            model: Patient,
            key: 'id'
        },
        unique: true, 
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'solutions'
});

Solution.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Patient.hasOne(Solution, { foreignKey: 'patientId', as: 'solution' });

module.exports = Solution;
