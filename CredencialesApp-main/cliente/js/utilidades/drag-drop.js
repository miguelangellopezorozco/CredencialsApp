// cliente/js/utilidades/drag-drop.js
class DragAndDrop {
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      draggableSelector: '.draggable',
      onDragStart: null,
      onDragEnd: null,
      onSelect: null,
      onMove: null,
      onResize: null
    }, options);
    
    // Estado
    this.selected = null;
    this.initialX = 0;
    this.initialY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;
    
    // Inicializar eventos
    this.init();
  }
  
  init() {
    // Añadir listeners de eventos
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  handleMouseDown(e) {
    // Verificar si se está haciendo clic en una manija de redimensionamiento
    const resizeHandle = e.target.closest('.resize-handle');
    if (resizeHandle && this.selected) {
      e.preventDefault();
      
      // Iniciar redimensionamiento
      this.isResizing = true;
      this.resizeHandle = resizeHandle.dataset.handle;
      
      // Guardar posición inicial y dimensiones del elemento
      const element = this.selected;
      const rect = element.getBoundingClientRect();
      this.initialX = e.clientX;
      this.initialY = e.clientY;
      this.initialWidth = rect.width;
      this.initialHeight = rect.height;
      this.initialLeft = parseInt(element.style.left) || 0;
      this.initialTop = parseInt(element.style.top) || 0;
      
      return;
    }
    
    // Encontrar elemento arrastrable
    const draggable = e.target.closest(this.options.draggableSelector);
    if (!draggable) return;
    
    e.preventDefault();
    
    // Seleccionar el elemento
    this.selectElement(draggable);
    
    // Iniciar arrastre
    this.isDragging = true;
    
    // Calcular offsets iniciales
    const rect = draggable.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    
    // Guardar posición inicial
    this.initialX = parseInt(draggable.style.left) || 0;
    this.initialY = parseInt(draggable.style.top) || 0;
    
    // Añadir clase de arrastre
    draggable.classList.add('element-dragging');
    
    // Callback
    if (this.options.onDragStart) {
      this.options.onDragStart(draggable);
    }
  }
  
  handleMouseMove(e) {
    // Manejar redimensionamiento
    if (this.isResizing && this.selected) {
      e.preventDefault();
      
      // Calcular cambio en posición
      const deltaX = e.clientX - this.initialX;
      const deltaY = e.clientY - this.initialY;
      
      // Obtener elemento
      const element = this.selected;
      
      // Ajustar dimensiones según la manija
      let newWidth = this.initialWidth;
      let newHeight = this.initialHeight;
      let newLeft = this.initialLeft;
      let newTop = this.initialTop;
      
      switch (this.resizeHandle) {
        case 'se': // bottom-right
          newWidth = Math.max(20, this.initialWidth + deltaX);
          newHeight = Math.max(20, this.initialHeight + deltaY);
          break;
          
        case 'sw': // bottom-left
          newWidth = Math.max(20, this.initialWidth - deltaX);
          newLeft = this.initialLeft + deltaX;
          newHeight = Math.max(20, this.initialHeight + deltaY);
          // Si el ancho es mínimo, no mover más a la izquierda
          if (newWidth <= 20) newLeft = this.initialLeft + this.initialWidth - 20;
          break;
          
        case 'ne': // top-right
          newWidth = Math.max(20, this.initialWidth + deltaX);
          newTop = this.initialTop + deltaY;
          newHeight = Math.max(20, this.initialHeight - deltaY);
          // Si la altura es mínima, no mover más arriba
          if (newHeight <= 20) newTop = this.initialTop + this.initialHeight - 20;
          break;
          
        case 'nw': // top-left
          newWidth = Math.max(20, this.initialWidth - deltaX);
          newLeft = this.initialLeft + deltaX;
          newHeight = Math.max(20, this.initialHeight - deltaY);
          newTop = this.initialTop + deltaY;
          // Límites mínimos
          if (newWidth <= 20) newLeft = this.initialLeft + this.initialWidth - 20;
          if (newHeight <= 20) newTop = this.initialTop + this.initialHeight - 20;
          break;
          
        case 'n': // top
          newHeight = Math.max(20, this.initialHeight - deltaY);
          newTop = this.initialTop + deltaY;
          if (newHeight <= 20) newTop = this.initialTop + this.initialHeight - 20;
          break;
          
        case 's': // bottom
          newHeight = Math.max(20, this.initialHeight + deltaY);
          break;
          
        case 'e': // right
          newWidth = Math.max(20, this.initialWidth + deltaX);
          break;
          
        case 'w': // left
          newWidth = Math.max(20, this.initialWidth - deltaX);
          newLeft = this.initialLeft + deltaX;
          if (newWidth <= 20) newLeft = this.initialLeft + this.initialWidth - 20;
          break;
      }
      
      // Aplicar nuevas dimensiones
      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
      
      // Actualizar posición de las manijas de redimensionamiento
      this.updateResizeHandles(element);
      
      // Callback
      if (this.options.onResize) {
        this.options.onResize(element, newWidth, newHeight);
      }
      
      return;
    }
    
    // Manejar arrastre
    if (this.isDragging && this.selected) {
      e.preventDefault();
      
      // Calcular nueva posición dentro del contenedor
      const containerRect = this.container.getBoundingClientRect();
      const x = e.clientX - containerRect.left - this.offsetX;
      const y = e.clientY - containerRect.top - this.offsetY;
      
      // Aplicar nueva posición
      this.selected.style.left = `${x}px`;
      this.selected.style.top = `${y}px`;
      
      // Actualizar posición de las manijas de redimensionamiento
      this.updateResizeHandles(this.selected);
      
      // Callback
      if (this.options.onMove) {
        this.options.onMove(this.selected);
      }
    }
  }
  
  handleMouseUp(e) {
    // Finalizar redimensionamiento
    if (this.isResizing) {
      e.preventDefault();
      this.isResizing = false;
      this.resizeHandle = null;
      return;
    }
    
    // Finalizar arrastre
    if (this.isDragging) {
      e.preventDefault();
      this.isDragging = false;
      
      if (this.selected) {
        this.selected.classList.remove('element-dragging');
        
        // Callback
        if (this.options.onDragEnd) {
          this.options.onDragEnd(this.selected);
        }
      }
    }
  }
  
  selectElement(element) {
    // Quitar selección previa y eliminar manijas de redimensionamiento
    if (this.selected) {
      this.selected.classList.remove('element-selected');
      this.removeResizeHandles();
    }
    
    // Establecer nueva selección
    this.selected = element;
    element.classList.add('element-selected');
    
    // Añadir manijas de redimensionamiento
    this.addResizeHandles(element);
    
    // Callback
    if (this.options.onSelect) {
      this.options.onSelect(element);
    }
  }
  
  addElement(element, x = 50, y = 50) {
    // Posicionar elemento
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    // Añadir al contenedor
    this.container.appendChild(element);
    
    return element;
  }
  
  removeSelected() {
    if (this.selected) {
      // Quitar manijas de redimensionamiento
      this.removeResizeHandles();
      
      // Eliminar elemento
      this.selected.remove();
      this.selected = null;
    }
  }
  
  // Añadir manijas de redimensionamiento alrededor del elemento seleccionado
  addResizeHandles(element) {
    // Posiciones de las manijas (8 manijas en total)
    const positions = [
      { handle: 'nw', cursor: 'nw-resize', top: -5, left: -5 },
      { handle: 'n', cursor: 'n-resize', top: -5, left: '50%', transform: 'translateX(-50%)' },
      { handle: 'ne', cursor: 'ne-resize', top: -5, right: -5 },
      { handle: 'e', cursor: 'e-resize', top: '50%', right: -5, transform: 'translateY(-50%)' },
      { handle: 'se', cursor: 'se-resize', bottom: -5, right: -5 },
      { handle: 's', cursor: 's-resize', bottom: -5, left: '50%', transform: 'translateX(-50%)' },
      { handle: 'sw', cursor: 'sw-resize', bottom: -5, left: -5 },
      { handle: 'w', cursor: 'w-resize', top: '50%', left: -5, transform: 'translateY(-50%)' }
    ];
    
    // Crear y añadir cada manija
    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      handle.dataset.handle = pos.handle;
      handle.style.cursor = pos.cursor;
      handle.style.position = 'absolute';
      handle.style.width = '10px';
      handle.style.height = '10px';
      handle.style.backgroundColor = '#0d6efd';
      handle.style.border = '1px solid #fff';
      handle.style.borderRadius = '50%';
      handle.style.zIndex = '1000';
      
      // Aplicar estilos de posición
      if (pos.top !== undefined) handle.style.top = `${pos.top}px`;
      if (pos.left !== undefined) handle.style.left = typeof pos.left === 'string' ? pos.left : `${pos.left}px`;
      if (pos.right !== undefined) handle.style.right = `${pos.right}px`;
      if (pos.bottom !== undefined) handle.style.bottom = `${pos.bottom}px`;
      if (pos.transform) handle.style.transform = pos.transform;
      
      // Añadir al elemento
      element.appendChild(handle);
    });
  }
  
  // Eliminar todas las manijas de redimensionamiento
  removeResizeHandles() {
    if (!this.selected) return;
    
    const handles = this.selected.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
  }
  
  // Actualizar posición de las manijas cuando el elemento se mueve o redimensiona
  updateResizeHandles(element) {
    // Nada que hacer aquí ya que las manijas se mueven automáticamente 
    // con el elemento al ser elementos hijos con posición absoluta
  }
}