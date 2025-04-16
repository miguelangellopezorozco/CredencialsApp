// servidor/controladores/controladorPlantilla.js
const PlantillaCredencial = require('../modelos/PlantillaCredencial');

exports.crearPlantilla = async (req, res) => {
  try {
    const { nombre_plantilla, layout_data } = req.body;
    
    // Asegurarnos de manejar correctamente el layout_data
    const nuevaPlantilla = await PlantillaCredencial.create({
      nombre_plantilla,
      layout_data
    });
    
    return res.status(201).json({
      mensaje: 'Plantilla creada exitosamente',
      plantilla: nuevaPlantilla
    });
  } catch (error) {
    console.error('Error al crear la plantilla:', error);
    return res.status(500).json({ mensaje: 'Error al crear la plantilla' });
  }
};

exports.obtenerPlantillas = async (req, res) => {
  try {
    const plantillas = await PlantillaCredencial.findAll();
    return res.status(200).json(plantillas);
  } catch (error) {
    console.error('Error al obtener las plantillas:', error);
    return res.status(500).json({ mensaje: 'Error al obtener las plantillas' });
  }
};

exports.obtenerPlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const plantilla = await PlantillaCredencial.findByPk(id);
    if (!plantilla) {
      return res.status(404).json({ mensaje: 'Plantilla no encontrada' });
    }
    return res.status(200).json(plantilla);
  } catch (error) {
    console.error('Error al obtener la plantilla:', error);
    return res.status(500).json({ mensaje: 'Error al obtener la plantilla' });
  }
};

exports.actualizarPlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const plantilla = await PlantillaCredencial.findByPk(id);
    if (!plantilla) {
      return res.status(404).json({ mensaje: 'Plantilla no encontrada' });
    }
    
    const { nombre_plantilla, layout_data } = req.body;
    await plantilla.update({
      nombre_plantilla,
      layout_data
    });
    
    return res.status(200).json({
      mensaje: 'Plantilla actualizada exitosamente',
      plantilla: plantilla
    });
  } catch (error) {
    console.error('Error al actualizar la plantilla:', error);
    return res.status(500).json({ mensaje: 'Error al actualizar la plantilla' });
  }
};

exports.eliminarPlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const plantilla = await PlantillaCredencial.findByPk(id);
    if (!plantilla) {
      return res.status(404).json({ mensaje: 'Plantilla no encontrada' });
    }
    await plantilla.destroy();
    return res.status(200).json({ mensaje: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la plantilla:', error);
    return res.status(500).json({ mensaje: 'Error al eliminar la plantilla' });
  }
};