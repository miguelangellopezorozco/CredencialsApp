
// servidor/utilidades/validadores.js
const validarRFC = (rfc) => {
    // Validación básica: entre 12 y 13 caracteres alfanuméricos
    const regex = /^[A-Z&Ññ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return regex.test(rfc);
  };
  
  const validarNSS = (nss) => {
    // Validación básica: 11 dígitos
    const regex = /^[0-9]{11}$/;
    return regex.test(nss);
  };
  
  const validarNomina = (nomina) => {
    // Validación básica: alfanumérico
    const regex = /^[A-Z0-9-]+$/i;
    return regex.test(nomina);
  };
  
  const validarNombre = (nombre) => {
    // Validación básica: letras, espacios y tildes
    const regex = /^[A-ZÁÉÍÓÚÜÑa-záéíóúüñ\s]+$/;
    return regex.test(nombre) && nombre.length > 1;
  };
  
  module.exports = {
    validarRFC,
    validarNSS,
    validarNomina,
    validarNombre
  };