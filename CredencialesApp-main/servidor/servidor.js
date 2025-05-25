// servidor/servidor.js
require('dotenv').config();
const app      = require('./aplicacion');
const db       = require('./modelos/indice');
const bcrypt   = require('bcrypt');
const Operador = require('./modelos/Operador');

const PORT        = process.env.PORT || 3000;
const ADMIN_ROLE  = 'admin';          // ← AJUSTE: rol como string

// -----------------------------------------------------------------------------
// Crea un usuario administrador por defecto si aún no existe
// -----------------------------------------------------------------------------
const crearAdminPorDefecto = async () => {
  try {
    // Buscamos cuántos admins hay con rol = 'admin'
    const adminCount = await Operador.count({ where: { rol: ADMIN_ROLE } });

    if (adminCount === 0) {
      console.log('Creando usuario administrador por defecto…');

      const saltRounds     = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);

      await Operador.create({
        usuario : 'admin',
        password: hashedPassword,
        rol     : ADMIN_ROLE          // ← se envía 'admin'
        // created_at y updated_at los rellena Sequelize (timestamps: true)
      });

      console.log('Usuario administrador creado: admin / admin123');
    }
  } catch (error) {
    console.error('Error al crear administrador por defecto:', error);
  }
};

// -----------------------------------------------------------------------------
// Sincroniza la BD e inicia el servidor
// -----------------------------------------------------------------------------
db.sequelize.sync()
  .then(async () => {
    console.log('Base de datos sincronizada');

    // Crea admin por defecto si hace falta
    await crearAdminPorDefecto();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error sincronizando la base de datos:', error);
  });
