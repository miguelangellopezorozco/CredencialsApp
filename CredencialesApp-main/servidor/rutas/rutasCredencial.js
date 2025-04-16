// servidor/rutas/rutasCredencial.js
const express = require('express');
const router = express.Router();
const controladorCredencial = require('../controladores/controladorCredencial');
const { estaAutenticado } = require('../middleware/auth');
const { uploadFoto, manejarErrorMulter } = require('../middleware/upload');

// Todas las rutas requieren autenticación
router.use(estaAutenticado);

// Rutas para credenciales
router.post('/', uploadFoto.single('foto'), manejarErrorMulter, controladorCredencial.crearCredencial);
router.get('/', controladorCredencial.obtenerCredenciales);
router.get('/buscar', controladorCredencial.buscarCredenciales);
router.get('/:id', controladorCredencial.obtenerCredencial);
router.put('/:id', uploadFoto.single('foto'), manejarErrorMulter, controladorCredencial.actualizarCredencial);
router.delete('/:id', controladorCredencial.eliminarCredencial);

module.exports = router;