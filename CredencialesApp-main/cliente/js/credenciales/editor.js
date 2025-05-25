// cliente/js/credenciales/editor.js
document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const btnLogout = document.getElementById('btnLogout');
  const nombreUsuario = document.getElementById('nombreUsuario');
  const frontEditor = document.getElementById('frontEditor');
  const backEditor = document.getElementById('backEditor');
  const searchUser = document.getElementById('searchUser');
  const btnSearch = document.getElementById('btnSearch');
  const selectUser = document.getElementById('selectUser');
  const selectTemplate = document.getElementById('selectTemplate');
  const btnApplyTemplate = document.getElementById('btnApplyTemplate');
  const btnAddText = document.getElementById('btnAddText');
  const btnAddImage = document.getElementById('btnAddImage');
  const btnAddRect = document.getElementById('btnAddRect');
  const btnDelete = document.getElementById('btnDelete');
  const btnSave = document.getElementById('btnSave');
  const btnPrint = document.getElementById('btnPrint');
  const btnPDF = document.getElementById('btnPDF');
  const btnApplyProperties = document.getElementById('btnApplyProperties');
  
  // Modal de texto
  const textEditModal = new bootstrap.Modal(document.getElementById('textEditModal'));
  const modalPropText = document.getElementById('modalPropText');
  const btnSaveText = document.getElementById('btnSaveText');
  
  // Modal de PDF
  const pdfPreviewModal = new bootstrap.Modal(document.getElementById('pdfPreviewModal'));
  const pdfPreviewFrame = document.getElementById('pdfPreviewFrame');
  const btnDownloadPDF = document.getElementById('btnDownloadPDF');
  const btnDirectPrint = document.getElementById('btnDirectPrint');
  
  // Propiedades
  const propertiesPanel = document.getElementById('propertiesPanel');
  const textProperties = document.getElementById('textProperties');
  const rectProperties = document.getElementById('rectProperties');
  const imageProperties = document.getElementById('imageProperties');
  const lineProperties = document.getElementById('lineProperties');
  const propX = document.getElementById('propX');
  const propY = document.getElementById('propY');
  const propWidth = document.getElementById('propWidth');
  const propHeight = document.getElementById('propHeight');
  const propText = document.getElementById('propText');
  const propFontSize = document.getElementById('propFontSize');
  const propFontFamily = document.getElementById('propFontFamily');
  const propTextColor = document.getElementById('propTextColor');
  const propBold = document.getElementById('propBold');
  const propFillColor = document.getElementById('propFillColor');
  const propBorderColor = document.getElementById('propBorderColor');
  const propBorderWidth = document.getElementById('propBorderWidth');
  const propImageUpload = document.getElementById('propImageUpload');
  const btnAddLine = document.getElementById('btnAddLine');
  const propLineColor = document.getElementById('propLineColor');
  const propLineWidth = document.getElementById('propLineWidth');
  const btnToggleLineOrientation = document.getElementById('btnToggleLineOrientation');
  
  // Variables de estado
  let currentUser = null;
  let currentTemplate = null;
  let frontDragDrop = null;
  let backDragDrop = null;
  let isEditing = false;
  let activeEditor = 'front'; // 'front' o 'back'
  
  // after variable list add placeholder vars
  const placeholderModal = new bootstrap.Modal(document.getElementById('placeholderModal'));
  const placeholderButtons = document.querySelectorAll('[data-field]');
  const propPlaceholderField = document.getElementById('propPlaceholderField');
  const propPlaceholderSize = document.getElementById('propPlaceholderSize');
  const propPlaceholderFamily = document.getElementById('propPlaceholderFamily');
  const propPlaceholderColor = document.getElementById('propPlaceholderColor');
  const btnAddPlaceholder = document.getElementById('btnAddPlaceholder');
  
  // Inicializar arrastrar y soltar para ambos lados de la credencial
  initDragDrop();
  
  // Verificar sesión
  verificarSesion();
  
  // Cargar datos iniciales
  cargarPlantillas();
  cargarUsuarios();
  
  // Mejorar el DragAndDrop para añadir previsualización durante el movimiento
  enhanceDragAndDrop();
  
  // ----- Funciones de inicialización -----

  // Modificar el DragAndDrop para añadir previsualización durante el movimiento
  function enhanceDragAndDrop() {
    // Extender la funcionalidad del método handleMouseMove
    const originalMouseMove = DragAndDrop.prototype.handleMouseMove;
    
    DragAndDrop.prototype.handleMouseMove = function(e) {
      // Añadir clase de previsualización al inicio del movimiento
      if (this.isDragging && this.selected && !this.selected.classList.contains('dragging-preview')) {
        this.selected.classList.add('dragging-preview');
      }
      
      // Llamar al método original
      originalMouseMove.call(this, e);
    };
    
    // Extender la funcionalidad del método handleMouseUp
    const originalMouseUp = DragAndDrop.prototype.handleMouseUp;
    
    DragAndDrop.prototype.handleMouseUp = function(e) {
      // Remover clase de previsualización
      if (this.selected) {
        this.selected.classList.remove('dragging-preview');
      }
      
      // Llamar al método original
      originalMouseUp.call(this, e);
    };

    mejorarSeleccionLinea();
  }
  

  // Mejorar la visualización de la selección para líneas
