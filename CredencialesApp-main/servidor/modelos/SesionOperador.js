// servidor/modelos/SesionOperador.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize  = require('../config/baseDatos');
const Operador   = require('./Operador');

const SesionOperador = sequelize.define('SesionOperador', {
  sesion_id: {
    type         : DataTypes.INTEGER,
    primaryKey   : true,
    autoIncrement: true
  },

  operador_id: {
    type      : DataTypes.INTEGER,
    allowNull : false,
    references: {
      model: Operador,
      key  : 'id'
    }
  },

  // ---------------------------------------------------------------------------
  // AJUSTE ➜ usamos GETDATE() para que SQL Server genere la marca de tiempo
  // ---------------------------------------------------------------------------
  fecha_inicio: {
    type        : DataTypes.DATE,
    allowNull   : false,
    defaultValue: Sequelize.literal('GETDATE()') 
  },

  fecha_fin: {
    type      : DataTypes.DATE,
    allowNull : true         // se rellenará al cerrar sesión
  },

  ip_address: {
    type      : DataTypes.STRING(45),
    allowNull : true
  }
}, {
  tableName : 'SesionesOperadores',
  timestamps: false            // gestionamos fechas manualmente
});

// Relación ↔ Operador
SesionOperador.belongsTo(Operador, { foreignKey: 'operador_id' });
Operador.hasMany(SesionOperador, { foreignKey: 'operador_id' });

module.exports = SesionOperador;
