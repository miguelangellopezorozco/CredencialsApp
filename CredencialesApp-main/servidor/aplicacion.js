// servidor/aplicacion.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sessionMiddleware = require('./config/sesion');
const { obtenerOperadorActual } = require('./middleware/auth');

// Importar rutas
const rutasAutenticacion = require('./rutas/rutasAutenticacion');
const rutasOperador = require('./rutas/rutasOperador');
const rutasCredencial = require('./rutas/rutasCredencial');
const rutasPlantilla = require('./rutas/rutasPlantilla');
const rutasPDF = require('./rutas/rutasPDF');

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(obtenerOperadorActual);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../cliente')));

// Rutas API
app.use('/api/auth', rutasAutenticacion);
app.use('/api/operadores', rutasOperador);
app.use('/api/credenciales', rutasCredencial);
app.use('/api/plantillas', rutasPlantilla);
app.use('/api/pdf', rutasPDF);

// Ruta para todas las demás solicitudes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../cliente/index.html'));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;