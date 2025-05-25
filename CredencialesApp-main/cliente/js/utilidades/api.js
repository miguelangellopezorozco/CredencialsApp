// cliente/js/utilidades/api.js
/**
 * Clase de utilidad para hacer peticiones a la API
 */
class API {
    /**
     * Constructor de la clase
     */
    constructor() {
        this.baseURL = '/api';
    }
  
    /**
     * Método genérico para realizar peticiones HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {string} method - Método HTTP
     * @param {object} data - Datos a enviar (opcional)
     * @param {boolean} json - Indicador si los datos son JSON
     * @returns {Promise} - Promesa con la respuesta
     */
    async request(endpoint, method = 'GET', data = null, json = true) {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {};
      let body = null;
  
      if (data && json) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
      } else if (data) {
        body = data;
      }
  
      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
          credentials: 'include', // Incluir cookies en todas las solicitudes
          mode: 'cors' // Habilitar CORS
        });
  
        // Si la respuesta es 401 (no autorizado) y no es la ruta de login,
        // redirigir al login
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          window.location.href = '/index.html';
          return Promise.reject({ mensaje: 'Sesión expirada' });
        }
  
        // Intentar parsear como JSON
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          responseData = { mensaje: 'No se pudo parsear la respuesta' };
        }
  
        // Si la respuesta no es exitosa, rechazar con los datos de error
        if (!response.ok) {
          return Promise.reject(responseData);
        }
  
        return responseData;
      } catch (error) {
        console.error('Error en request:', error);
        throw error;
      }
    }
  
    // Métodos HTTP
    async get(endpoint) {
      return this.request(endpoint);
    }
  
    async post(endpoint, data, json = true) {
      return this.request(endpoint, 'POST', data, json);
    }
  
    async put(endpoint, data, json = true) {
      return this.request(endpoint, 'PUT', data, json);
    }
  
    async delete(endpoint) {
      return this.request(endpoint, 'DELETE');
    }
  
    // Métodos específicos para autenticación
    async login(usuario, password) {
      return this.post('/auth/login', { usuario, password });
    }
  
    async logout() {
      return this.post('/auth/logout');
    }
  
    async verificarSesion() {
      return this.get('/auth/verificar');
    }
  
    // Métodos para credenciales
    async obtenerCredenciales() {
      return this.get('/credenciales');
    }
  
    async obtenerCredencial(id) {
      return this.get(`/credenciales/${id}`);
    }
  
    async crearCredencial(data) {
      return this.post('/credenciales', data, false);
    }
  
    async actualizarCredencial(id, data) {
      return this.put(`/credenciales/${id}`, data, false);
    }
  
    async eliminarCredencial(id) {
      return this.delete(`/credenciales/${id}`);
    }
  
    async buscarCredenciales(termino) {
      return this.get(`/credenciales/buscar?q=${encodeURIComponent(termino)}`);
    }
  
    // Métodos para plantillas
    async obtenerPlantillas() {
      return this.get('/plantillas');
    }
  
    async obtenerPlantilla(id) {
      return this.get(`/plantillas/${id}`);
    }
  
    async crearPlantilla(data) {
      return this.post('/plantillas', data);
    }
  
    async actualizarPlantilla(id, data) {
      return this.put(`/plantillas/${id}`, data);
    }
  
    async eliminarPlantilla(id) {
      return this.delete(`/plantillas/${id}`);
    }
  
    // Métodos para PDF
    async generarPDFCredencial(id, plantillaId) {
      if (!id || !plantillaId) {
        throw new Error('Se requieren ID de credencial y plantilla');
      }
      
      try {
        // Hacer la petición con fetch para mantener las credenciales
        const response = await fetch(`${this.baseURL}/pdf/credencial/${id}/${plantillaId}`, {
          method: 'GET',
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error('Error al generar PDF');
        }
        
        // Obtener el blob del PDF
        const blob = await response.blob();
        
        // Crear URL temporal para el blob
        const url = window.URL.createObjectURL(blob);
        
        // Abrir en nueva ventana
        window.open(url, '_blank');
        
        // Limpiar la URL después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
        
      } catch (error) {
        console.error('Error al generar PDF:', error);
        throw error;
      }
    }
  
    async guardarPDFCredencial(id, plantillaId) {
      if (!id || !plantillaId) {
        throw new Error('Se requieren ID de credencial y plantilla');
      }
      return this.post(`/pdf/guardar-credencial/${id}/${plantillaId}`);
    }
}
  
// Crear instancia global
const api = new API();