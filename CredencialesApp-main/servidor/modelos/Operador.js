const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/baseDatos');

const Operador = sequelize.define('Operador', {
  id: {
    type         : DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey   : true
  },
  usuario: {
    type  : DataTypes.STRING(50),
    allowNull: false,
    unique   : true
  },
  password: {
    type      : DataTypes.STRING(255),
    allowNull : false
  },
  rol: {
    type     : DataTypes.STRING(10),
    allowNull: false,                 // 'admin' o 'user'
    validate : { isIn: [['admin', 'user']] }
  },

  // ------------------------------------------------------------------
  // AJUSTE: timestamps explícitos con default GETDATE()
  // ------------------------------------------------------------------
  created_at: {
    type        : DataTypes.DATE,
    allowNull   : false,
    defaultValue: Sequelize.literal('GETDATE()')
  },
  updated_at: {
    type        : DataTypes.DATE,
    allowNull   : false,
    defaultValue: Sequelize.literal('GETDATE()')
  }
}, {
  tableName : 'Operadores',
  timestamps: true,        // Sequelize seguirá gestionando updated_at internamente
  createdAt : 'created_at',
  updatedAt : 'updated_at'
});

module.exports = Operador;