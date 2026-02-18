# ✅ SOLUCIÓN CORRECTA: Apps Script para Google Sheets

## 📝 **Código Apps Script CORREGIDO**

Este código debe ir en tu Apps Script de Google Sheets.

### **IMPORTANTE: Verifica que NO tenga comillas tipográficas (" ")**

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

---

## ⚙️ **PASOS CRÍTICOS PARA QUE FUNCIONE:**

### **1. Copia este código EXACTO en Apps Script**
- Ve a tu Google Sheet → **Extensiones** → **Apps Script**
- **BORRA TODO** el código que esté ahí
- **PEGA** el código de arriba

### **2. Implementar como Web App**
1. Click en **"Implementar"** (arriba a la derecha)
2. **"Nueva implementación"**
3. Configuración:
   - **Tipo:** Aplicación web
   - **Ejecutar como:** Yo (tu correo)
   - **Quién tiene acceso:** **Cualquier persona** ← MUY IMPORTANTE
4. Click **"Implementar"**
5. **Autoriza los permisos** cuando te los pida
6. Copia la **URL de implementación web**

### **3. Pégame la nueva URL aquí**

La URL debe verse así:
```
https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec
```

---

## 🔍 **Si sigue sin funcionar, verifica:**

1. ✅ El Sheet ID es correcto: `1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU`
2. ✅ La pestaña se llama "Reservaciones" (sin espacios extra)
3. ✅ La implementación está en modo **"Cualquier persona"**
4. ✅ Autorizaste todos los permisos que Google te pidió

---

**¿Puedes copiar el código, crear una nueva implementación y pegarme la nueva URL?**

