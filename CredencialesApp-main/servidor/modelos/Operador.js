const { DataTypes } = require('sequelize');
const sequelize = require('../config/baseDatos');

const Operador = sequelize.define('Operador', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.STRING(10),
    allowNull: false, // 'admin' o 'user'
    validate: {
      isIn: [['admin', 'user']]
    }
  }
}, {
  tableName: 'Operadores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Operador;