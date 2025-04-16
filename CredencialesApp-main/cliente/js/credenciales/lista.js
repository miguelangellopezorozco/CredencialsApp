
document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const btnLogout = document.getElementById('btnLogout');
  const nombreUsuario = document.getElementById('nombreUsuario');
  const menuOperadores = document.getElementById('menuOperadores');
  const searchCredencial = document.getElementById('searchCredencial');
  const btnSearch = document.getElementById('btnSearch');
  const credencialesTableBody = document.getElementById('credencialesTableBody');
  const paginacion = document.getElementById('paginacion');
  
  // Modal de eliminación
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  const deleteUserName = document.getElementById('deleteUserName');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  
  // Modal de impresión
  const printModal = new bootstrap.Modal(document.getElementById('printModal'));
  const selectTemplatePrint = document.getElementById('selectTemplatePrint');
  const btnDirectPrint = document.getElementById('btnDirectPrint');
  const btnGeneratePDF = document.getElementById('btnGeneratePDF');
  
  // Variables de estado
  let currentPage = 1;
  let pageSize = 10;
  let totalPages = 1;
  let credenciales = [];
  let currentCredencialId = null;
  let plantillas = [];
  
  // Inicializar
  verificarSesion();
  cargarCredenciales();
  cargarPlantillas();
  
  // ----- Funciones -----
  
  // Verificar sesión de usuario
  async function verificarSesion() {
    try {
      const response = await api.verificarSesion();
      if (response.autenticado) {
        nombreUsuario.textContent = response.operador.usuario;
        
        // Si es admin, mostrar sección de operadores
        if (response.operador.rol === 'admin') {
          menuOperadores.style.display = 'block';
        }
      } else {
        window.location.href = '/index.html';
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      window.location.href = '/index.html';
    }
  }
  
  // Cargar credenciales
  async function cargarCredenciales(termino = '') {
    try {
      let data;
      
      if (termino) {
        data = await api.buscarCredenciales(termino);
      } else {
        data = await api.obtenerCredenciales();
      }
      
      credenciales = data;
      
      // Calcular paginación
      totalPages = Math.ceil(credenciales.length / pageSize);
      
      // Mostrar datos
      mostrarCredenciales();
      actualizarPaginacion();
      
    } catch (error) {
      console.error('Error al cargar credenciales:', error);
      credencialesTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-4"></i>
            <p class="mt-2">Error al cargar credenciales. Intente de nuevo.</p>
          </td>
        </tr>
      `;
    }
  }
  
  // Mostrar credenciales en la tabla
  function mostrarCredenciales() {
    // Calcular índices para paginación
    const inicio = (currentPage - 1) * pageSize;
    const fin = Math.min(inicio + pageSize, credenciales.length);
    
    // Si no hay credenciales
    if (credenciales.length === 0) {
      credencialesTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <i class="bi bi-info-circle fs-4"></i>
            <p class="mt-2">No se encontraron credenciales.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    // Limpiar tabla
    credencialesTableBody.innerHTML = '';
    
    // Agregar filas
    for (let i = inicio; i < fin; i++) {
      const credencial = credenciales[i];
      
      const tr = document.createElement('tr');
      tr.className = 'align-middle';
      
      // Formatear fila
      tr.innerHTML = `
        <td>${credencial.id}</td>
        <td>
          ${credencial.foto 
            ? `<img src="${credencial.foto}" alt="Foto" class="rounded" style="height: 40px; width: 40px; object-fit: cover;">` 
            : `<div class="bg-secondary text-white rounded d-flex align-items-center justify-content-center" style="height: 40px; width: 40px;">
                <i class="bi bi-person"></i>
               </div>`
          }
        </td>
        <td>${credencial.nombre} ${credencial.apellidos}</td>
        <td>${credencial.numero_nomina}</td>
        <td>${credencial.numero_seguridad_social}</td>
        <td>${credencial.rfc}</td>
        <td class="text-center">
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-primary" data-id="${credencial.id}" data-action="print">
              <i class="bi bi-printer"></i>
            </button>
            <a href="editor.html?id=${credencial.id}" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-pencil"></i>
            </a>
            <a href="crear.html?id=${credencial.id}" class="btn btn-sm btn-outline-info">
              <i class="bi bi-eye"></i>
            </a>
            <button type="button" class="btn btn-sm btn-outline-danger" data-id="${credencial.id}" data-action="delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      credencialesTableBody.appendChild(tr);
    }
    
    // Agregar event listeners para botones de acción
    const actionButtons = credencialesTableBody.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
      button.addEventListener('click', handleActionClick);
    });
  }
  
  // Actualizar paginación
  function actualizarPaginacion() {
    // No mostrar paginación si hay una sola página
    if (totalPages <= 1) {
      paginacion.innerHTML = '';
      return;
    }
    
    let html = `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Anterior">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;
    
    // Mostrar máximo 5 páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(startPage + 4, totalPages);
    
    for (let i = startPage; i <= endPage; i++) {
      html += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }
    
    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Siguiente">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;
    
    paginacion.innerHTML = html;
    
    // Agregar event listeners para paginación
    const pageLinks = paginacion.querySelectorAll('[data-page]');
    pageLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.currentTarget.getAttribute('data-page'));
        cambiarPagina(page);
      });
    });
  }
  
  // Cambiar de página
  function cambiarPagina(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    mostrarCredenciales();
    actualizarPaginacion();
    
    // Scroll al inicio de la tabla
    const tableTop = document.querySelector('table').offsetTop;
    window.scrollTo({ top: tableTop - 100, behavior: 'smooth' });
  }
  
  // Cargar plantillas para el modal de impresión
  async function cargarPlantillas() {
    try {
      const data = await api.obtenerPlantillas();
      plantillas = data;
      
      // Limpiar selector
      selectTemplatePrint.innerHTML = '<option value="" selected disabled>Seleccione una plantilla</option>';
      
      // Agregar opciones
      plantillas.forEach(plantilla => {
        const option = document.createElement('option');
        option.value = plantilla.template_id;
        option.textContent = plantilla.nombre_plantilla;
        selectTemplatePrint.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  }
  
  // Manejar clic en botones de acción
  function handleActionClick(e) {
    const button = e.currentTarget;
    const id = button.getAttribute('data-id');
    const action = button.getAttribute('data-action');
    
    // Buscar credencial
    const credencial = credenciales.find(c => c.id.toString() === id);
    if (!credencial) return;
    
    // Ejecutar acción
    switch (action) {
      case 'delete':
        // Mostrar modal de confirmación
        deleteUserName.textContent = `${credencial.nombre} ${credencial.apellidos}`;
        currentCredencialId = credencial.id;
        deleteModal.show();
        break;
      
      case 'print':
        // Mostrar modal de impresión
        currentCredencialId = credencial.id;
        printModal.show();
        break;
    }
  }
  
  // ----- Event Listeners -----
  
  // Búsqueda
  btnSearch.addEventListener('click', () => {
    const termino = searchCredencial.value.trim();
    if (termino) {
      cargarCredenciales(termino);
    } else {
      cargarCredenciales();
    }
  });
  
  // Enter en búsqueda
  searchCredencial.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnSearch.click();
    }
  });
  
  // Confirmar eliminación
  btnConfirmDelete.addEventListener('click', async () => {
    if (!currentCredencialId) return;
    
    try {
      await api.eliminarCredencial(currentCredencialId);
      
      // Cerrar modal
      deleteModal.hide();
      
      // Recargar datos
      cargarCredenciales();
      
      // Mostrar mensaje de éxito
      alert('Credencial eliminada exitosamente');
      
    } catch (error) {
      console.error('Error al eliminar credencial:', error);
      alert('Error al eliminar credencial. Intente de nuevo.');
    }
  });
  
  // Imprimir directamente
  btnDirectPrint.addEventListener('click', () => {
    const templateId = selectTemplatePrint.value;
    
    if (!templateId) {
      alert('Por favor, seleccione una plantilla');
      return;
    }
    
    // Imprimir con la plantilla seleccionada
    api.generarPDFCredencial(currentCredencialId, templateId);
    
    // Cerrar modal
    printModal.hide();
  });
  
  // Generar PDF
  btnGeneratePDF.addEventListener('click', async () => {
    const templateId = selectTemplatePrint.value;
    
    if (!templateId) {
      alert('Por favor, seleccione una plantilla');
      return;
    }
    
    try {
      // Generar PDF y obtener URL
      const response = await api.guardarPDFCredencial(currentCredencialId, templateId);
      
      // Abrir PDF en nueva pestaña
      window.open(response.pdfUrl, '_blank');
      
      // Cerrar modal
      printModal.hide();
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar PDF. Intente de nuevo.');
    }
  });
  
  // Logout
  btnLogout.addEventListener('click', async () => {
    try {
      await api.logout();
      window.location.href = '/index.html';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  });
});