// servidor/config/baseDatos.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false, // Cambiar a true en producción con conexión segura
        trustServerCertificate: true
      }
    }
  }
);

module.exports = sequelize;
