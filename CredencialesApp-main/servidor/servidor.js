// servidor/servidor.js
require('dotenv').config();
const app = require('./aplicacion');
const db = require('./modelos/indice');
const bcrypt = require('bcrypt');
const Operador = require('./modelos/Operador');

const PORT = process.env.PORT || 3000;

// Función para crear un administrador por defecto si no existe
const crearAdminPorDefecto = async () => {
  try {
    const adminCount = await Operador.count({ where: { rol: 'admin' } });
    
    if (adminCount === 0) {
      console.log('Creando usuario administrador por defecto...');
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      await Operador.create({
        usuario: 'admin',
        password: hashedPassword,
        rol: 'admin'
      });
      
      console.log('Usuario administrador creado: admin / admin123');
    }
  } catch (error) {
    console.error('Error al crear administrador por defecto:', error);
  }
};

// Iniciar el servidor
db.sequelize.sync()
  .then(async () => {
    console.log('Base de datos sincronizada');
    
    // Crear admin por defecto
    await crearAdminPorDefecto();
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error sincronizando la base de datos:', error);
  });