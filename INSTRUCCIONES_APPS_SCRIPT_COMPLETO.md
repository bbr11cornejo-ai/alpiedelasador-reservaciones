# 📝 Apps Script COMPLETO - Al Pie del Asador

## Código completo con soporte para todas las operaciones

Copia este código EXACTO en tu Google Apps Script:

```javascript
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById('1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU');
    let sheet = ss.getSheetByName('Reservaciones');
    
    // Si no existe la hoja, crearla
    if (!sheet) {
      sheet = ss.insertSheet('Reservaciones');
      sheet.appendRow(['ID', 'Fecha', 'Cliente', 'Teléfono', 'Cantidad reservada $', 'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 'URL Comprobante', 'ID Carpeta Drive', 'Pagado']);
    }
    
    // Si es la primera fila, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['ID', 'Fecha', 'Cliente', 'Teléfono', 'Cantidad reservada $', 'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 'URL Comprobante', 'ID Carpeta Drive', 'Pagado']);
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
        data.reservedQuantity || '',
        data.schedule || '',
        data.eventType || '',
        data.duration || '',
        data.rentalCost || '',
        data.status || 'reserved',
        data.createdAt,
        data.paymentProofUrl || '',
        data.clientFolderId || '',
        '' // Pagado por defecto vacío
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
          rowIndex = i + 1; // +1 porque las filas en Sheets son 1-indexed
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error('Reservación no encontrada con ID: ' + bookingId);
      }
      
      // Actualizar la fila (mantener ID y Creado originales)
      const originalCreatedAt = dataValues[rowIndex - 1][headers.indexOf('Creado')];
      const originalPaymentProof = dataValues[rowIndex - 1][headers.indexOf('URL Comprobante')] || '';
      const originalFolderId = dataValues[rowIndex - 1][headers.indexOf('ID Carpeta Drive')] || '';
      const originalPagado = dataValues[rowIndex - 1][headers.indexOf('Pagado')] || '';
      
      sheet.getRange(rowIndex, 1, 1, 14).setValues([[
        bookingId, // Mantener ID original
        data.date,
        data.clientName,
        data.phone || '',
        data.reservedQuantity || '',
        data.schedule || '',
        data.eventType || '',
        data.duration || '',
        data.rentalCost || '',
        data.status || 'reserved',
        originalCreatedAt, // Mantener fecha de creación original
        data.paymentProofUrl || originalPaymentProof, // Mantener foto si no se subió una nueva
        data.clientFolderId || originalFolderId,
        originalPagado // Mantener estado de Pagado
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
      
      // Buscar la fila con el ID
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
      const pagadoColumnIndex = headers.indexOf('Pagado');
      
      if (idColumnIndex === -1 || pagadoColumnIndex === -1) {
        throw new Error('Columnas necesarias no encontradas');
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
        throw new Error('Reservación no encontrada');
      }
      
      // Actualizar solo la columna de Pagado
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
