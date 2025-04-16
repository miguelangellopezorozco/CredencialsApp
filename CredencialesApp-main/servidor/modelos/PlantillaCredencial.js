// servidor/modelos/PlantillaCredencial.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/baseDatos');

const PlantillaCredencial = sequelize.define('PlantillaCredencial', {
  template_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_plantilla: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  layout_data: {
    type: DataTypes.TEXT, // Aquí se guardará la configuración en formato JSON
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('layout_data');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('layout_data', 
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    }
  }
}, {
  tableName: 'PlantillasCredenciales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  // Añadir esta configuración para manejar las fechas con SQL Server
  hooks: {
    beforeCreate: (instance) => {
      // Usar el método toSQL de SQL Server para las fechas
      instance.created_at = sequelize.fn('GETDATE');
    }
  }
});

module.exports = PlantillaCredencial;