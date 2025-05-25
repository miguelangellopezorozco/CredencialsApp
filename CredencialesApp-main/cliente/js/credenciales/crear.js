document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const credencialForm = document.getElementById('credencialForm');
  const formTitle = document.getElementById('formTitle');
  const btnLogout = document.getElementById('btnLogout');
  const nombreUsuario = document.getElementById('nombreUsuario');
  const fotoUpload = document.getElementById('fotoUpload');
  const btnUploadFoto = document.getElementById('btnUploadFoto');
  const previewFoto = document.getElementById('previewFoto');
  const btnImprimir = document.getElementById('btnImprimir');
  const btnSubmit = document.getElementById('btnSubmit');
  const selectTemplatePrint = document.getElementById('selectTemplatePrint');
  const btnDirectPrint = document.getElementById('btnDirectPrint');
  const btnGeneratePDF = document.getElementById('btnGeneratePDF');
  
  // Modal de impresión
  const printModal = new bootstrap.Modal(document.getElementById('printModal'));
  
  // Variables de estado
  let editMode = false;
  let credencialId = null;
  let fotoFile = null;
  let plantillas = [];
  
  // Inicializar
  init();
  
  // ----- Funciones -----
  
  // Inicialización
  async function init() {
    // Verificar sesión
    await verificarSesion();
    
    // Verificar si estamos en modo edición
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
      editMode = true;
      credencialId = id;
      formTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Editar Credencial';
      
      // Cargar datos de la credencial
      await cargarCredencial(id);
      
      // Habilitar botón de impresión
      btnImprimir.disabled = false;
    }
    
    // Cargar plantillas
    await cargarPlantillas();
  }
  
  // Verificar sesión de usuario
  async function verificarSesion() {
    try {
      const response = await api.verificarSesion();
      if (response.autenticado) {
        nombreUsuario.textContent = response.operador.usuario;
      } else {
        window.location.href = '/index.html';
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      window.location.href = '/index.html';
    }
  }
  
  // Cargar datos de credencial para edición
  async function cargarCredencial(id) {
    try {
      const credencial = await api.obtenerCredencial(id);
      
      // Llenar formulario
      document.getElementById('nombre').value = credencial.nombre || '';
      document.getElementById('apellidos').value = credencial.apellidos || '';
      document.getElementById('numero_seguridad_social').value = credencial.numero_seguridad_social || '';
      document.getElementById('numero_nomina').value = credencial.numero_nomina || '';
      document.getElementById('rfc').value = credencial.rfc || '';
      
      // Mostrar foto si existe
      if (credencial.foto) {
        previewFoto.src = credencial.foto;
      }
      
    } catch (error) {
      console.error('Error al cargar credencial:', error);
      alert('Error al cargar los datos de la credencial. Intente de nuevo.');
    }
  }
  
  // Cargar plantillas disponibles
  async function cargarPlantillas() {
    try {
      const data = await api.obtenerPlantillas();
      plantillas = data;
      
      // Llenar selector para impresión
      selectTemplatePrint.innerHTML = '<option value="" selected disabled>Seleccione una plantilla</option>';
      
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
  
  // Guardar credencial
  async function guardarCredencial() {
    // Validar formulario
    if (!credencialForm.checkValidity()) {
      credencialForm.classList.add('was-validated');
      return false;
    }
    
    // Obtener datos del formulario
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellidos', document.getElementById('apellidos').value);
    formData.append('numero_seguridad_social', document.getElementById('numero_seguridad_social').value);
    formData.append('numero_nomina', document.getElementById('numero_nomina').value);
    formData.append('rfc', document.getElementById('rfc').value);
    
    // Añadir foto si se ha seleccionado una nueva
    if (fotoFile) {
      formData.append('foto', fotoFile);
    }
    
    try {
      // Cambiar estado del botón a cargando
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
      
      let response;
      
      if (editMode) {
        // Actualizar credencial existente
        response = await api.actualizarCredencial(credencialId, formData);
      } else {
        // Crear nueva credencial
        response = await api.crearCredencial(formData);
      }
      
      // Mostrar mensaje de éxito
      alert(editMode ? 'Credencial actualizada exitosamente' : 'Credencial creada exitosamente');
      
      // Redirigir a la lista o habilitar modo edición si era nueva
      if (!editMode) {
        credencialId = response.credencial.id;
        editMode = true;
        formTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Editar Credencial';
        
        // Habilitar botón de impresión
        btnImprimir.disabled = false;
        
        // Actualizar URL sin recargar la página
        const newUrl = `${window.location.pathname}?id=${credencialId}`;
        window.history.pushState({ id: credencialId }, '', newUrl);
      }
      
      return true;
    } catch (error) {
      console.error('Error al guardar credencial:', error);
      alert('Error al guardar la credencial. Intente de nuevo.');
      return false;
    } finally {
      // Restaurar estado del botón
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="bi bi-save me-1"></i> Guardar';
    }
  }
  
  // ----- Event Listeners -----
  
  // Enviar formulario
  credencialForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarCredencial();
  });
  
  // Subir foto
  btnUploadFoto.addEventListener('click', () => {
    fotoUpload.click();
  });
  
  // Previsualizar foto seleccionada
  fotoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Guardar para subir después
      fotoFile = file;
      
      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        previewFoto.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Botón de impresión
  btnImprimir.addEventListener('click', () => {
    if (!editMode || !credencialId) {
      alert('Primero debe guardar la credencial');
      return;
    }
    
    // Mostrar modal de impresión
    printModal.show();
  });
  
  // Imprimir directamente
  btnDirectPrint.addEventListener('click', async () => {
    const templateId = selectTemplatePrint.value;
    
    if (!templateId) {
      alert('Por favor, seleccione una plantilla');
      return;
    }
    
    if (!credencialId) {
      alert('No hay una credencial seleccionada');
      return;
    }
    
    try {
      // Cambiar estado del botón
      btnDirectPrint.disabled = true;
      btnDirectPrint.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Generando PDF...';
      
      // Generar PDF con la plantilla seleccionada
      await api.generarPDFCredencial(credencialId, templateId);
      
      // Cerrar modal
      printModal.hide();
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar PDF. Intente de nuevo.');
    } finally {
      // Restaurar estado del botón
      btnDirectPrint.disabled = false;
      btnDirectPrint.innerHTML = '<i class="bi bi-printer me-1"></i> Imprimir Ahora';
    }
  });
  
  // Generar PDF
  btnGeneratePDF.addEventListener('click', async () => {
    const templateId = selectTemplatePrint.value;
    
    if (!templateId) {
      alert('Por favor, seleccione una plantilla');
      return;
    }
    
    if (!credencialId) {
      alert('No hay una credencial seleccionada');
      return;
    }
    
    try {
      // Generar PDF y obtener URL
      const response = await api.guardarPDFCredencial(credencialId, templateId);
      
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
  
  // Validación personalizada en tiempo real
  const inputs = credencialForm.querySelectorAll('input[required]');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
      } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
      }
    });
  });
});