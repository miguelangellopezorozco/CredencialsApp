// servidor/modelos/indice.js
const sequelize = require('../config/baseDatos');
const Operador = require('./Operador');
const Credencial = require('./Credencial');
const PlantillaCredencial = require('./PlantillaCredencial');
const SesionOperador = require('./SesionOperador');

const db = {
  sequelize,
  Operador,
  Credencial,
  PlantillaCredencial,
  SesionOperador
};

module.exports = db;