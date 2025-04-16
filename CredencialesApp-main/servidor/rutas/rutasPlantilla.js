// servidor/rutas/rutasPlantilla.js
const express = require('express');
const router = express.Router();
const controladorPlantilla = require('../controladores/controladorPlantilla');
const { estaAutenticado, esAdmin } = require('../middleware/auth');
const { uploadLogo, manejarErrorMulter } = require('../middleware/upload');

// Todas las rutas requieren autenticación
router.use(estaAutenticado);

// Rutas para plantillas
router.post('/', esAdmin, controladorPlantilla.crearPlantilla);
router.get('/', controladorPlantilla.obtenerPlantillas);
router.get('/:id', controladorPlantilla.obtenerPlantilla);
router.put('/:id', esAdmin, controladorPlantilla.actualizarPlantilla);
router.delete('/:id', esAdmin, controladorPlantilla.eliminarPlantilla);

// Ruta para subir logos
router.post('/logo', esAdmin, uploadLogo.single('logo'), manejarErrorMulter, (req, res) => {
  if (req.file) {
    res.json({ 
      url: `/uploads/logos/${req.file.filename}`,
      mensaje: 'Logo subido exitosamente'
    });
  } else {
    res.status(400).json({ mensaje: 'No se recibió ningún archivo' });
  }
});

module.exports = router;