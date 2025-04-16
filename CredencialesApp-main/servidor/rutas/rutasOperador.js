// servidor/rutas/rutasOperador.js
const express = require('express');
const router = express.Router();
const controladorOperador = require('../controladores/controladorOperador');
const { esAdmin, estaAutenticado } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(estaAutenticado);

// Rutas para administradores
router.post('/', esAdmin, controladorOperador.crearOperador);
router.get('/', esAdmin, controladorOperador.obtenerOperadores);
router.get('/:id', esAdmin, controladorOperador.obtenerOperador);
router.put('/:id', esAdmin, controladorOperador.actualizarOperador);
router.delete('/:id', esAdmin, controladorOperador.eliminarOperador);

module.exports = router;