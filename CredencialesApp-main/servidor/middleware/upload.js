// servidor/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que los directorios existan
const crearDirectorioSiNoExiste = (dir) => {
  const dirPath = path.join(__dirname, '..', '..', 'cliente', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// Configuración para almacenamiento de fotos
const storageFotos = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = crearDirectorioSiNoExiste('/uploads/fotos');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Genera un nombre único basado en timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'foto-' + uniqueSuffix + ext);
  }
});

// Configuración para almacenamiento de logos
const storageLogos = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = crearDirectorioSiNoExiste('/uploads/logos');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Filtro para validar tipos de archivos
const fileFilter = (req, file, cb) => {
  // Acepta sólo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sólo se permiten archivos de imagen'), false);
  }
};

// Configurar multer para fotos
exports.uploadFoto = multer({
  storage: storageFotos,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Configurar multer para logos
exports.uploadLogo = multer({
  storage: storageLogos,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  }
});

// Middleware para manejar errores de carga
exports.manejarErrorMulter = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      mensaje: `Error al subir archivo: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      mensaje: err.message
    });
  }
  next();
};