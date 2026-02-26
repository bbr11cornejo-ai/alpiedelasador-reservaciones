# 📝 Apps Script COMPLETO - Al Pie del Asador

## Código completo con soporte para todas las operaciones

Copia este código EXACTO en tu Google Apps Script:

```javascript
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById('1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU');
    let sheet = ss.getSheetByName('Reservaciones');
    
    // Si no existe la hoja, crearla con el orden correcto
    if (!sheet) {
      sheet = ss.insertSheet('Reservaciones');
      sheet.appendRow(['ID', 'Fecha', 'Cliente', 'Teléfono', 'Horario', 'Cantidad reservada $', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 'URL Comprobante', 'ID Carpeta Drive', 'Pagado']);
    }
    
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'create';
    
    // CREAR nueva reservación
    if (!action || action === 'create') {
      sheet.appendRow([
        data.id,
        data.date,
        data.clientName,
        data.phone || '',
        data.schedule || '',
        data.reservedQuantity || '',
        data.eventType || '',
        data.duration || '',
        data.rentalCost || '',
        data.status || 'reserved',
        data.createdAt,
        data.paymentProofUrl || '',
        data.clientFolderId || '',
        ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación creada correctamente'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ACTUALIZAR reservación existente
    if (action === 'update') {
      const bookingId = data.bookingId || data.id;
      const dataValues = sheet.getDataRange().getValues();
      const headers = dataValues[0];
      const idColumnIndex = headers.indexOf('ID');
      
      if (idColumnIndex === -1) {
        throw new Error('Columna ID no encontrada');
      }
      
      // Buscar la fila con el ID
      let rowIndex = -1;
      for (let i = 1; i < dataValues.length; i++) {
        if (String(dataValues[i][idColumnIndex]) === String(bookingId)) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Reservación no encontrada con ID: ' + bookingId);
      }
      
      // Obtener valores originales
      const originalCreatedAt = dataValues[rowIndex - 1][headers.indexOf('Creado')];
      const originalPaymentProof = dataValues[rowIndex - 1][headers.indexOf('URL Comprobante')] || '';
      const originalFolderId = dataValues[rowIndex - 1][headers.indexOf('ID Carpeta Drive')] || '';
      
      // Buscar columna Pagado (con o sin espacio)
      let pagadoIndex = headers.indexOf('Pagado');
      if (pagadoIndex === -1) {
        pagadoIndex = headers.indexOf('Pagado ');
      }
      const originalPagado = pagadoIndex !== -1 ? dataValues[rowIndex - 1][pagadoIndex] : '';
      
      sheet.getRange(rowIndex, 1, 1, 14).setValues([[
        bookingId,
        data.date,
        data.clientName,
        data.phone || '',
        data.schedule || '',
        data.reservedQuantity || '',
        data.eventType || '',
        data.duration || '',
        data.rentalCost || '',
        data.status || 'reserved',
        originalCreatedAt,
        data.paymentProofUrl || originalPaymentProof,
        data.clientFolderId || originalFolderId,
        originalPagado
      ]]);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación actualizada correctamente'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ELIMINAR reservación
    if (action === 'delete') {
      const bookingId = data.bookingId;
      const dataValues = sheet.getDataRange().getValues();
      const headers = dataValues[0];
      const idColumnIndex = headers.indexOf('ID');
      
      if (idColumnIndex === -1) {
        throw new Error('Columna ID no encontrada');
      }
      
      let rowIndex = -1;
      for (let i = 1; i < dataValues.length; i++) {
        if (String(dataValues[i][idColumnIndex]) === String(bookingId)) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Reservación no encontrada');
      }
      
      sheet.deleteRow(rowIndex);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación eliminada correctamente'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // MARCAR COMO PAGADO
    if (action === 'markPaid') {
      const bookingId = data.bookingId;
      const dataValues = sheet.getDataRange().getValues();
      const headers = dataValues[0];
      const idColumnIndex = headers.indexOf('ID');
      
      // Buscar columna Pagado (con o sin espacio)
      let pagadoColumnIndex = headers.indexOf('Pagado');
      if (pagadoColumnIndex === -1) {
        pagadoColumnIndex = headers.indexOf('Pagado ');
      }
      
      if (idColumnIndex === -1 || pagadoColumnIndex === -1) {
        throw new Error('Columnas necesarias no encontradas. Pagado index: ' + pagadoColumnIndex);
      }
      
      let rowIndex = -1;
      for (let i = 1; i < dataValues.length; i++) {
        if (String(dataValues[i][idColumnIndex]) === String(bookingId)) {
          rowIndex = i + 1;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Reservación no encontrada');
      }
      
      sheet.getRange(rowIndex, pagadoColumnIndex + 1).setValue('SÍ');
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación marcada como pagada'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Acción no reconocida: ' + action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById('1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU');
    const sheet = ss.getSheetByName('Reservaciones');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const bookings = rows.map(row => {
      const booking = {};
      headers.forEach((header, index) => {
        booking[header] = row[index];
      });
      return booking;
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: bookings
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 📋 PASOS PARA ACTUALIZAR:

1. **Abre tu Google Sheet de Reservaciones**
2. **Ve a Extensiones → Apps Script**
3. **BORRA TODO el código actual**
4. **PEGA el código de arriba**
5. **Guarda** (Ctrl+S)
6. **Click en "Implementar" → "Administrar implementaciones"**
7. **Click en el ícono de lápiz (✏️) de tu implementación actual**
8. **Click en "Nueva versión"**
9. **Click en "Implementar"**

## ✅ Cambios importantes:

1. ✅ Agregada columna "Pagado" en los encabezados
2. ✅ Soporte completo para acción `update` (editar reservación)
3. ✅ Soporte completo para acción `delete` (eliminar reservación)
4. ✅ Soporte completo para acción `markPaid` (marcar como pagado)
5. ✅ Al actualizar, mantiene valores originales de ID, Creado, y campos opcionales

**IMPORTANTE:** Después de actualizar el script, verifica que tu hoja tenga la columna "Pagado" al final. Si no la tiene, agrégala manualmente.
