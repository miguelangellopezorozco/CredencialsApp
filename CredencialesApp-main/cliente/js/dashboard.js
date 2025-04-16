// cliente/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  const menuOperadores = document.getElementById('menuOperadores');
  const cardOperadores = document.getElementById('cardOperadores');
  const btnLogout = document.getElementById('btnLogout');
  const nombreUsuario = document.getElementById('nombreUsuario');
  const totalCredenciales = document.getElementById('totalCredenciales');
  const totalPlantillas = document.getElementById('totalPlantillas');
  const totalOperadores = document.getElementById('totalOperadores');
  const actividadReciente = document.getElementById('actividadReciente');
  const btnRecentPDFs = document.getElementById('btnRecentPDFs');
  const pdfsList = document.getElementById('pdfsList');
  const recentPDFsModal = new bootstrap.Modal(document.getElementById('recentPDFsModal'));

  // Verificar sesión y obtener datos del usuario
  api.verificarSesion()
    .then(response => {
      if (response.autenticado) {
        // Mostrar nombre de usuario
        nombreUsuario.textContent = response.operador.usuario;
        
        // Si es admin, mostrar sección de operadores
        if (response.operador.rol === 'admin') {
          menuOperadores.style.display = 'block';
          cardOperadores.style.display = 'block';
        }
        
        // Cargar datos del dashboard
        cargarEstadisticas();
        cargarActividadReciente();
      }
    })
    .catch(error => {
      console.error('Error al verificar sesión:', error);
      window.location.href = '/index.html'; // Redirigir a login
    });

  // Cargar estadísticas
  async function cargarEstadisticas() {
    try {
      // Obtener total de credenciales
      const credenciales = await api.obtenerCredenciales();
      totalCredenciales.textContent = credenciales.length;
      
      // Obtener total de plantillas
      const plantillas = await api.obtenerPlantillas();
      totalPlantillas.textContent = plantillas.length;
      
      // Si es admin, obtener total de operadores
      if (cardOperadores.style.display !== 'none') {
        const operadores = await api.obtenerOperadores();
        totalOperadores.textContent = operadores.length;
      }
      
      // Obtener fecha de última impresión (simulado por ahora)
      const fechaActual = new Date();
      document.getElementById('ultimaImpresion').textContent = 
        fechaActual.toLocaleDateString('es-MX', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  // Cargar actividad reciente (simulada)
  function cargarActividadReciente() {
    // En una aplicación real, esto vendría de la API
    const actividades = [
      { fecha: new Date(), descripcion: 'Inicio de sesión', usuario: nombreUsuario.textContent },
      { fecha: new Date(Date.now() - 60000), descripcion: 'Impresión de credencial', usuario: nombreUsuario.textContent },
      { fecha: new Date(Date.now() - 120000), descripcion: 'Edición de plantilla', usuario: nombreUsuario.textContent },
      { fecha: new Date(Date.now() - 180000), descripcion: 'Creación de credencial', usuario: nombreUsuario.textContent },
      { fecha: new Date(Date.now() - 240000), descripcion: 'Actualización de datos', usuario: nombreUsuario.textContent }
    ];
    
    actividadReciente.innerHTML = '';
    
    actividades.forEach(actividad => {
      const tr = document.createElement('tr');
      
      const tdFecha = document.createElement('td');
      tdFecha.textContent = actividad.fecha.toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const tdDescripcion = document.createElement('td');
      tdDescripcion.textContent = actividad.descripcion;
      
      const tdUsuario = document.createElement('td');
      tdUsuario.textContent = actividad.usuario;
      
      tr.appendChild(tdFecha);
      tr.appendChild(tdDescripcion);
      tr.appendChild(tdUsuario);
      
      actividadReciente.appendChild(tr);
    });
  }

  // Mostrar PDFs recientes (simulado)
  btnRecentPDFs.addEventListener('click', () => {
    // En una aplicación real, esto vendría de la API
    const pdfs = [
      { nombre: 'Credencial_12345.pdf', fecha: new Date(), usuario: 'Juan Pérez' },
      { nombre: 'Credencial_67890.pdf', fecha: new Date(Date.now() - 86400000), usuario: 'María López' },
      { nombre: 'Credencial_11121.pdf', fecha: new Date(Date.now() - 172800000), usuario: 'Carlos Gómez' }
    ];
    
    pdfsList.innerHTML = '';
    
    pdfs.forEach(pdf => {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'list-group-item list-group-item-action';
      a.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1"><i class="bi bi-file-pdf text-danger me-2"></i>${pdf.nombre}</h5>
          <small>${pdf.fecha.toLocaleDateString()}</small>
        </div>
        <p class="mb-1">Usuario: ${pdf.usuario}</p>
        <small class="text-muted">Haga clic para descargar</small>
      `;
      
      pdfsList.appendChild(a);
    });
    
    recentPDFsModal.show();
  });

  // Cerrar sesión
  btnLogout.addEventListener('click', async () => {
    try {
      await api.logout();
      window.location.href = '/index.html';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Intente de nuevo.');
    }
  });
});
