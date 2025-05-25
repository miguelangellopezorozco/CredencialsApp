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
    
    // Log para debugging
    console.log(`Generando PDF para credencial ${id} con plantilla ${plantillaId}`);
    console.log(`Usuario autenticado: ${req.session.operadorId}`);
    
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
    await generarPDF(credencial.toJSON(), plantilla.layout_data, res, 'download');
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return res.status(500).json({ mensaje: 'Error al generar el PDF', error: error.message });
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
    const pdfPath = await generarPDF(credencial.toJSON(), plantilla.layout_data, null, 'stream');
    
    return res.status(200).json({ 
      mensaje: 'PDF generado exitosamente',
      pdfUrl: pdfPath
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return res.status(500).json({ mensaje: 'Error al generar el PDF', error: error.message });
  }
});

module.exports = router;