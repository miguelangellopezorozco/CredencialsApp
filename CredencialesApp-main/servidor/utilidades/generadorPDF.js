// servidor/utilidades/generadorPDF.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un PDF de credencial con frente y reverso
 * @param {Object} data Datos de la credencial
 * @param {Object} layoutData Datos de posicionamiento de los elementos
 * @param {Object} res Objeto de respuesta Express
 * @param {String} modo 'download' o 'stream'
 */
function generarPDF(data, layoutData, res, modo = 'download') {
  // Crear nuevo documento PDF
  const doc = new PDFDocument({
    size: [243, 153], // Tamaño tipo tarjeta de crédito en puntos (85.6mm x 53.98mm)
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    info: {
      Title: `Credencial - ${data.nombre} ${data.apellidos}`,
      Author: 'Sistema de Credenciales'
    }
  });

  // Configurar respuesta HTTP
  if (modo === 'download') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=credencial_${data.numero_nomina}.pdf`);
    doc.pipe(res);
  } else {
    // Si se quiere guardar en archivo
    const filePath = path.join(__dirname, '..', '..', 'cliente', 'uploads', 'pdfs', `credencial_${data.numero_nomina}.pdf`);
    const dirPath = path.dirname(filePath);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    doc.pipe(fs.createWriteStream(filePath));
  }

  // Función para renderizar elementos según su tipo y posición
  const renderizarElementos = (elementos, data) => {
    elementos.forEach(elem => {
      // Posicionar según las coordenadas
      doc.save();
      
      const x = parseFloat(elem.left) || 0;
      const y = parseFloat(elem.top) || 0;
      
      doc.translate(x, y);

      // Renderizar según el tipo de elemento
      switch (elem.type) {
        case 'texto':
          // Establecer fuente
          if (elem.font) {
            doc.font(elem.font);
          }
          // Establecer tamaño de fuente
          if (elem.fontSize) {
            doc.fontSize(elem.fontSize);
          }
          // Establecer color
          if (elem.color) {
            doc.fillColor(elem.color);
          }
          
          // Renderizar texto con datos reales si contiene marcadores
          let textoFinal = elem.content;
          if (textoFinal.includes('{{')) {
            const marcadores = textoFinal.match(/\{\{(.*?)\}\}/g);
            if (marcadores) {
              marcadores.forEach(marcador => {
                const campo = marcador.replace(/\{\{|\}\}/g, '').trim();
                if (data[campo] !== undefined) {
                  textoFinal = textoFinal.replace(marcador, data[campo]);
                }
              });
            }
          }
          
          doc.text(textoFinal, 0, 0, {
            width: parseFloat(elem.width) || undefined,
            align: elem.align || 'left'
          });
          break;
          
        case 'imagen':
          // Comprobar si es una ruta de archivo o una imagen base64
          if (elem.content.startsWith('data:image')) {
            // Es una imagen base64
            const imgData = elem.content.split(',')[1];
            doc.image(Buffer.from(imgData, 'base64'), 0, 0, {
              width: parseFloat(elem.width) || undefined,
              height: parseFloat(elem.height) || undefined
            });
          } else {
            // Es una ruta de archivo
            const imgPath = path.join(__dirname, '..', '..', 'cliente', elem.content);
            if (fs.existsSync(imgPath)) {
              doc.image(imgPath, 0, 0, {
                width: parseFloat(elem.width) || undefined,
                height: parseFloat(elem.height) || undefined
              });
            }
          }
          break;
          
        case 'foto':
          // Si es el elemento foto, usar el campo "foto" de los datos
          if (data.foto) {
            const fotoPath = path.join(__dirname, '..', '..', 'cliente', data.foto);
            if (fs.existsSync(fotoPath)) {
              doc.image(fotoPath, 0, 0, {
                width: parseFloat(elem.width) || undefined,
                height: parseFloat(elem.height) || undefined,
                fit: [parseFloat(elem.width), parseFloat(elem.height)]
              });
            }
          }
          break;
          
        case 'rectangulo':
          // Dibujar un rectángulo
          if (elem.fillColor) {
            doc.fillColor(elem.fillColor);
          }
          if (elem.strokeColor) {
            doc.strokeColor(elem.strokeColor);
          }
          doc.rect(0, 0, parseFloat(elem.width) || 0, parseFloat(elem.height) || 0);
          
          if (elem.fillColor && elem.strokeColor) {
            doc.fillAndStroke();
          } else if (elem.fillColor) {
            doc.fill();
          } else {
            doc.stroke();
          }
          break;
          
        case 'qr':
          // Si se implementa código QR, se haría aquí
          break;
      }
      
      doc.restore();
    });
  };
  
  // Primera página - Frente de la credencial
  if (layoutData.frente && Array.isArray(layoutData.frente)) {
    renderizarElementos(layoutData.frente, data);
  }
  
  // Segunda página - Reverso de la credencial
  doc.addPage();
  if (layoutData.reverso && Array.isArray(layoutData.reverso)) {
    renderizarElementos(layoutData.reverso, data);
  }

  // Finalizar documento
  doc.end();
  
  // Si es en modo stream, devolver la ruta del archivo
  if (modo !== 'download') {
    return `/uploads/pdfs/credencial_${data.numero_nomina}.pdf`;
  }
}

module.exports = { generarPDF };
