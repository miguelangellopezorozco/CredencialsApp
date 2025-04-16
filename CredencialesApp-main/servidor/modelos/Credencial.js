const { DataTypes } = require('sequelize');
const sequelize = require('../config/baseDatos');

const Credencial = sequelize.define('Credencial', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  numero_seguridad_social: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  numero_nomina: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  rfc: {
    type: DataTypes.STRING(13),
    allowNull: false,
    validate: {
      len: [12, 13]
    }
  },
  foto: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Credenciales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Añadir esta configuración:
  hooks: {
    beforeCreate: (instance) => {
      // Usar el método toSQL de SQL Server para las fechas
      instance.created_at = sequelize.fn('GETDATE');
      instance.updated_at = sequelize.fn('GETDATE');
    },
    beforeUpdate: (instance) => {
      // Actualizar solo updated_at en actualizaciones
      instance.updated_at = sequelize.fn('GETDATE');
    }
  }
});

module.exports = Credencial;