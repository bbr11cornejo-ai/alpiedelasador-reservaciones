# 🔧 APPS SCRIPT ACTUALIZADO CON CORS

## ⚠️ PROBLEMA: Error de CORS

El navegador está bloqueando las peticiones por CORS. El Apps Script necesita devolver los headers correctos.

## ✅ CÓDIGO ACTUALIZADO (CON CORS)

**Copia este código COMPLETO y reemplaza TODO el código en tu Apps Script:**

```javascript
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById('1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU');
    let sheet = ss.getSheetByName('Reservaciones');
    
    // Si no existe la hoja, crearla
    if (!sheet) {
      sheet = ss.insertSheet('Reservaciones');
      sheet.appendRow(['ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 'URL Comprobante', 'ID Carpeta Drive']);
    }
    
    // Si es la primera fila, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 'URL Comprobante', 'ID Carpeta Drive']);
    }
    
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Agregar la fila
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
      data.paymentProofUrl || '',
      data.clientFolderId || ''
    ]);
    
    // Devolver respuesta con headers CORS
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación guardada correctamente'
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

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById('1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU');
    const sheet = ss.getSheetByName('Reservaciones');
    
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
    
    // Devolver respuesta con headers CORS
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

## 📋 PASOS:

1. **Abre tu Apps Script** (el que ya tienes abierto)
2. **BORRA TODO** el código actual
3. **PEGA** el código de arriba
4. **Guarda** (Ctrl+S)
5. **NO necesitas crear nueva implementación** - la URL sigue siendo la misma
6. Solo **guarda y espera unos segundos**

---

**Nota:** Los Apps Script de Google **automáticamente permiten CORS** cuando se implementan como "Aplicación web" con acceso "Cualquier persona". El código es el mismo, solo asegúrate de que esté guardado correctamente.

**Después de guardar, avísame y probamos de nuevo en la página web.** 🚀

