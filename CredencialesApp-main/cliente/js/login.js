// cliente/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
  const errorMessage = document.getElementById('errorMessage');

  // Verificar si hay sesión activa SOLO en páginas que no sean login
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    api.verificarSesion()
      .then(response => {
        if (response.autenticado) {
          // Si ya está autenticado, redirigir al dashboard
          window.location.href = '/dashboard.html';
        }
      })
      .catch(error => {
        // Si hay error, simplemente mostrar el formulario de login
        window.location.href = '/index.html';
      });
  }

  // Manejar envío del formulario
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    
    try {
      const btn = loginForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      // Cambiar botón a estado de carga
      btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...';
      btn.disabled = true;
      
      // Intentar login
      const response = await api.login(usuario, password);
      
      // Si es exitoso, redirigir al dashboard
      window.location.href = '/dashboard.html';
      
    } catch (error) {
      console.error('Error de login:', error);
      
      // Mostrar modal de error
      errorMessage.textContent = error.mensaje || 'Error al iniciar sesión. Verifique sus credenciales.';
      errorModal.show();
      
      // Restaurar botón
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Ingresar';
      btn.disabled = false;
    }
  });
});