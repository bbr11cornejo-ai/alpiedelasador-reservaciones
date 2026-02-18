// IDs de configuración
const SHEET_ID = '1A0reKhErc1MziKDIHmw5Iek0fz7cHljOm4iY-QPAVTU';
const DRIVE_FOLDER_ID = '15C_imJPH0qXUtrlWyxTiQb2EbIEXT5Z2';
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
        Logger.log('📷 Intentando subir foto a Google Drive...');
        Logger.log('📷 Nombre archivo: ' + data.paymentProofFileName);
        Logger.log('📷 Tamaño Base64: ' + data.paymentProofBase64.length + ' caracteres');
        
        // Verificar acceso a Drive
        Logger.log('🔑 Verificando acceso a Drive...');
        const mainFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        Logger.log('✅ Acceso a carpeta principal OK: ' + mainFolder.getName());
        
        // Crear carpeta del cliente: NombreCliente_Telefono
        const clientFolderName = (data.clientName + '_' + data.phone).replace(/[^a-z0-9_]/gi, '_');
        Logger.log('📁 Creando carpeta: ' + clientFolderName);
        
        const clientFolder = mainFolder.createFolder(clientFolderName);
        clientFolderId = clientFolder.getId();
        Logger.log('✅ Carpeta creada: ' + clientFolderId);
        
        // Decodificar Base64 y crear archivo
        Logger.log('🔄 Decodificando Base64...');
        const decodedData = Utilities.base64Decode(data.paymentProofBase64);
        Logger.log('✅ Base64 decodificado');
        
        // Determinar tipo MIME desde el nombre del archivo
        let mimeType = 'image/jpeg';
        const fileName = data.paymentProofFileName.toLowerCase();
        if (fileName.endsWith('.png')) {
          mimeType = 'image/png';
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } else if (fileName.endsWith('.gif')) {
          mimeType = 'image/gif';
        } else if (fileName.endsWith('.webp')) {
          mimeType = 'image/webp';
        }
        
        Logger.log('📝 Creando blob con MIME type: ' + mimeType);
        const blob = Utilities.newBlob(decodedData, mimeType, data.paymentProofFileName);
        Logger.log('✅ Blob creado');
        
        Logger.log('⬆️ Subiendo archivo a Drive...');
        const file = clientFolder.createFile(blob);
        Logger.log('✅ Archivo subido: ' + file.getName());
        
        // Hacer el archivo público
        Logger.log('🔓 Haciendo archivo público...');
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        Logger.log('✅ Archivo público');
        
        // Obtener URL pública
        paymentProofUrl = file.getUrl();
        Logger.log('✅ URL generada: ' + paymentProofUrl);
        
      } catch (driveError) {
        Logger.log('❌ ERROR en Drive: ' + driveError.toString());
        Logger.log('❌ Stack: ' + driveError.stack);
        // Continuar guardando aunque falle la foto
        paymentProofUrl = 'ERROR: ' + driveError.toString();
      }
    } else {
      Logger.log('⚠️ No se recibió foto (Base64 o nombre de archivo faltante)');
    }
    
    // Agregar la fila al Sheet
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
      paymentProofUrl,
      clientFolderId
    ]);
    Logger.log('✅ Fila agregada al Sheet');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Reservación guardada correctamente',
        paymentProofUrl: paymentProofUrl,
        clientFolderId: clientFolderId
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ ERROR GENERAL: ' + error.toString());
    Logger.log('❌ Stack: ' + error.stack);
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


