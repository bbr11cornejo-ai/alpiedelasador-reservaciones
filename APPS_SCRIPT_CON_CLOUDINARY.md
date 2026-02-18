# 📸 Apps Script SIMPLIFICADO con Cloudinary

## 🔧 **Código Apps Script (NUEVO - MÁS SIMPLE)**

Ahora el Apps Script solo guarda la URL que Cloudinary ya generó.

```javascript
// IDs de configuración
const SHEET_ID = '1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU';
const SHEET_NAME = 'Reservaciones';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    Logger.log('🔵 Datos recibidos: ' + JSON.stringify(data));
    
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

## 📋 **PASOS:**

1. **Copia el código de arriba**
2. **Apps Script** → Pega y reemplaza
3. **Guardar** (💾)
4. **Implementar** → **Administrar implementaciones** → Editar (✏️) → **Nueva versión** → **Implementar**

---

✅ **Ahora es MUCHO más simple:**
- No hay código de Drive
- No hay Base64
- Solo guarda la URL que Cloudinary ya generó

**¡Mucho más rápido y confiable!** 🚀


