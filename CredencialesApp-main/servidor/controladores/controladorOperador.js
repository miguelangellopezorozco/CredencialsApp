
// servidor/controladores/controladorOperador.js
const Operador = require('../modelos/Operador');
const bcrypt = require('bcrypt');

exports.crearOperador = async (req, res) => {
  try {
    const { usuario, password, rol } = req.body;

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const nuevoOperador = await Operador.create({
      usuario,
      password: hashedPassword,
      rol
    });

    // No devolver la contraseña en la respuesta
    const { password: _, ...operadorSinPassword } = nuevoOperador.toJSON();

    return res.status(201).json({
      mensaje: 'Operador creado exitosamente',
      operador: operadorSinPassword
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya existe' });
    }
    return res.status(500).json({ mensaje: 'Error al crear operador' });
  }
};

exports.obtenerOperadores = async (req, res) => {
  try {
    const operadores = await Operador.findAll({
      attributes: { exclude: ['password'] } // No devolver contraseñas
    });
    return res.status(200).json(operadores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al obtener operadores' });
  }
};

exports.obtenerOperador = async (req, res) => {
  try {
    const { id } = req.params;
    const operador = await Operador.findByPk(id, {
      attributes: { exclude: ['password'] } // No devolver la contraseña
    });
    
    if (!operador) {
      return res.status(404).json({ mensaje: 'Operador no encontrado' });
    }
    
    return res.status(200).json(operador);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al obtener el operador' });
  }
};

exports.actualizarOperador = async (req, res) => {
  try {
    const { id } = req.params;
    const operador = await Operador.findByPk(id);
    
    if (!operador) {
      return res.status(404).json({ mensaje: 'Operador no encontrado' });
    }
    
    const datosActualizados = { ...req.body };
    
    // Si se está actualizando la contraseña, encriptarla
    if (datosActualizados.password) {
      const saltRounds = 10;
      datosActualizados.password = await bcrypt.hash(datosActualizados.password, saltRounds);
    }
    
    await operador.update(datosActualizados);
    
    // No devolver la contraseña en la respuesta
    const { password, ...operadorSinPassword } = operador.toJSON();
    
    return res.status(200).json({
      mensaje: 'Operador actualizado exitosamente',
      operador: operadorSinPassword
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al actualizar operador' });
  }
};

exports.eliminarOperador = async (req, res) => {
  try {
    const { id } = req.params;
    const operador = await Operador.findByPk(id);
    
    if (!operador) {
      return res.status(404).json({ mensaje: 'Operador no encontrado' });
    }
    
    await operador.destroy();
    return res.status(200).json({ mensaje: 'Operador eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al eliminar operador' });
  }
};