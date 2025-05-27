// servidor/utilidades/generadorPDF.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DOC_WIDTH = 243;   // puntos
const DOC_HEIGHT = 153;  // puntos
const DESIGN_WIDTH = 480; // px del editor
const DESIGN_HEIGHT = 300; // px del editor

const scaleX = (value) => (value * DOC_WIDTH) / DESIGN_WIDTH;
const scaleY = (value) => (value * DOC_HEIGHT) / DESIGN_HEIGHT;

const SCALE_Y = DOC_HEIGHT / DESIGN_HEIGHT;

/**
 * Convierte una imagen base64 a un formato compatible con PDFKit
 * @param {string} base64Data Datos de la imagen en base64
 * @returns {Promise<Buffer>} Buffer con la imagen convertida
 */
async function convertirImagenBase64(base64Data) {
  try {
    // Extraer el tipo de imagen y los datos
    const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Formato de imagen base64 inválido');
    }

    const imageType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // Si es WebP, convertir a PNG
    if (imageType === 'webp') {
      return await sharp(imageBuffer)
        .png()
        .toBuffer();
    }

    // Para otros formatos compatibles, devolver el buffer original
    return imageBuffer;
  } catch (error) {
    console.error('Error al convertir imagen:', error);
    throw error;
  }
}

/**
 * Verifica si un archivo es una imagen válida
 * @param {string} filePath Ruta del archivo
 * @returns {boolean} true si es una imagen válida
 */
function esImagenValida(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // Verificar los primeros bytes para identificar el formato
    const header = buffer.slice(0, 4);
    
    // PNG: 89 50 4E 47
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
      return true;
    }
    
    // JPEG: FF D8 FF
    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
      return true;
    }
    
    // GIF: 47 49 46 38
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar imagen:', error);
    return false;
  }
}

const parseColor = (color) => {
  if (!color) return null;
  if (typeof color !== 'string') return color;
  // Si ya está en formato hexadecimal
  if (color.startsWith('#')) {
    return color;
  }
  // Soporta formatos rgb() o rgba()
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  // Si no coincide, devolver tal cual (puede ser un nombre estándar como 'black')
  return color;
};

/**
 * Genera un PDF de credencial con frente y reverso
 * @param {Object} data Datos de la credencial
 * @param {Object} layoutData Datos de posicionamiento de los elementos
 * @param {Object} res Objeto de respuesta Express
 * @param {String} modo 'download' o 'stream'
 */
