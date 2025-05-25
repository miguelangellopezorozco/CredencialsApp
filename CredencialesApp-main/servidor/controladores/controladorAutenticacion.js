// servidor/controladores/controladorAutenticacion.js
const Operador = require('../modelos/Operador');
const SesionOperador = require('../modelos/SesionOperador');
const bcrypt = require('bcrypt');

exports.iniciarSesion = async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const operador = await Operador.findOne({ where: { usuario } });
    if (!operador) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Usar bcrypt para comparar contraseñas
    const esPasswordValido = await bcrypt.compare(password, operador.password);
    if (!esPasswordValido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }
    
    // Crear registro de sesión
    const nuevaSesion = await SesionOperador.create({
      operador_id: operador.id,
      ip_address: req.ip
    });
    
    // Guardar datos en la sesión
    req.session.operadorId = operador.id;
    req.session.rol = operador.rol;
    req.session.sesionId = nuevaSesion.sesion_id;
    
    return res.json({ 
      mensaje: 'Inicio de sesión exitoso',
      operador: {
        id: operador.id,
        usuario: operador.usuario,
        rol: operador.rol
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

exports.cerrarSesion = async (req, res) => {
  try {
    // Registrar cierre de sesión si hay sesión activa
    if (req.session.sesionId) {
      await SesionOperador.update(
        { fecha_fin: new Date() },
        { where: { sesion_id: req.session.sesionId } }
      );
    }
    
    req.session.destroy();
    return res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
  }
};

exports.verificarSesion = async (req, res) => {
  if (req.session.operadorId) {
    const operador = await Operador.findByPk(req.session.operadorId);
    if (!operador) {
      req.session.destroy();
      return res.status(401).json({ autenticado: false });
    }
    
    return res.json({
      autenticado: true,
      operador: {
        id: operador.id,
        usuario: operador.usuario,
        rol: operador.rol
      }
    });
  } else {
    return res.status(401).json({ autenticado: false });
  }
};