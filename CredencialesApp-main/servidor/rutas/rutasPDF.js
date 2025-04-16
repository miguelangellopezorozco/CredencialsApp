// servidor/rutas/rutasPDF.js
const express = require('express');
const router = express.Router();
const { generarPDF } = require('../utilidades/generadorPDF');
const { estaAutenticado } = require('../middleware/auth');
const Credencial = require('../modelos/Credencial');
const PlantillaCredencial = require('../modelos/PlantillaCredencial');

// Todas las rutas requieren autenticación
router.use(estaAutenticado);

// Generar PDF de credencial
router.get('/credencial/:id/:plantillaId', async (req, res) => {
  try {
    const { id, plantillaId } = req.params;
    
    // Obtener datos de la credencial
    const credencial = await Credencial.findByPk(id);
    if (!credencial) {
      return res.status(404).json({ mensaje: 'Credencial no encontrada' });
    }
    
    // Obtener la plantilla
    const plantilla = await PlantillaCredencial.findByPk(plantillaId);
    if (!plantilla) {
      return res.status(404).json({ mensaje: 'Plantilla no encontrada' });
    }
    
    // Usar el generador de PDF
    generarPDF(credencial.toJSON(), plantilla.layout_data, res, 'download');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al generar el PDF' });
  }
});

// Generar y guardar PDF de credencial
router.post('/guardar-credencial/:id/:plantillaId', async (req, res) => {
  try {
    const { id, plantillaId } = req.params;
    
    // Obtener datos de la credencial
    const credencial = await Credencial.findByPk(id);
    if (!credencial) {
      return res.status(404).json({ mensaje: 'Credencial no encontrada' });
    }
    
    // Obtener la plantilla
    const plantilla = await PlantillaCredencial.findByPk(plantillaId);
    if (!plantilla) {
      return res.status(404).json({ mensaje: 'Plantilla no encontrada' });
    }
    
    // Generar y guardar el PDF
    const pdfPath = generarPDF(credencial.toJSON(), plantilla.layout_data, null, 'stream');
    
    return res.status(200).json({ 
      mensaje: 'PDF generado exitosamente',
      pdfUrl: pdfPath
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al generar el PDF' });
  }
});

module.exports = router;