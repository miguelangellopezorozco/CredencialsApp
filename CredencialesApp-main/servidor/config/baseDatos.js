// servidor/config/baseDatos.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mssql',
    dialectOptions: {
      options: {
        server: process.env.DB_HOST,   // 👈 AQUÍ ESTÁ LA CLAVE
        port: parseInt(process.env.DB_PORT || '1433'),
        encrypt: false,
        trustServerCertificate: true
      }
    }
  }
);

module.exports = sequelize;
