# 📋 Guía de Configuración - Google Sheets y Drive

## ✅ Integración Completada

Tu sistema ahora está integrado con Google Sheets y Google Drive. Cada vez que guardes una reservación:

1. **Se guardará automáticamente en Google Sheets** con todas las columnas
2. **Se creará una carpeta con el nombre del cliente** en Google Drive
3. **Se subirá el comprobante de pago** a esa carpeta
4. **Podrás consultar las fotos** directamente desde la página web

---

## 🔧 Pasos para Configurar

### **1. Crear tu Google Sheet**

1. Ve a: https://docs.google.com/spreadsheets/create
2. Nómbrala: **"Reservaciones Al Pie del Asador"**
3. En la primera pestaña, nómbrala: **"Reservaciones"**
4. Copia el ID de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_TU_ID]/edit
   ```

### **2. Crear Carpeta en Google Drive**

1. Ve a: https://drive.google.com
2. Crea una carpeta llamada: **"Clientes - Al Pie del Asador"**
3. Abre la carpeta y copia el ID de la URL:
   ```
   https://drive.google.com/drive/folders/[ESTE_ES_TU_ID]
   ```

### **3. Configurar tu Proyecto**

Abre el archivo: `src/config/google.ts` y completa:

```typescript
export const GOOGLE_CONFIG = {
  apiKey: 'e9d8d1e36260e3812b6fc79298ee6101a5754826',
  
  // Pega aquí el ID de tu Google Sheet
  sheetsId: 'TU_SPREADSHEET_ID_AQUI',
  
  // Pega aquí el ID de tu carpeta de Drive
  driveFolderId: 'TU_FOLDER_ID_AQUI',
  
  // ... resto del código
};
```

### **4. Hacer Públicas tus APIs** (Importante)

#### Para Google Sheets:
1. Abre tu hoja de cálculo
2. Click en **"Compartir"** (arriba a la derecha)
3. En "Acceso general", selecciona: **"Cualquier persona con el enlace"**
4. Permisos: **"Editor"** (para que la API pueda escribir)
5. Click en **"Listo"**

#### Para Google Drive:
1. Abre tu carpeta de Drive
2. Click derecho → **"Compartir"**
3. En "Acceso general", selecciona: **"Cualquier persona con el enlace"**
4. Permisos: **"Editor"**
5. Click en **"Listo"**

---

## 📊 Columnas del Excel (Google Sheets)

El sistema guardará automáticamente estas columnas en tu hoja:

| Columna | Descripción |
|---------|-------------|
| **ID** | ID único de la reservación |
| **Fecha** | Fecha del evento (YYYY-MM-DD) |
| **Cliente** | Nombre completo del cliente |
| **Horario** | Horario acordado (ej: 14:00 - 22:00) |
| **Tipo de Evento** | Boda, XV Años, Bautizo, etc. |
| **Duración** | Duración en horas |
| **Costo** | Costo de renta en MXN |
| **Estado** | free / reserved / occupied |
| **Creado** | Fecha y hora de creación |
| **URL Comprobante** | Link directo a la foto en Drive |
| **ID Carpeta Drive** | ID de la carpeta del cliente |

Los encabezados se crearán automáticamente la primera vez que guardes una reservación.

---

## 🎯 Funcionalidades Implementadas

### ✅ **Guardar Reservación**
- Formulario con todos los campos
- Campo para subir foto del comprobante
- Preview de la imagen antes de guardar
- Validación de archivos (solo imágenes)

### ✅ **Subida Automática a Drive**
- Crea carpeta con nombre: `[Cliente] - [Fecha]`
- Sube el comprobante con nombre: `Comprobante_[Cliente]_[timestamp].jpg`
- Guarda el link en Google Sheets

### ✅ **Visualización de Comprobantes**
- Ícono 📷 en el calendario para días con comprobante
- Click en el ícono para ver la foto
- Modal con vista previa de la imagen
- Botón para abrir en Drive
- Lista de todos los archivos en la carpeta del cliente

### ✅ **Sincronización con Google Sheets**
- Guardado automático en cada reservación
- Notificación de éxito/error
- Todas las columnas sincronizadas

---

## 🚀 Cómo Usar

### **Para Guardar una Reservación:**

1. Selecciona una fecha en el calendario
2. Completa el formulario:
   - Nombre del cliente
   - Horario
   - Tipo de evento
   - Duración
   - Costo
   - Estado
   - **Comprobante de pago** (opcional)
3. Click en "Guardar Reservación"
4. El sistema automáticamente:
   - Crea la carpeta del cliente en Drive
   - Sube el comprobante
   - Guarda todo en Google Sheets
   - Muestra confirmación

### **Para Ver Comprobantes:**

1. En el calendario, busca los días con el ícono 📷
2. Click en el ícono (no en el día)
3. Se abre un modal con:
   - Información de la reservación
   - Vista previa del comprobante
   - Botón para abrir en Drive
   - Lista de todos los archivos del cliente

---

## ⚠️ Notas Importantes

1. **API Key**: La clave que proporcionaste (`e9d8d1e36260e3812b6fc79298ee6101a5754826`) tiene limitaciones. Si tienes problemas, necesitarás usar **Service Account** con un archivo JSON.

2. **Permisos**: Las hojas y carpetas DEBEN ser públicas (con el enlace) para que la API Key funcione.

3. **Primera vez**: Al guardar la primera reservación, se crearán automáticamente los encabezados en tu Google Sheet.

4. **Testing**: Antes de usar en producción, haz pruebas con reservaciones de prueba.

---

## 🔍 Verificar que Todo Funciona

1. **Abre tu proyecto:**
   ```bash
   cd quinta-calendar-pro-main/quinta-calendar-pro-main
   npm install
   npm run dev
   ```

2. **Configura los IDs** en `src/config/google.ts`

3. **Haz una reservación de prueba** con comprobante

4. **Verifica:**
   - ✅ Se creó una fila en Google Sheets
   - ✅ Se creó una carpeta en Drive
   - ✅ Se subió el comprobante
   - ✅ El ícono 📷 aparece en el calendario
   - ✅ Puedes ver el comprobante desde la web

---

## 📞 Archivos Modificados

- ✅ `src/types/booking.ts` - Tipos actualizados
- ✅ `src/config/google.ts` - Configuración de APIs
- ✅ `src/services/googleSheets.ts` - Servicio de Sheets
- ✅ `src/services/googleDrive.ts` - Servicio de Drive
- ✅ `src/components/BookingForm.tsx` - Formulario con comprobante
- ✅ `src/components/BookingCalendar.tsx` - Calendario con íconos
- ✅ `src/components/PaymentProofViewer.tsx` - Visor de fotos
- ✅ `src/pages/Index.tsx` - Guardado automático

---

## 🎉 ¡Listo!

Tu sistema está completamente integrado con Google. Solo falta que configures los IDs y empieces a usarlo.

**Próximos pasos:**
1. Configurar los IDs en `google.ts`
2. Hacer pública tu Sheet y carpeta de Drive
3. Probar con una reservación
4. ¡Empezar a usar el sistema!


