// servidor/rutas/rutasAutenticacion.js
const express = require('express');
const router = express.Router();
const controladorAutenticacion = require('../controladores/controladorAutenticacion');
const { estaAutenticado } = require('../middleware/auth');

router.post('/login', controladorAutenticacion.iniciarSesion);
router.post('/logout', estaAutenticado, controladorAutenticacion.cerrarSesion);
router.get('/verificar', controladorAutenticacion.verificarSesion);

module.exports = router;