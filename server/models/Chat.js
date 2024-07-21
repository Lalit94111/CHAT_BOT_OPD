const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    roomId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT, 
        allowNull: false
    },
    isAI: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    timestamps: true, 
    tableName: 'chats' 
});

module.exports = Chat;