async function generarPDF(data, layoutData, res, modo = 'download') {
  console.log('=== GENERANDO PDF ===');
  console.log('Datos de credencial:', data);
  console.log('Layout data:', JSON.stringify(layoutData, null, 2));
  
  // Crear nuevo documento PDF
  const doc = new PDFDocument({
    size: [243, 153], // Tamaño tipo tarjeta de crédito en puntos (85.6mm x 53.98mm)
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: false, // Importante: no crear la primera página automáticamente
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
    const uploadsDir = path.join(__dirname, '..', '..', 'cliente', 'uploads');
    const pdfsDir = path.join(uploadsDir, 'pdfs');
    
    // Asegurar que los directorios existan
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }
    
    const filePath = path.join(pdfsDir, `credencial_${data.numero_nomina}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));
  }

  // Función para mapear fuentes web a fuentes PDF estándar
  const mapearFuente = (fontFamily) => {
    if (!fontFamily) return 'Helvetica';
    
    const font = fontFamily.toLowerCase();
    if (font.includes('arial') || font.includes('helvetica') || font.includes('sans-serif')) {
      return 'Helvetica';
    } else if (font.includes('times') || font.includes('serif')) {
      return 'Times-Roman';
    } else if (font.includes('courier') || font.includes('monospace')) {
      return 'Courier';
    }
    return 'Helvetica'; // Fuente por defecto
  };

  // Función para renderizar elementos según su tipo y posición
  const renderizarElementos = async (elementos, data) => {
    console.log(`Renderizando ${elementos.length} elementos:`, elementos);

    // 1. Elementos de fondo
    const fondo = elementos.filter(e => !['texto', 'placeholder'].includes(e.type));
    // 2. Elementos de texto (primer plano)
    const frenteTexto = elementos.filter(e => ['texto', 'placeholder'].includes(e.type));

    const procesar = async (lista) => {
      for (let i = 0; i < lista.length; i++) {
        const elem = lista[i];
        console.log(`\n--- Elemento ${i + 1} ---`);
        console.log('Tipo:', elem.type);
        console.log('Posición PX:', { left: elem.left, top: elem.top, width: elem.width, height: elem.height });
        
        try {
          const rawX = parseFloat(elem.left) || 0;
          const rawY = parseFloat(elem.top) || 0;
          const rawW = parseFloat(elem.width) || undefined;
          const rawH = parseFloat(elem.height) || undefined;

          const x = scaleX(rawX);
          const y = scaleY(rawY);
          const w = rawW !== undefined ? scaleX(rawW) : undefined;
          const h = rawH !== undefined ? scaleY(rawH) : undefined;
          
          console.log(`Escalado a puntos x:${x}, y:${y}, w:${w}, h:${h}`);

          // Renderizar según el tipo de elemento
          switch (elem.type) {
            case 'texto':
              console.log('Renderizando texto:', elem.content);
              // Establecer fuente
              const fuenteTexto = mapearFuente(elem.fontFamily || elem.font);
              doc.font(fuenteTexto);
              // Establecer tamaño de fuente
              if (elem.fontSize) {
                doc.fontSize(parseFloat(elem.fontSize) * SCALE_Y);
              }
              // Establecer color
              if (elem.color) {
                doc.fillColor(parseColor(elem.color));
              }
              
              // Renderizar texto con datos reales si contiene marcadores
              let textoFinal = elem.content;
              if (textoFinal && textoFinal.includes('{{')) {
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
              
              doc.text(textoFinal, x, y, {
                width: w,
                align: elem.align || 'left',
                continued: false
              });
              break;
              
            case 'placeholder':
              console.log('Renderizando placeholder:', elem.field);
              
              // Establecer fuente y tamaño
              if (elem.fontSize) {
                doc.fontSize(parseFloat(elem.fontSize) * SCALE_Y);
              }
              
              // Usar fuente estándar PDF
              const fuentePDF = mapearFuente(elem.fontFamily);
              doc.font(fuentePDF);
              
              if (elem.color) {
                doc.fillColor(parseColor(elem.color));
              }
              
              // Obtener el valor del campo
              let valorCampo = '';
              if (elem.field && elem.field.includes('{{')) {
                const campo = elem.field.replace(/\{\{|\}\}/g, '').trim();
                valorCampo = data[campo] || elem.field;
              } else {
                valorCampo = elem.field || '';
              }
              
              console.log(`Campo: ${elem.field} -> Valor: ${valorCampo}`);
              
              doc.text(valorCampo, x, y, {
                width: w,
                align: elem.align || 'left',
                continued: false
              });
              break;
              
            case 'imagen':
              console.log('Renderizando imagen');
              try {
                // Comprobar si es una ruta de archivo o una imagen base64
                if (elem.content && elem.content.startsWith('data:image')) {
                  // Es una imagen base64
                  console.log('Imagen base64 detectada');
                  const imgBuffer = await convertirImagenBase64(elem.content);
                  doc.image(imgBuffer, x, y, {
                    width: w,
                    height: h
                  });
                } else {
                  // Es una ruta de archivo
                  const imgPath = path.join(__dirname, '..', '..', 'cliente', elem.content);
                  console.log('Buscando imagen en:', imgPath);
                  if (fs.existsSync(imgPath)) {
                    // Verificar que el archivo sea una imagen válida
                    if (esImagenValida(imgPath)) {
                      doc.image(imgPath, x, y, {
                        width: w,
                        height: h
                      });
                    } else {
                      console.warn(`La imagen ${imgPath} no es un formato válido`);
                    }
                  } else {
                    console.warn(`No se encontró la imagen: ${imgPath}`);
                  }
                }
              } catch (imgError) {
                console.error('Error al procesar imagen:', imgError);
                // Continuar con el siguiente elemento
              }
              break;
              
            case 'foto':
              console.log('Renderizando foto del usuario');
              try {
                // Si es el elemento foto, usar el campo "foto" de los datos
                if (data.foto) {
                  const fotoPath = path.join(__dirname, '..', '..', 'cliente', data.foto);
                  console.log('Buscando foto en:', fotoPath);
                  if (fs.existsSync(fotoPath)) {
                    // Verificar que el archivo sea una imagen válida
                    if (esImagenValida(fotoPath)) {
                      doc.image(fotoPath, x, y, {
                        width: w,
                        height: h,
                        fit: [w, h]
                      });
                    } else {
                      console.warn(`La foto ${fotoPath} no es un formato válido`);
                    }
                  } else {
                    console.warn(`No se encontró la foto: ${fotoPath}`);
                  }
                } else {
                  console.warn('No hay foto en los datos del usuario');
                }
              } catch (fotoError) {
                console.error('Error al procesar foto:', fotoError);
                // Continuar con el siguiente elemento
              }
              break;
              
            case 'rectangulo':
              console.log('Renderizando rectángulo');
              // Guardar estado actual
              const currentStrokeColor = doc._strokeColor;
              const currentFillColorRect = doc._fillColor;
              
              // Dibujar un rectángulo
              if (elem.fillColor) {
                doc.fillColor(parseColor(elem.fillColor));
              }
              if (elem.strokeColor) {
                doc.strokeColor(parseColor(elem.strokeColor));
              }
              doc.rect(x, y, w || 0, h || 0);
              
              if (elem.fillColor && elem.strokeColor) {
                doc.fillAndStroke();
              } else if (elem.fillColor) {
                doc.fill();
              } else {
                doc.stroke();
              }
              
              // Restaurar estado anterior
              if (currentStrokeColor) doc.strokeColor(currentStrokeColor);
              if (currentFillColorRect) doc.fillColor(currentFillColorRect);
              break;
              
            case 'linea':
              console.log('Renderizando línea:', elem.orientation);
              console.log('Color:', elem.lineColor, 'Grosor:', elem.lineWidth);
              
              // Guardar estado actual
              const currentStrokeColorLine = doc._strokeColor;
              const currentLineWidth = doc._lineWidth;
              
              // Establecer color y grosor de línea
              if (elem.lineColor) {
                doc.strokeColor(parseColor(elem.lineColor));
              }
              if (elem.lineWidth) {
                doc.lineWidth(Math.max(0.5, parseFloat(elem.lineWidth) * SCALE_Y) || 1);
              }
              
              if (elem.orientation === 'vertical') {
                // Línea vertical
                const altura = h || 100;
                doc.moveTo(x, y).lineTo(x, y + altura).stroke();
              } else {
                // Línea horizontal (por defecto)
                const ancho = w || 100;
                doc.moveTo(x, y).lineTo(x + ancho, y).stroke();
              }
              
              // Restaurar estado anterior
              if (currentStrokeColorLine) doc.strokeColor(currentStrokeColorLine);
              if (currentLineWidth) doc.lineWidth(currentLineWidth);
              break;
              
            case 'qr':
              console.log('Renderizando código QR (no implementado)');
              // Si se implementa código QR, se haría aquí
              break;
              
            default:
              console.warn('Tipo de elemento no reconocido:', elem.type);
              break;
          }
          
          console.log(`Elemento ${i + 1} renderizado exitosamente`);
        } catch (error) {
          console.error(`Error al renderizar elemento ${i + 1}:`, error);
        }
      }
    };

    // Dibujar primero fondo y luego texto
    await procesar(fondo);
    await procesar(frenteTexto);
  };
  
  // Primera página - Frente de la credencial
  console.log('\n=== RENDERIZANDO FRENTE ===');
  doc.addPage(); // Agregar primera página manualmente
  if (layoutData.frente && Array.isArray(layoutData.frente)) {
    await renderizarElementos(layoutData.frente, data);
  } else {
    console.log('No hay elementos en el frente o no es un array');
  }
  
  // Segunda página - Reverso de la credencial
  console.log('\n=== RENDERIZANDO REVERSO ===');
  doc.addPage(); // Agregar segunda página
  if (layoutData.reverso && Array.isArray(layoutData.reverso)) {
    await renderizarElementos(layoutData.reverso, data);
  } else {
    console.log('No hay elementos en el reverso o no es un array');
  }

  // Finalizar documento
  doc.end();
  console.log('=== PDF GENERADO ===');
  
  // Si es en modo stream, devolver la ruta del archivo
  if (modo !== 'download') {
    return `/uploads/pdfs/credencial_${data.numero_nomina}.pdf`;
  }
}

module.exports = { generarPDF };
