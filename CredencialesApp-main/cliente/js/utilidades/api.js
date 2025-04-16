// cliente/js/utilidades/api.js
/**
 * Clase de utilidad para hacer peticiones a la API
 */
class API {
    /**
     * Constructor de la clase
     * @param {string} baseURL - URL base de la API
     */
    constructor(baseURL = '/api') {
      this.baseURL = baseURL;
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
          credentials: 'same-origin' // Enviar cookies para sesiones
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
  
    // Métodos específicos para cada tipo de petición
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
  
    // Métodos específicos para operadores
    async obtenerOperadores() {
      return this.get('/operadores');
    }
  
    async crearOperador(data) {
      return this.post('/operadores', data);
    }
  
    async actualizarOperador(id, data) {
      return this.put(`/operadores/${id}`, data);
    }
  
    async eliminarOperador(id) {
      return this.delete(`/operadores/${id}`);
    }
  
    // Métodos específicos para credenciales
    async obtenerCredenciales() {
      return this.get('/credenciales');
    }
  
    async buscarCredenciales(termino) {
      return this.get(`/credenciales/buscar?termino=${encodeURIComponent(termino)}`);
    }
  
    async obtenerCredencial(id) {
      return this.get(`/credenciales/${id}`);
    }
  
    async crearCredencial(data) {
      return this.post('/credenciales', data, false); // false para FormData
    }
  
    async actualizarCredencial(id, data) {
      return this.put(`/credenciales/${id}`, data, false); // false para FormData
    }
  
    async eliminarCredencial(id) {
      return this.delete(`/credenciales/${id}`);
    }
  
    // Métodos específicos para plantillas
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
  
    async subirLogo(formData) {
      return this.post('/plantillas/logo', formData, false);
    }
  
    // Métodos específicos para PDFs
    async generarPDFCredencial(credencialId, plantillaId) {
      // Esta petición genera una descarga de archivo
      window.open(`${this.baseURL}/pdf/credencial/${credencialId}/${plantillaId}`, '_blank');
    }
  
    async guardarPDFCredencial(credencialId, plantillaId) {
      return this.post(`/pdf/guardar-credencial/${credencialId}/${plantillaId}`);
    }
  }
  
  // Exportar una instancia global
  const api = new API();