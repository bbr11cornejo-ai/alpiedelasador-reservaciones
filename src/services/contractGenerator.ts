import jsPDF from 'jspdf';
import { Booking } from '@/types/booking';

export const generateContract = (booking: Booking): string => {
  try {
    console.log('🔵 Generando contrato para:', booking.clientName);
    const doc = new jsPDF();
    
    // Configuración de márgenes y dimensiones
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const lineHeight = 5;
    let currentY = 20;

    // Logo/Título (simulado con texto)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 102, 0); // Naranja para "Al Pie"
    doc.text('Al Pie', margin, currentY);
    doc.setTextColor(0, 0, 0); // Negro para "DEL ASADOR"
    doc.text(' DEL ASADOR', margin + 17, currentY);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('El lugar para tus eventos', margin, currentY + 4);
    currentY += 15;

    // Título del contrato
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRATO DE PRESTACIÓN DE SERVICIOS', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Preparar datos del evento
    const eventDate = new Date(booking.date + 'T12:00:00');
    const formattedDate = eventDate.toLocaleDateString('es-MX', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Texto del contrato
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const paragraph1 = `En base a el presente contrato de prestación de servicios se celebra el presente acuerdo entre la empresa Al pie del asador representada en este acto por el Lic. Adolfo Campos Alvarado y el señor ${booking.clientName}`;
    
    const paragraph2 = `Quien afirma que es su deseo contratar el servicio de Alquiler por horas de un espacio para la realización de un festejo social, el espacio objeto de este alquiler lo ofrece la marca comercial registrada y se ubica en los patios abiertos del domicilio ubicado en calle Santiago Roel número 217 colonia Burócratas del Estado en Monterrey Nuevo León.`;
    
    const paragraph3 = `La Renta del espacio abierto será específicamente para el evento social que se realizara por el contratante ${booking.clientName} del mes ${formattedDate} del año ${eventDate.getFullYear()}`;
    
    const paragraph4 = `En el horario inicial de ${booking.schedule.split(' - ')[0]} horas para finalizar las ${booking.schedule.split(' - ')[1] || booking.schedule} horas`;
    
    const paragraph5 = `La renta es por un término de ${booking.duration} horas de alquiler.`;
    
    const paragraph6 = `El costo de la renta del espacio estipulado por las partes será de $${booking.rentalCost.toFixed(2)} 00/100m.n. como cantidad única total a pagar.`;
    
    // Calcular anticipo y pago restante
    const anticipo = typeof booking.reservedQuantity === 'number' ? booking.reservedQuantity : parseFloat(booking.reservedQuantity) || 0;
    const pagoRestante = booking.rentalCost - anticipo;
    
    const paragraph7 = `El anticipo que se otorga para separación del espacio es de $${anticipo.toFixed(2)} 00/100 M.n.`;
    
    const paragraph8 = `Teniendo como restante la cantidad de $${pagoRestante.toFixed(2)} 00/100 M.N. a pagarse a más tardar 3 días antes de la fecha del evento reservado.`;

    // Procesar cada párrafo
    const paragraphs = [paragraph1, paragraph2, paragraph3, paragraph4, paragraph5, paragraph6, paragraph7, paragraph8];
    
    paragraphs.forEach((paragraph, index) => {
      const lines = doc.splitTextToSize(paragraph, pageWidth - margin * 2);
      lines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      });
      currentY += 3; // Espacio entre párrafos
    });

    currentY += 3;

    // Lista de servicios incluidos
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('El costo ya determinado incluye los siguientes servicios:', margin, currentY);
    currentY += 7;

    const services = [
      '1.-Renta del espacio para festejo social del contratante',
      '2.- 4 mesas rectangulares para invitados',
      '3.- 1 mesa rectangular para bienvenida o regalos',
      '4.- Uso de hasta 50 sillas disponibles para evento, según necesidades del cliente',
      '5.- Uso de ALBERCA durante el tiempo contratado en temporada de verano',
      '6.- Un rollo de papel higiénico por baño y jabón de manos',
      '7.- Uso de asador',
      '8.- Uso de hielera',
      '9.- Uso de microondas',
      '10.- Uso de Frigobar',
      '12.-Limpieza y montaje antes y limpieza y desmontaje después de fostejo.'
    ];

    services.forEach((service) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      const lines = doc.splitTextToSize(service, pageWidth - margin * 2 - 5);
      lines.forEach((line: string) => {
        doc.text(line, margin + 2, currentY);
        currentY += lineHeight;
      });
    });

    // Nueva página para cláusulas
    doc.addPage();
    currentY = 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLÁUSULAS', margin, currentY);
    currentY += 7;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const clauses = [
      '1.- SE ENTREGA EL LUGAR MÁXIMO CON UNA HORA DE ANTICIPACIÓN PARA DECORACIÓN E INGRESO DE ARTÍCULOS DEL EVENTO (No avisados) (No aplica en eventos que comiencen antes de las 12 del mediodía)',
      '2.- EL CLIENTE DEBE TRAER MANTELES, SERVILLETAS, VASOS, PLATOS, CUBIERTOS, ARTÍCULOS, HIELO Y TODO LO REFERENTE A SU EVENTO (NO SON RESPONSABILIDAD DEL ARRENDADOR)',
      '3.- NO SE PERMITE ACCESO DE CERVEZA EN ENVASE DE VIDRIO',
      '4.- 15 MIN DE TOLERANCIA MÁXIMA PARA LANZAR PASADAS ESE TÉRMINO SE COBRARA HORA ADICIONAL',
      '5.- COSTO DE HORA EXTRA $400 PESOS, NOS RESERVAMOS DERECHO DE OTORGAR HORA EXTRA SEGÚN COMPROMISO PARA ESE DÍA',
      '6.- CUALQUIER ELEMENTO, VASO, PLATO, CRISTAL O MANTEL QUE SUFRA ALGÚN DAÑO POR PARTE DEL EVENTO O LOS INVITADOS ES RESPONSABILIDAD DEL CLIENTE, SE COBRARA LA CANTIDAD DE 1500.00 (MIL QUINIENTOS PESOS 00/100 M.N.) O LO QUE SE REQUIERA SEGÚN EL ACCIDENTE SUSCITADO DENTRO DE LAS INSTALACIONES CONTRATADAS DURANTE SU EVENTO.',
      '7.- USO DE ALBERCA SUJETO A TRAE DE BAÑO, PROHIBIDO INGRESAR A ALBERCA CON MEZCLILLA, Ropa de digedro, ZAPATOS O ROPA, DAÑAN LAS BOMBAS',
      '8.- NO NOS HACEMOS RESPONSABLES DE ACCIDENTES SUSCITADOS EN LAS INSTALACIONES CAUSADAS POR NEGLIGENCIA O IRRESPONSABILIDAD DE LAS INSTALACIONES DURANTE SU EVENTO.',
      '9.- NO NOS HACEMOS RESPONSABLES DE OBJETOS OLVIDADOS EN LAS INSTALACIONES DESPUÉS DE RECIBIDO EL MISMO.',
      '10.- SE COBRARA LA CANTIDAD DE 300 PESOS EN EL SUPUESTO DE QUE LOS MANTELES SUFRAN DETERIOROS IRREVERSIBLES POR ACCIÓN O CIRCUNSTANCIA QUE IMPIDAN SU USO NUEVAMENTE.',
      '11.- NO SE PERMITE EL USO DE PAPEL CREPE NI PAPEL CHINA YA QUE DEJAN MARCAS EN EL SUELO'
    ];

    clauses.forEach((clause) => {
      const lines = doc.splitTextToSize(clause, pageWidth - margin * 2);
      lines.forEach((line: string) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, margin, currentY);
        currentY += 4.5;
      });
      currentY += 2;
    });

    // Firmas en la última página
    if (currentY > 220) {
      doc.addPage();
      currentY = 40;
    } else {
      currentY += 20;
    }

    const signatureY = currentY;
    const signatureWidth = 70;
    const leftSignatureX = margin + 5;
    const rightSignatureX = pageWidth - margin - signatureWidth - 5;

    // Espacio para firmas - Líneas más gruesas y visibles
    doc.setLineWidth(0.5);
    doc.line(leftSignatureX, signatureY, leftSignatureX + signatureWidth, signatureY);
    doc.line(rightSignatureX, signatureY, rightSignatureX + signatureWidth, signatureY);

    // Etiquetas de firma
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('NOMBRE Y FIRMA CLIENTE', leftSignatureX + signatureWidth / 2, signatureY + 6, { align: 'center' });
    
    doc.text('NOMBRE Y FIRMA REPRESENTANTE DE', rightSignatureX + signatureWidth / 2, signatureY + 6, { align: 'center' });
    doc.text('AL PIE DEL ASADOR', rightSignatureX + signatureWidth / 2, signatureY + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('TELÉFONO: 8118166128', rightSignatureX + signatureWidth / 2, signatureY + 14, { align: 'center' });

    // Generar el PDF como Data URL
    const totalPages = doc.getNumberOfPages();
    console.log(`✅ PDF generado correctamente con ${totalPages} página(s)`);
    const pdfUrl = doc.output('dataurlstring');
    return pdfUrl;
  } catch (error) {
    console.error('❌ Error generando contrato:', error);
    throw error;
  }
};

