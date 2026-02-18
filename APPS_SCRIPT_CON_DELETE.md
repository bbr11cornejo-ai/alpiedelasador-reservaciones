# 🗑️ Apps Script con función DELETE

## 🔧 **Código Apps Script COMPLETO (con DELETE)**

```javascript
// IDs de configuración
const SHEET_ID = '1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU';
const SHEET_NAME = 'Reservaciones';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    Logger.log('🔵 Datos recibidos: ' + JSON.stringify(data));
    
    // Si viene una petición DELETE
    if (data.action === 'delete' && data.bookingId) {
      return deleteBooking(data.bookingId);
    }
    
    // Abrir el Sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Si no existe la hoja, crearla con encabezados
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 
        'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 
        'URL Comprobante'
      ]);
    }
    
    // Si es la primera fila, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 
        'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 
        'URL Comprobante'
      ]);
    }
    
    // Agregar la fila al Sheet (la URL ya viene desde Cloudinary)
    Logger.log('📊 Guardando en Sheet...');
    sheet.appendRow([
      data.id,
      data.date,
      data.clientName,
      data.phone || '',
      data.reservedQuantity || '',
      data.schedule,
      data.eventType,
      data.duration,
      data.rentalCost,
      data.status,
      data.createdAt,
      data.paymentProofUrl || ''
    ]);
    Logger.log('✅ Fila agregada al Sheet');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación guardada correctamente'
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteBooking(bookingId) {
  try {
    Logger.log('🗑️ Intentando eliminar reservación con ID: ' + bookingId);
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Hoja no encontrada');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColumnIndex = headers.indexOf('ID');
    
    if (idColumnIndex === -1) {
      throw new Error('Columna ID no encontrada');
    }
    
    // Buscar la fila con el ID especificado (empezando desde la fila 2, la 1 es el encabezado)
    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][idColumnIndex]);
      if (rowId === String(bookingId)) {
        // Eliminar la fila (i+1 porque las filas en Sheets empiezan en 1, no en 0)
        sheet.deleteRow(i + 1);
        Logger.log('✅ Reservación eliminada');
        
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Reservación eliminada correctamente'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Si no se encontró el ID
    Logger.log('⚠️ ID no encontrado: ' + bookingId);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Reservación no encontrada'
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ ERROR al eliminar: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
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
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: bookings
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 📋 **PASOS PARA ACTUALIZAR:**

1. **Ve a tu Apps Script:** https://script.google.com/home
2. **Abre tu proyecto** (el que usaste para las reservaciones)
3. **Borra TODO el código anterior**
4. **Copia y pega el código de arriba**
5. **Guardar** (💾 o Ctrl+S)
6. **Implementar** → **Administrar implementaciones**
7. Haz clic en **✏️ Editar** en la implementación activa
8. Selecciona **Nueva versión** en el menú desplegable
9. **Implementar**

---

## ✅ **¿Qué hace ahora?**

- **POST sin `action`**: Guarda una nueva reservación (como antes)
- **POST con `action: 'delete'` y `bookingId`**: Elimina la reservación por ID
- **GET**: Obtiene todas las reservaciones (como antes)

---

**⚠️ IMPORTANTE:** Después de implementar, **NO cambies la URL**. La URL del Apps Script sigue siendo la misma.


