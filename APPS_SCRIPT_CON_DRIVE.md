# 📸 Apps Script con Google Drive - CÓDIGO COMPLETO

## 🔧 **Código para Google Apps Script**

Copia y pega este código COMPLETO en tu Apps Script:

```javascript
// IDs de configuración
const SHEET_ID = '1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU';
const DRIVE_FOLDER_ID = '15C_imJPH0qXUtrlWyxTiQb2EbIEXT5Z2';
const SHEET_NAME = 'Reservaciones';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Abrir el Sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Si no existe la hoja, crearla con encabezados
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 
        'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 
        'URL Comprobante', 'ID Carpeta Drive'
      ]);
    }
    
    // Si es la primera fila, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID', 'Fecha', 'Cliente', 'Telefono', 'Cantidad reservada $', 
        'Horario', 'Tipo de Evento', 'Duración', 'Costo', 'Estado', 'Creado', 
        'URL Comprobante', 'ID Carpeta Drive'
      ]);
    }
    
    let paymentProofUrl = '';
    let clientFolderId = '';
    
    // Si hay foto, subirla a Google Drive
    if (data.paymentProofBase64 && data.paymentProofFileName) {
      try {
        Logger.log('📷 Subiendo foto a Google Drive...');
        
        // Obtener carpeta principal
        const mainFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        
        // Crear carpeta del cliente: NombreCliente_Telefono
        const clientFolderName = `${data.clientName}_${data.phone}`.replace(/[^a-z0-9_]/gi, '_');
        const clientFolder = mainFolder.createFolder(clientFolderName);
        clientFolderId = clientFolder.getId();
        
        // Decodificar Base64 y crear archivo
        const blob = Utilities.newBlob(
          Utilities.base64Decode(data.paymentProofBase64),
          'image/jpeg',
          data.paymentProofFileName
        );
        
        const file = clientFolder.createFile(blob);
        
        // Hacer el archivo público
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Obtener URL pública
        paymentProofUrl = file.getUrl();
        
        Logger.log('✅ Foto subida correctamente: ' + paymentProofUrl);
      } catch (driveError) {
        Logger.log('❌ Error subiendo a Drive: ' + driveError.toString());
        // Continuar guardando aunque falle la foto
      }
    }
    
    // Agregar la fila al Sheet
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
      paymentProofUrl,
      clientFolderId
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación guardada correctamente',
        paymentProofUrl: paymentProofUrl,
        clientFolderId: clientFolderId
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ Error general: ' + error.toString());
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

## 📋 **PASOS PARA IMPLEMENTAR:**

### **1. Ve a tu Google Apps Script**
- Abre tu Google Sheet
- **Extensiones** → **Apps Script**

### **2. Reemplaza TODO el código**
- **BORRA TODO** el código actual
- **PEGA** el código de arriba

### **3. Guarda y despliega**
- Click en **💾 Guardar**
- Click en **Implementar** → **Nueva implementación**
- **Tipo:** Aplicación web
- **Ejecutar como:** Yo (tu correo)
- **Quién tiene acceso:** **Cualquier persona**
- Click **Implementar**
- **Autoriza los permisos** (te pedirá permisos de Drive)

### **4. Copia la URL**
La URL debe verse así:
```
https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec
```

### **5. Pégame la nueva URL aquí**
Y la actualizo en el proyecto.

---

## ✅ **¿Qué hace este código?**

1. ✅ Recibe la foto en Base64 desde el frontend
2. ✅ Crea carpeta en Drive: `NombreCliente_Telefono`
3. ✅ Sube la foto a esa carpeta
4. ✅ Hace la foto pública (Anyone with link)
5. ✅ Guarda la URL de la foto en el Excel
6. ✅ Guarda el ID de la carpeta en el Excel
7. ✅ Retorna la URL al frontend

---

**¿Puedes copiar el código, implementarlo y darme la nueva URL?** 🎯


