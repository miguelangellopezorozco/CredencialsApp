// servidor/modelos/SesionOperador.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/baseDatos');
const Operador = require('./Operador');

const SesionOperador = sequelize.define('SesionOperador', {
  sesion_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  operador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Operador,
      key: 'id'
    }
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'SesionesOperadores',
  timestamps: false
});
// Establecer relación
SesionOperador.belongsTo(Operador, { foreignKey: 'operador_id' });
Operador.hasMany(SesionOperador, { foreignKey: 'operador_id' });

module.exports = SesionOperador;