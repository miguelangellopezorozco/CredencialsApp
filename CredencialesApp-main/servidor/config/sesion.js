// servidor/config/sesion.js
require('dotenv').config();
const session = require('express-session');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // En producción, usar HTTPS y cookie secure: true
});

module.exports = sessionMiddleware;
