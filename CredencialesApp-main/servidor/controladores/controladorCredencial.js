// servidor/controladores/controladorCredencial.js
const Credencial = require('../modelos/Credencial');
const fs = require('fs');
const path = require('path');

exports.crearCredencial = async (req, res) => {
  try {
    let datos = { ...req.body };
    
    // Si hay un archivo de foto
    if (req.file) {
      datos.foto = `/uploads/fotos/${req.file.filename}`;
    }
    
    const nuevaCredencial = await Credencial.create(datos);
    
    return res.status(201).json({
      mensaje: 'Credencial creada exitosamente',
      credencial: nuevaCredencial
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al crear la credencial' });
  }
};

exports.obtenerCredenciales = async (req, res) => {
  try {
    const credenciales = await Credencial.findAll();
    return res.status(200).json(credenciales);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al obtener credenciales' });
  }
};

exports.obtenerCredencial = async (req, res) => {
  try {
    const { id } = req.params;
    const credencial = await Credencial.findByPk(id);
    
    if (!credencial) {
      return res.status(404).json({ mensaje: 'Credencial no encontrada' });
    }
    
    return res.status(200).json(credencial);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al obtener la credencial' });
  }
};

exports.actualizarCredencial = async (req, res) => {
  try {
    const { id } = req.params;
    const credencial = await Credencial.findByPk(id);
    
    if (!credencial) {
      return res.status(404).json({ mensaje: 'Credencial no encontrada' });
    }
    
    const datosActualizados = { ...req.body };
    
    // Si hay un archivo de foto nuevo
    if (req.file) {
      // Si ya existía una foto, eliminarla
      if (credencial.foto) {
        const rutaFotoAnterior = path.join(__dirname, '..', '..', 'cliente', credencial.foto);
        if (fs.existsSync(rutaFotoAnterior)) {
          fs.unlinkSync(rutaFotoAnterior);
        }
      }
      datosActualizados.foto = `/uploads/fotos/${req.file.filename}`;
    }
    
    await credencial.update(datosActualizados);
    
    return res.status(200).json({
      mensaje: 'Credencial actualizada exitosamente',
      credencial: credencial
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al actualizar la credencial' });
  }
};

exports.eliminarCredencial = async (req, res) => {
  try {
    const { id } = req.params;
    const credencial = await Credencial.findByPk(id);
    
    if (!credencial) {
      return res.status(404).json({ mensaje: 'Credencial no encontrada' });
    }
    
    // Si hay una foto, eliminarla
    if (credencial.foto) {
      const rutaFoto = path.join(__dirname, '..', '..', 'cliente', credencial.foto);
      if (fs.existsSync(rutaFoto)) {
        fs.unlinkSync(rutaFoto);
      }
    }
    
    await credencial.destroy();
    return res.status(200).json({ mensaje: 'Credencial eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al eliminar la credencial' });
  }
};

exports.buscarCredenciales = async (req, res) => {
  try {
    const { termino } = req.query;
    
    if (!termino) {
      return res.status(400).json({ mensaje: 'Se requiere un término de búsqueda' });
    }
    
    const { Op } = require('sequelize');
    const credenciales = await Credencial.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${termino}%` } },
          { apellidos: { [Op.like]: `%${termino}%` } },
          { numero_nomina: { [Op.like]: `%${termino}%` } },
          { numero_seguridad_social: { [Op.like]: `%${termino}%` } },
          { rfc: { [Op.like]: `%${termino}%` } }
        ]
      }
    });
    
    return res.status(200).json(credenciales);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al buscar credenciales' });
  }
};