function mejorarSeleccionLinea() {
  // Extender la funcionalidad del método selectElement
  const originalSelectElement = DragAndDrop.prototype.selectElement;
  
  DragAndDrop.prototype.selectElement = function(element) {
    // Llamar al método original
    originalSelectElement.call(this, element);
    
    // Si es una línea, asegurar que tenga la clase element-selected
    if (element && element.getAttribute('data-type') === 'linea') {
      element.classList.add('element-selected');
    }
  };
  
  // Extender la funcionalidad del método clearSelection
  const originalClearSelection = DragAndDrop.prototype.clearSelection;
  
  DragAndDrop.prototype.clearSelection = function() {
    // Si hay un elemento seleccionado y es línea, quitar la clase
    if (this.selected && this.selected.getAttribute('data-type') === 'linea') {
      this.selected.classList.remove('element-selected');
    }
    
    // Llamar al método original
    originalClearSelection.call(this);
  };
}
  // Inicializar funcionalidad de drag and drop
  function initDragDrop() {
    // Inicializar para el frente
    frontDragDrop = new DragAndDrop(frontEditor, {
      draggableSelector: '.draggable',
      onSelect: handleElementSelect,
      onDragEnd: handleElementMove,
      onResize: handleElementResize,
      preventOutside: true
    });
    
    // Inicializar para el reverso
    backDragDrop = new DragAndDrop(backEditor, {
      draggableSelector: '.draggable',
      onSelect: handleElementSelect,
      onDragEnd: handleElementMove,
      onResize: handleElementResize,
      preventOutside: true
    });
    
    // Establecer el editor activo por defecto
    setActiveEditor('front');
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
  
  // Cargar plantillas disponibles
  async function cargarPlantillas() {
    try {
      const plantillas = await api.obtenerPlantillas();
      
      // Limpiar selector
      selectTemplate.innerHTML = '<option value="" selected disabled>Seleccione una plantilla</option>';
      
      // Agregar opciones
      plantillas.forEach(plantilla => {
        const option = document.createElement('option');
        option.value = plantilla.template_id;
        option.textContent = plantilla.nombre_plantilla;
        selectTemplate.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      alert('No se pudieron cargar las plantillas. Intente de nuevo.');
    }
  }
  
  // Cargar usuarios para el selector
  async function cargarUsuarios() {
    try {
      const credenciales = await api.obtenerCredenciales();
      
      // Limpiar selector
      selectUser.innerHTML = '<option value="" selected disabled>Seleccione un usuario</option>';
      
      // Agregar opciones
      credenciales.forEach(credencial => {
        const option = document.createElement('option');
        option.value = credencial.id;
        option.textContent = `${credencial.nombre} ${credencial.apellidos} - ${credencial.numero_nomina}`;
        selectUser.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('No se pudieron cargar los usuarios. Intente de nuevo.');
    }
  }
  
  // ----- Funciones de manipulación de elementos -----
  
  // Establecer el editor activo (frente o reverso)
  function setActiveEditor(editor) {
    activeEditor = editor;
    
    // Desactivar elementos seleccionados en ambos editores
    const elements = document.querySelectorAll('.element-selected');
    elements.forEach(element => {
      element.classList.remove('element-selected');
    });
    
    // Ocultar panel de propiedades
    ocultarPanelesPropiedad();
  }
  
  // Función para agregar una línea
// Función para agregar una línea
function agregarElementoLinea() {
  const editor = activeEditor === 'front' ? frontEditor : backEditor;
  const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
  
  // Crear elemento de línea
  const element = document.createElement('div');
  element.className = 'draggable element-line horizontal';
  element.setAttribute('data-type', 'linea');
  
  // Posición y dimensiones iniciales
  element.style.left = '50px';
  element.style.top = '50px';
  element.style.width = '100px';
  element.style.height = '2px';
  
  // Establecer estilos de línea de manera explícita
  element.style.borderTopWidth = '2px';
  element.style.borderTopStyle = 'solid';
  element.style.borderTopColor = '#000000';
  
  // Añadir al editor con dragDrop
  dragDrop.addElement(element, 50, 50);
  
  // Seleccionar nuevo elemento
  dragDrop.selectElement(element);
}
  
  // Manejar el cambio de orientación de la línea
  function cambiarOrientacionLinea() {
    const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
    const element = dragDrop.selected;
    
    if (!element || element.getAttribute('data-type') !== 'linea') return;
    
    if (element.classList.contains('horizontal')) {
      // Cambiar a vertical
      element.classList.remove('horizontal');
      element.classList.add('vertical');
      
      // Intercambiar ancho y alto
      const width = parseInt(element.style.width);
      element.style.height = width + 'px';
      element.style.width = '2px';
      element.style.borderTop = 'none';
      element.style.borderLeft = element.style.borderTopWidth + ' ' + element.style.borderTopStyle + ' ' + element.style.borderTopColor;
    } else {
      // Cambiar a horizontal
      element.classList.remove('vertical');
      element.classList.add('horizontal');
      
      // Intercambiar ancho y alto
      const height = parseInt(element.style.height);
      element.style.width = height + 'px';
      element.style.height = '2px';
      element.style.borderLeft = 'none';
      element.style.borderTop = element.style.borderLeftWidth + ' ' + element.style.borderLeftStyle + ' ' + element.style.borderLeftColor;
    }
    
    // Actualizar panel de propiedades
    actualizarPanelPropiedades(element);
  }
  
  // Agregar un elemento de texto
  function agregarElementoTexto() {
    const editor = activeEditor === 'front' ? frontEditor : backEditor;
    const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
    
    // Crear elemento
    const element = document.createElement('div');
    element.className = 'draggable element-text';
    element.setAttribute('data-type', 'texto');
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '14px';
    element.style.color = '#000000';
    element.style.textAlign = 'left';
    element.textContent = 'Texto editable';
    
    // Añadir al editor con dragDrop
    dragDrop.addElement(element, 50, 50);
    
    // Seleccionar nuevo elemento
    dragDrop.selectElement(element);
    
    // Mostrar modal para editar
    modalPropText.value = element.textContent;
    textEditModal.show();
  }
  
  // Agregar un elemento de imagen
  function agregarElementoImagen() {
    // Mostrar diálogo para seleccionar archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target.result;
          
          const editor = activeEditor === 'front' ? frontEditor : backEditor;
          const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
          
          // Crear elemento
          const element = document.createElement('div');
          element.className = 'draggable element-image';
          element.setAttribute('data-type', 'imagen');
          
          // Crear y añadir imagen
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = 'Imagen';
          element.appendChild(img);
          
          // Añadir al editor con dragDrop
          dragDrop.addElement(element, 50, 50);
          
          // Seleccionar nuevo elemento
          dragDrop.selectElement(element);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }
  
  // Agregar un elemento de rectángulo
  function agregarElementoRectangulo() {
    const editor = activeEditor === 'front' ? frontEditor : backEditor;
    const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
    
    // Crear elemento
    const element = document.createElement('div');
    element.className = 'draggable element-rect';
    element.setAttribute('data-type', 'rectangulo');
    element.style.backgroundColor = 'rgba(200, 200, 200, 0.5)';
    element.style.borderColor = '#aaaaaa';
    element.style.borderWidth = '1px';
    element.style.borderStyle = 'solid';
    element.style.width = '100px';
    element.style.height = '50px';
    
    // Añadir al editor con dragDrop
    dragDrop.addElement(element, 50, 50);
    
    // Seleccionar nuevo elemento
    dragDrop.selectElement(element);
  }
  
  // Manejar la selección de un elemento
  function handleElementSelect(element, event) {
    // Actualizar el panel de propiedades
    actualizarPanelPropiedades(element);
  }
  
  // Manejar el movimiento de un elemento
  function handleElementMove(element) {
    // Snap a 5px
    const snap = 5;
    let left = parseInt(element.style.left) || 0;
    let top = parseInt(element.style.top) || 0;

    left = Math.round(left / snap) * snap;
    top = Math.round(top / snap) * snap;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;

    // Actualizar propiedades de posición
    actualizarPropsPos(element);
  }
  
  // Manejar redimensionamiento para ajustar font-size e imágenes
  function handleElementResize(element) {
    // Ajustar imagen interna
    if (element.getAttribute('data-type') === 'imagen') {
      const img = element.querySelector('img');
      if (img) {
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
      }
    }

    // Ajustar tamaño de fuente en texto
    if (element.getAttribute('data-type') === 'texto') {
      const newHeight = element.offsetHeight;
      const newFontSize = Math.max(8, Math.round(newHeight * 0.7));
      element.style.fontSize = `${newFontSize}px`;
      propFontSize.value = newFontSize;
    }

    // Ajustar grosor de línea
    if (element.getAttribute('data-type') === 'linea') {
      if (element.classList.contains('horizontal')) {
        const thickness = element.offsetHeight;
        element.style.borderTopWidth = `${thickness}px`;
        propLineWidth.value = thickness;
      } else {
        const thickness = element.offsetWidth;
        element.style.borderLeftWidth = `${thickness}px`;
        propLineWidth.value = thickness;
      }
    }

    // Actualizar propiedades panel
    actualizarPropsPos(element);

    // modify handleElementResize font-size placeholder
    if (element.getAttribute('data-type') === 'placeholder') {
      const h = element.offsetHeight;
      const size = Math.max(8, Math.round(h*0.7));
      element.style.fontSize = `${size}px`;
      propPlaceholderSize.value = size;
    }
  }
  
  // Eliminar el elemento seleccionado
  function eliminarElementoSeleccionado() {
    const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
    
    if (dragDrop.selected) {
      dragDrop.removeSelected();
      ocultarPanelesPropiedad();
    }
  }
  
  // ----- Funciones de panel de propiedades -----
  
  // Ocultar todos los paneles de propiedades específicas
  function ocultarPanelesPropiedad() {
    textProperties.style.display = 'none';
    rectProperties.style.display = 'none';
    imageProperties.style.display = 'none';
    lineProperties.style.display = 'none';
  }
  
  // Actualizar panel de propiedades según elemento seleccionado
  function actualizarPanelPropiedades(element) {
    if (!element) return;
    
    // Ocultar todos los paneles específicos
    ocultarPanelesPropiedad();
    
    // Obtener tipo y posición
    const tipo = element.getAttribute('data-type');
    const rect = element.getBoundingClientRect();
    const editorRect = (activeEditor === 'front' ? frontEditor : backEditor).getBoundingClientRect();
    
    // Posición relativa al editor
    const left = parseInt(element.style.left) || 0;
    const top = parseInt(element.style.top) || 0;
    
    // Actualizar campos comunes
    propX.value = left;
    propY.value = top;
    propWidth.value = rect.width;
    propHeight.value = rect.height;
    
    // Actualizar campos específicos según tipo
    switch (tipo) {
      case 'texto':
        textProperties.style.display = 'block';
        propText.value = element.textContent;
        propFontSize.value = parseInt(element.style.fontSize);
        propFontFamily.value = element.style.fontFamily;
        propTextColor.value = rgbToHex(element.style.color);
        propBold.checked = element.style.fontWeight === 'bold';
        
        // Establecer alineación de texto
        const align = element.style.textAlign || 'left';
        document.getElementById(`align${capitalize(align)}`).checked = true;
        break;
      
      case 'rectangulo':
        rectProperties.style.display = 'block';
        propFillColor.value = rgbToHex(element.style.backgroundColor);
        propBorderColor.value = rgbToHex(element.style.borderColor);
        propBorderWidth.value = parseInt(element.style.borderWidth);
        break;
      
      case 'imagen':
        imageProperties.style.display = 'block';
        break;
        
      case 'linea':
        lineProperties.style.display = 'block';
        
        // Determinar color de la línea
        const colorLinea = element.classList.contains('horizontal') 
          ? element.style.borderTopColor 
          : element.style.borderLeftColor;
        propLineColor.value = rgbToHex(colorLinea);
        
        // Determinar grosor de la línea
        const grosorLinea = element.classList.contains('horizontal') 
          ? parseInt(element.style.borderTopWidth) 
          : parseInt(element.style.borderLeftWidth);
        propLineWidth.value = grosorLinea || 2;
        
        // Determinar estilo de línea
        const estiloLinea = element.classList.contains('horizontal') 
          ? element.style.borderTopStyle 
          : element.style.borderLeftStyle;
        
        document.getElementById('lineSolid').checked = estiloLinea === 'solid';
        document.getElementById('lineDashed').checked = estiloLinea === 'dashed';
        document.getElementById('lineDotted').checked = estiloLinea === 'dotted';
        break;

      case 'placeholder':
        placeholderProperties.style.display = 'block';
        propPlaceholderField.value = element.textContent;
        propPlaceholderSize.value = parseInt(element.style.fontSize);
        propPlaceholderFamily.value = element.style.fontFamily;
        propPlaceholderColor.value = rgbToHex(element.style.color);
        break;
    }
  }
  
  // Actualizar las propiedades de posición en el panel
  function actualizarPropsPos(element) {
    if (!element) return;
    
    const left = parseInt(element.style.left) || 0;
    const top = parseInt(element.style.top) || 0;
    const rect = element.getBoundingClientRect();
    
    propX.value = left;
    propY.value = top;
    propWidth.value = rect.width;
    propHeight.value = rect.height;
  }
  
  // Aplicar cambios desde panel de propiedades al elemento seleccionado
  function aplicarPropiedades() {
    const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
    const element = dragDrop.selected;
    
    if (!element) return;
    
    // Obtener tipo
    const tipo = element.getAttribute('data-type');
    
    // Aplicar propiedades comunes
    element.style.left = `${propX.value}px`;
    element.style.top = `${propY.value}px`;
    element.style.width = `${propWidth.value}px`;
    element.style.height = `${propHeight.value}px`;
    
    // Aplicar propiedades específicas según tipo
    switch (tipo) {
      case 'texto':
        element.textContent = propText.value;
        element.style.fontSize = `${propFontSize.value}px`;
        element.style.fontFamily = propFontFamily.value;
        element.style.color = propTextColor.value;
        element.style.fontWeight = propBold.checked ? 'bold' : 'normal';
        
        // Aplicar alineación de texto
        const alignRadios = document.getElementsByName('textAlign');
        for (const radio of alignRadios) {
          if (radio.checked) {
            element.style.textAlign = radio.value;
            break;
          }
        }
        break;
      
      case 'rectangulo':
        element.style.backgroundColor = propFillColor.value;
        element.style.borderColor = propBorderColor.value;
        element.style.borderWidth = `${propBorderWidth.value}px`;
        break;
        
      case 'linea':
        const colorLinea = propLineColor.value;
        const grosorLinea = propLineWidth.value + 'px';
        
        // Obtener estilo de línea seleccionado
        let estiloLinea = 'solid';
        document.getElementsByName('lineStyle').forEach(radio => {
          if (radio.checked) {
            estiloLinea = radio.value;
          }
        });
        
        if (element.classList.contains('horizontal')) {
          // Aplicar a línea horizontal
          element.style.borderTop = `${grosorLinea} ${estiloLinea} ${colorLinea}`;
          element.style.height = grosorLinea;
          element.style.width = `${propWidth.value}px`;
        } else {
          // Aplicar a línea vertical
          element.style.borderLeft = `${grosorLinea} ${estiloLinea} ${colorLinea}`;
          element.style.width = grosorLinea;
          element.style.height = `${propHeight.value}px`;
        }
        break;

      case 'placeholder':
        element.textContent = propPlaceholderField.value;
        element.style.fontSize = `${propPlaceholderSize.value}px`;
        element.style.fontFamily = propPlaceholderFamily.value;
        element.style.color = propPlaceholderColor.value;
        break;
    }
  }
  
  // ----- Funciones de plantilla -----
  
  // Cargar plantilla seleccionada
  async function cargarPlantilla() {
    const templateId = selectTemplate.value;
    
    if (!templateId) {
      alert('Por favor, seleccione una plantilla');
      return;
    }
    
    try {
      // Obtener plantilla
      const plantilla = await api.obtenerPlantilla(templateId);
      currentTemplate = plantilla;
      
      // Limpiar editores
      frontEditor.innerHTML = '';
      backEditor.innerHTML = '';
      
      // Renderizar plantilla
      renderizarPlantilla(plantilla);
      
    } catch (error) {
      console.error('Error al cargar plantilla:', error);
      alert('No se pudo cargar la plantilla. Intente de nuevo.');
    }
  }
  
  // Renderizar plantilla en ambos lados
  function renderizarPlantilla(plantilla) {
    if (!plantilla.layout_data) return;
    
    let layoutData;
    try {
      // Si es string, parsearlo a objeto
      layoutData = typeof plantilla.layout_data === 'string' 
        ? JSON.parse(plantilla.layout_data) 
        : plantilla.layout_data;
    } catch (e) {
      console.error('Error al parsear datos de plantilla:', e);
      return;
    }
    
    // Renderizar frente
    if (layoutData.frente && Array.isArray(layoutData.frente)) {
      layoutData.frente.forEach(elem => crearElementoDesdeLayout(elem, frontEditor, frontDragDrop));
    }
    
    // Renderizar reverso
    if (layoutData.reverso && Array.isArray(layoutData.reverso)) {
      layoutData.reverso.forEach(elem => crearElementoDesdeLayout(elem, backEditor, backDragDrop));
    }
  }
  
  // Crear elemento a partir de datos de layout
  function crearElementoDesdeLayout(elemData, editor, dragDrop) {
    // Crear elemento base
    const element = document.createElement('div');
    element.className = 'draggable';
    element.setAttribute('data-type', elemData.type);
    
    // Posición y tamaño
    const left = parseInt(elemData.left) || 0;
    const top = parseInt(elemData.top) || 0;
    
    // Configurar según tipo
    switch (elemData.type) {
      case 'texto':
        element.classList.add('element-text');
        element.textContent = elemData.content || 'Texto';
        
        // Aplicar estilos si existen
        if (elemData.fontSize) element.style.fontSize = elemData.fontSize;
        if (elemData.fontFamily) element.style.fontFamily = elemData.fontFamily;
        if (elemData.color) element.style.color = elemData.color;
        if (elemData.align) element.style.textAlign = elemData.align;
        if (elemData.bold) element.style.fontWeight = 'bold';
        break;
      
      case 'placeholder':
        element.classList.add('element-text');
        element.classList.add('element-placeholder');
        
        // Reemplazar el marcador con datos reales si tenemos usuario seleccionado
        if (currentUser && elemData.field) {
          const campo = elemData.field.replace(/\{\{|\}\}/g, '');
          element.textContent = currentUser[campo] || elemData.field;
        } else {
          element.textContent = elemData.field || '{{campo}}';
        }
        
        element.style.backgroundColor = 'rgba(173, 216, 230, 0.2)';
        element.style.border = '1px dashed #007bff';
        element.style.padding = '2px 5px';
        
        // Aplicar estilos si existen
        if (elemData.fontSize) element.style.fontSize = elemData.fontSize;
        if (elemData.fontFamily) element.style.fontFamily = elemData.fontFamily;
        if (elemData.color) element.style.color = elemData.color;
        break;
      
      case 'imagen':
        element.classList.add('element-image');
        
        const img = document.createElement('img');
        img.src = elemData.content;
        img.alt = 'Imagen';
        element.appendChild(img);
        break;
      
      case 'rectangulo':
        element.classList.add('element-rect');
        
        if (elemData.fillColor) element.style.backgroundColor = elemData.fillColor;
        if (elemData.borderColor) element.style.borderColor = elemData.borderColor;
        if (elemData.borderWidth) element.style.borderWidth = elemData.borderWidth;
        break;
        
      case 'linea':
        if (elemData.orientation === 'vertical') {
          element.classList.add('element-line', 'vertical');
          if (elemData.lineColor) element.style.borderLeft = `${elemData.lineWidth} ${elemData.lineStyle} ${elemData.lineColor}`;
        } else {
          element.classList.add('element-line', 'horizontal');
          if (elemData.lineColor) element.style.borderTop = `${elemData.lineWidth} ${elemData.lineStyle} ${elemData.lineColor}`;
        }
        break;
    }
    
    // Añadir elemento al editor
    dragDrop.addElement(element, left, top);
    
    // Aplicar ancho y alto si existen
    if (elemData.width) element.style.width = elemData.width;
    if (elemData.height) element.style.height = elemData.height;
    
    return element;
  }
  
  // ----- Funciones para obtener datos del editor -----
  
  // Obtener datos de todos los elementos en el editor
  function obtenerDatosEditor() {
    // Elementos del frente
    const elementosFronte = Array.from(frontEditor.querySelectorAll('.draggable'));
    const datosFronte = elementosFronte.map(getElementData);
    
    // Elementos del reverso
    const elementosReverso = Array.from(backEditor.querySelectorAll('.draggable'));
    const datosReverso = elementosReverso.map(getElementData);
    
    return {
      frente: datosFronte,
      reverso: datosReverso
    };
  }
  
  // Obtener datos de un elemento
  function getElementData(element) {
    const tipo = element.getAttribute('data-type');
    const rect = element.getBoundingClientRect();
    
    // Datos base
    const data = {
      type: tipo,
      left: element.style.left,
      top: element.style.top,
      width: element.style.width || `${rect.width}px`,
      height: element.style.height || `${rect.height}px`
    };
    
    // Añadir datos específicos según tipo
    switch (tipo) {
      case 'texto':
        data.content = element.textContent;
        data.fontSize = element.style.fontSize;
        data.fontFamily = element.style.fontFamily;
        data.color = element.style.color;
        data.align = element.style.textAlign;
        data.bold = element.style.fontWeight === 'bold';
        break;
      
      case 'imagen':
        const img = element.querySelector('img');
        data.content = img ? img.src : '';
        break;
      
      case 'rectangulo':
        data.fillColor = element.style.backgroundColor;
        data.borderColor = element.style.borderColor;
        data.borderWidth = element.style.borderWidth;
        break;
        
      case 'linea':
        if (element.classList.contains('horizontal')) {
          data.orientation = 'horizontal';
          data.lineColor = element.style.borderTopColor;
          data.lineWidth = element.style.borderTopWidth;
          data.lineStyle = element.style.borderTopStyle;
        } else {
          data.orientation = 'vertical';
          data.lineColor = element.style.borderLeftColor;
          data.lineWidth = element.style.borderLeftWidth;
          data.lineStyle = element.style.borderLeftStyle;
        }
        break;
    }
    
    return data;
  }
  
  // ----- Funciones de utilidad -----
  
  // Convertir color RGB a hexadecimal
  function rgbToHex(rgb) {
    if (!rgb || rgb === '') return '#000000';
    
    // Si ya es hex, devolverlo
    if (rgb.startsWith('#')) return rgb;
    
    // Extraer valores RGB
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+(?:\.\d+)?)?\)$/);
    
    if (!match) return '#000000';
    
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
  }
  
  // Capitalizar primera letra
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // ----- Event Listeners -----
  
  // Logout
  btnLogout.addEventListener('click', async () => {
    try {
      await api.logout();
      window.location.href = '/index.html';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  });
  
  // Cambio de tabs (frente/reverso)
  document.getElementById('front-tab').addEventListener('click', () => {
    setActiveEditor('front');
  });
  
  document.getElementById('back-tab').addEventListener('click', () => {
    setActiveEditor('back');
  });
  
  // Búsqueda de usuarios
  btnSearch.addEventListener('click', async () => {
    const termino = searchUser.value.trim();
    if (!termino) return;
    
    try {
      const resultados = await api.buscarCredenciales(termino);
      
      // Actualizar selector con resultados
      selectUser.innerHTML = '<option value="" selected disabled>Seleccione un usuario</option>';
      
      resultados.forEach(credencial => {
        const option = document.createElement('option');
        option.value = credencial.id;
        option.textContent = `${credencial.nombre} ${credencial.apellidos} - ${credencial.numero_nomina}`;
        selectUser.appendChild(option);
      });
      
      if (resultados.length === 0) {
        alert('No se encontraron usuarios con ese criterio de búsqueda.');
      }
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      alert('Error al buscar usuarios. Intente de nuevo.');
    }
  });
  
  // Selección de usuario
  selectUser.addEventListener('change', async () => {
    const userId = selectUser.value;
    if (!userId) return;
    
    try {
      const usuario = await api.obtenerCredencial(userId);
      currentUser = usuario;
      
      // Si hay una plantilla cargada, actualizar con los datos del usuario
      if (currentTemplate) {
        renderizarPlantilla(currentTemplate);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      alert('Error al obtener datos del usuario. Intente de nuevo.');
    }
  });
  
  // Aplicar plantilla
  btnApplyTemplate.addEventListener('click', async () => {
    await cargarPlantilla();
  });
  
  // Agregar elementos
  btnAddText.addEventListener('click', agregarElementoTexto);
  btnAddImage.addEventListener('click', agregarElementoImagen);
  btnAddRect.addEventListener('click', agregarElementoRectangulo);
  btnAddLine.addEventListener('click', agregarElementoLinea);
  btnToggleLineOrientation.addEventListener('click', cambiarOrientacionLinea);
  
  // Eliminar elemento
  btnDelete.addEventListener('click', eliminarElementoSeleccionado);
  
  // Aplicar propiedades
  btnApplyProperties.addEventListener('click', aplicarPropiedades);
  
  // Guardar texto desde modal
  btnSaveText.addEventListener('click', () => {
    const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
    const element = dragDrop.selected;
    
    if (element && element.getAttribute('data-type') === 'texto') {
      element.textContent = modalPropText.value;
      propText.value = modalPropText.value;
    }
  });
  
  // Generar PDF
  btnPDF.addEventListener('click', async () => {
    if (!currentUser) {
      alert('Por favor, seleccione un usuario');
      return;
    }
    
    if (!currentTemplate) {
      alert('Por favor, aplique una plantilla');
      return;
    }
    
    try {
      // Guardar estado actual de la plantilla
      const layoutData = obtenerDatosEditor();
      const templateData = {
        ...currentTemplate,
        layout_data: layoutData
      };
      
      // Generar PDF
      const pdfData = await api.guardarPDFCredencial(currentUser.id, currentTemplate.template_id);
      
      // Mostrar preview
      pdfPreviewFrame.src = pdfData.pdfUrl;
      pdfPreviewModal.show();
      
      // Configurar botones
      btnDownloadPDF.onclick = () => {
        api.generarPDFCredencial(currentUser.id, currentTemplate.template_id);
      };
      
      btnDirectPrint.onclick = () => {
        pdfPreviewFrame.contentWindow.print();
      };
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar PDF. Intente de nuevo.');
    }
  });
  
  // Imprimir directamente
  btnPrint.addEventListener('click', () => {
    if (!currentUser) {
      alert('Por favor, seleccione un usuario');
      return;
    }
    
    if (!currentTemplate) {
      alert('Por favor, aplique una plantilla');
      return;
    }
    
    try {
      // Generar e imprimir
      api.generarPDFCredencial(currentUser.id, currentTemplate.template_id);
      
    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('Error al imprimir. Intente de nuevo.');
    }
  });
  
  // Guardar plantilla
  btnSave.addEventListener('click', async () => {
    if (!currentTemplate) {
      alert('Por favor, aplique una plantilla primero');
      return;
    }
    
    try {
      // Obtener datos actuales del editor
      const layoutData = obtenerDatosEditor();
      
      // Actualizar plantilla
      await api.actualizarPlantilla(currentTemplate.template_id, {
        nombre_plantilla: currentTemplate.nombre_plantilla,
        layout_data: JSON.stringify(layoutData)
      });
      
      alert('Plantilla guardada exitosamente');
      
    } catch (error) {
      console.error('Error al guardar plantilla:', error);
      alert('Error al guardar plantilla. Intente de nuevo.');
    }
  });
  
  // Cambio de imagen
  propImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target.result;
      
      const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;
      const element = dragDrop.selected;
      
      if (element && element.getAttribute('data-type') === 'imagen') {
        const img = element.querySelector('img');
        if (img) {
          img.src = imgUrl;
        }
      }
    };
    reader.readAsDataURL(file);
  });

  // Inicializar tooltips para la nueva sidebar
  const tooltipList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipList.forEach(t => new bootstrap.Tooltip(t));

  // Delete key
  document.addEventListener('keydown', (e) => {
    if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      eliminarElementoSeleccionado();
    }
  });

  // add agregarElementoPlaceholder and crearPlaceholder functions near others
  function agregarElementoPlaceholder() {
    placeholderModal.show();
  }
  function crearPlaceholder(field) {
    const editor = activeEditor === 'front' ? frontEditor : backEditor;
    const dragDrop = activeEditor === 'front' ? frontDragDrop : backDragDrop;

    const element = document.createElement('div');
    element.className = 'draggable element-text element-placeholder';
    element.setAttribute('data-type', 'placeholder');
    element.setAttribute('data-field', field);
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '14px';
    element.style.color = '#000000';
    element.style.backgroundColor = 'rgba(173,216,230,0.2)';
    element.style.border = '1px dashed #007bff';
    element.style.padding = '2px 5px';
    element.textContent = field;

    dragDrop.addElement(element, 50, 50);
    dragDrop.selectElement(element);
  }

  // event listeners
  btnAddPlaceholder.addEventListener('click', agregarElementoPlaceholder);
  placeholderButtons.forEach(b=>{b.addEventListener('click',()=>{crearPlaceholder(b.dataset.field); placeholderModal.hide();});});
});