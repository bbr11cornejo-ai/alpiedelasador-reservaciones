# ✅ **INSTRUCCIONES FINALES - Marcar como Pagado**

## 🎯 **¿Qué hace esta funcionalidad?**

Cuando abres una reservación existente y haces clic en **"✓ Marcar como Pagado"**, se actualiza en **Google Sheets** la columna **"Pagado"** a **"SÍ"**.

Al recargar la página, la reservación seguirá mostrando el badge **"✓ Pagado"** porque está guardado en Google Sheets.

---

## 📋 **PASOS OBLIGATORIOS:**

### **1. Agregar columna "Pagado" en Google Sheets**

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU/edit
2. Ve a la pestaña **"Reservaciones"**
3. En la columna **M** (después de "URL Comprobante"), escribe el header:
   ```
   Pagado
   ```
4. **Guarda** (Ctrl+S o automático)

---

### **2. Actualizar el código del Apps Script**

1. **Ve a tu Apps Script:** https://script.google.com/home
2. **Abre tu proyecto** (el que tiene la URL `AKfycbz7TUOS3SwGq0wpkmE6CNZ5AJTPfEqsvYumBZrs67osymcYx7h_JM_8Mo-Edb9B6hPuMg`)
3. **Selecciona TODO el código** (Ctrl+A)
4. **Borra** (Delete)
5. **Pega el código nuevo** del archivo `APPS_SCRIPT_CON_PAGADO.md` (Ctrl+V)
6. **Guardar** (💾 o Ctrl+S)
7. **Implementar** → **Administrar implementaciones** → **✏️ Editar** → **Nueva versión** → **Implementar**

---

## 🧪 **PRUEBA:**

1. **Recarga tu página:** https://quinta-calendar-pro-main.vercel.app
2. **Abre una reservación existente**
3. **Haz clic en "✓ Marcar como Pagado"**
4. **Confirma** en el diálogo
5. **Verifica:**
   - ✅ Aparece el badge verde **"✓ Pagado"** al lado del título
   - ✅ El botón desaparece
   - ✅ En Google Sheets, la columna **"Pagado"** de esa fila dice **"SÍ"**
6. **Recarga la página** (F5)
7. **Abre la misma reservación**
8. **Verifica:**
   - ✅ El badge **"✓ Pagado"** sigue apareciendo (porque está guardado)

---

## 🔧 **Código del Apps Script (COMPLETO):**

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
    
    // Si viene una petición MARK PAID
    if (data.action === 'markPaid' && data.bookingId) {
      return markBookingAsPaid(data.bookingId);
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
        'URL Comprobante', 'Pagado'
      ]);
    }
    
    // Si es la primera fila, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 
        'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 
        'URL Comprobante', 'Pagado'
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
      data.paymentProofUrl || '',
      'NO' // Por defecto no está pagado
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
    
    // Buscar la fila con el ID especificado
    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][idColumnIndex]);
      if (rowId === String(bookingId)) {
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

function markBookingAsPaid(bookingId) {
  try {
    Logger.log('💰 Intentando marcar reservación como pagada con ID: ' + bookingId);
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Hoja no encontrada');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColumnIndex = headers.indexOf('ID');
    const paidColumnIndex = headers.indexOf('Pagado');
    
    if (idColumnIndex === -1) {
      throw new Error('Columna ID no encontrada');
    }
    
    if (paidColumnIndex === -1) {
      throw new Error('Columna Pagado no encontrada');
    }
    
    // Buscar la fila con el ID especificado
    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][idColumnIndex]);
      if (rowId === String(bookingId)) {
        // Marcar como pagado (i+1 porque las filas empiezan en 1)
        sheet.getRange(i + 1, paidColumnIndex + 1).setValue('SÍ');
        Logger.log('✅ Reservación marcada como pagada');
        
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Reservación marcada como pagada correctamente'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    Logger.log('⚠️ ID no encontrado: ' + bookingId);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Reservación no encontrada'
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ ERROR al marcar como pagado: ' + error.toString());
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

## 🎯 **Resumen:**

1. ✅ **Página web desplegada:** https://quinta-calendar-pro-main.vercel.app
2. ⚠️ **Falta:** Agregar columna "Pagado" en Google Sheets
3. ⚠️ **Falta:** Actualizar Apps Script con el código nuevo

Una vez completes estos 2 pasos, ¡todo funcionará perfectamente! 💰✨


