# 🔧 Solución: Google Apps Script para API Key

Como la API Key simple no permite escritura directa, vamos a usar **Google Apps Script** como intermediario.

## 📝 **PASO 1: Crear el Script en Google Sheets**

1. **Abre tu Google Sheet:**
   https://docs.google.com/spreadsheets/d/1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU/edit

2. **Abre el editor de Apps Script:**
   - Click en **Extensiones** → **Apps Script**

3. **Pega este código:**

\`\`\`javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservaciones');
    
    // Si no existe la hoja, crearla
    if (!sheet) {
      const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Reservaciones');
      // Agregar encabezados
      newSheet.appendRow(['ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 'URL Comprobante', 'ID Carpeta Drive']);
      return ContentService.createTextOutput(JSON.stringify({success: true, message: 'Hoja creada'}));
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
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Reservación guardada correctamente'
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservaciones');
    
    if (!sheet) {
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
\`\`\`

4. **Implementar el Script:**
   - Click en el icono **"Implementar"** (arriba a la derecha)
   - Selecciona **"Nueva implementación"**
   - Tipo: **"Aplicación web"**
   - Ejecutar como: **"Yo"**
   - Quién tiene acceso: **"Cualquier persona"**
   - Click en **"Implementar"**
   - **Copia la URL** que te da (será algo como: `https://script.google.com/macros/s/.../exec`)

5. **Autorizar el script:**
   - Te pedirá permisos
   - Click en **"Revisar permisos"**
   - Selecciona tu cuenta
   - Click en **"Avanzado"**
   - Click en **"Ir a [nombre del proyecto]"**
   - Click en **"Permitir"**

---

## 📝 **PASO 2: Actualizar el Código**

Guarda la URL del script y te actualizaré el código para usarla.

**¿Ya creaste el script y tienes la URL?** Compártela y actualizo el código inmediatamente.

---

## 🎯 **¿Por qué esta solución?**

- ✅ **Funciona con API Key simple**
- ✅ **No requiere Service Account**
- ✅ **Fácil de implementar**
- ✅ **Seguro** (Google maneja la autenticación)
- ✅ **Permite leer y escribir**

---

**Alternativa más rápida:** Si prefieres, puedo configurar el sistema para que funcione completamente sin Google Sheets por ahora, guardando todo en el navegador (localStorage). ¿Qué prefieres?

