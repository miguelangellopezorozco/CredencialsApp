// servidor/config/sesion.js
require('dotenv').config();
const session = require('express-session');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'tu_clave_secreta_aqui',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // En producción, usar HTTPS y cookie secure: true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'lax'
  }
});

module.exports = sessionMiddleware;
