// servidor/middleware/auth.js
const Operador = require('../modelos/Operador');

// Middleware para verificar si el usuario está autenticado
exports.estaAutenticado = (req, res, next) => {
  if (!req.session.operadorId) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Por favor inicie sesión.' });
  }
  next();
};

// Middleware para verificar si el usuario es administrador
exports.esAdmin = (req, res, next) => {
  if (!req.session.operadorId) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Por favor inicie sesión.' });
  }
  
  if (req.session.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren privilegios de administrador.' });
  }
  
  next();
};

// Middleware para obtener el operador actual
exports.obtenerOperadorActual = async (req, res, next) => {
  if (!req.session.operadorId) {
    req.operadorActual = null;
    return next();
  }
  
  try {
    const operador = await Operador.findByPk(req.session.operadorId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!operador) {
      req.session.destroy();
      req.operadorActual = null;
    } else {
      req.operadorActual = operador;
    }
    
    next();
  } catch (error) {
    console.error('Error al obtener operador actual:', error);
    req.operadorActual = null;
    next();
  }
};
