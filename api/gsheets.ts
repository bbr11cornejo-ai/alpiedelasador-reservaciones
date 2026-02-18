// Apps Script Proxy - Protegido con validación de token
import crypto from 'crypto';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwxk-EnB4iQZ2ZOrlkPa42CdNiJcBmDtWj8b2Nmzk4VG3OaxWbgTZ8OEV1Wi0KjAawZBg/exec';

// Log para debug - mostrar qué URL se está usando
console.log('🔧 APPS_SCRIPT_URL configurada:', process.env.APPS_SCRIPT_URL ? '✅ Sí (desde variable de entorno)' : '⚠️ No (usando valor por defecto)');
console.log('🔗 URL que se usará:', APPS_SCRIPT_URL.substring(0, 50) + '...');

const parseBody = (req: any) => {
  if (!req?.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
};

// Validar token de autenticación
function validateAuthToken(req: any): boolean {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  
  // Extraer token del header "Bearer TOKEN"
  const token = authHeader.replace('Bearer ', '');
  if (!token) return false;
  
  try {
    const [payload, signature] = token.split('.');
    const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-super-seguro-aqui-cambiar-en-produccion';
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) return false;
    
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // GET es público (para que visitantes vean el calendario)
  // POST requiere autenticación (solo admin puede crear/editar/eliminar)
  if (req.method === 'POST') {
    if (!validateAuthToken(req)) {
      res.status(401).json({ 
        success: false, 
        error: 'No autorizado - Token inválido o expirado' 
      });
      return;
    }
  }

  if (!APPS_SCRIPT_URL) {
    res.status(500).json({ success: false, error: 'Apps Script URL no configurada' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
      
      try {
        console.log('📤 Enviando GET a Google Apps Script:', APPS_SCRIPT_URL);
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Respuesta GET recibida:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No se pudo leer el error');
          console.error('❌ Error HTTP en GET:', response.status, response.statusText, errorText.substring(0, 200));
          res.status(502).json({ 
            success: false, 
            error: `Error del servidor: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}` 
          });
          return;
        }
        
        const text = await response.text();
        console.log('📄 Respuesta GET texto (primeros 500 chars):', text.substring(0, 500));
        
        // Si la respuesta está vacía, retornar error en lugar de array vacío
        if (!text || text.trim() === '') {
          console.error('❌ Google Apps Script retornó respuesta vacía');
          res.status(502).json({ 
            success: false, 
            error: 'Google Sheets no retornó datos. Verifica la configuración del Apps Script.' 
          });
          return;
        }
        
        try {
          const result = JSON.parse(text);
          console.log('✅ JSON parseado exitosamente:', {
            success: result.success,
            hasData: !!result.data,
            dataLength: result.data ? (Array.isArray(result.data) ? result.data.length : 'no es array') : 'no existe'
          });
          
          // Verificar que el resultado tenga la estructura esperada
          if (!result || typeof result !== 'object') {
            console.error('❌ Resultado no es un objeto válido:', typeof result);
            res.status(502).json({ 
              success: false, 
              error: 'Formato de respuesta inválido de Google Sheets' 
            });
            return;
          }
          
          // Si no tiene data pero tiene success, asegurar que data sea un array
          if (result.success && !result.data) {
            console.warn('⚠️ Resultado tiene success pero no data, agregando array vacío');
            result.data = [];
          }
          
          // Filtrar datos sensibles si no es admin
          const isAdmin = validateAuthToken(req);
          if (!isAdmin && result.data && Array.isArray(result.data)) {
            console.log('🔒 Usuario no autenticado - Filtrando datos sensibles');
            result.data = result.data.map((row: any) => {
              // Solo retornar información básica para visitantes
              return {
                ID: row.ID,
                Fecha: row.Fecha,
                Estado: row.Estado,
                // Ocultar: Cliente, Telefono, Horario, Tipo de Evento, Duración, Costo, 
                // URL Comprobante, ID Carpeta Drive, Pagado, Creado
              };
            });
          }
          
          console.log('✅ Retornando resultado exitoso', isAdmin ? '(admin - datos completos)' : '(visitante - datos filtrados)');
          res.status(200).json(result);
        } catch (parseError) {
          // Si no es JSON válido, intentar retornar como error descriptivo
          console.error('❌ Error parseando respuesta de Google Sheets:', text.substring(0, 200));
          res.status(502).json({ 
            success: false, 
            error: `Respuesta no válida de Google Sheets: ${text.substring(0, 200)}` 
          });
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          res.status(504).json({ 
            success: false, 
            error: 'Timeout: Google Sheets no respondió a tiempo' 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: `Error de conexión: ${fetchError.message || String(fetchError)}` 
          });
        }
      }
      return;
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
      
      try {
        console.log('📤 Enviando POST a Google Apps Script:', APPS_SCRIPT_URL);
        console.log('📦 Body:', JSON.stringify(body).substring(0, 200));
        
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Respuesta recibida:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No se pudo leer el error');
          console.error('❌ Error HTTP:', response.status, response.statusText, errorText.substring(0, 200));
          res.status(502).json({ 
            success: false, 
            error: `Error del servidor: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}` 
          });
          return;
        }
        
        const text = await response.text();
        console.log('📄 Respuesta texto (primeros 200 chars):', text.substring(0, 200));
        
        // Si la respuesta está vacía, retornar error
        if (!text || text.trim() === '') {
          console.error('❌ Google Apps Script retornó respuesta vacía en POST');
          res.status(502).json({ 
            success: false, 
            error: 'Google Sheets no retornó respuesta. Verifica la configuración del Apps Script.' 
          });
          return;
        }
        
        try {
          const result = JSON.parse(text);
          
          // Verificar que el resultado tenga la estructura esperada
          if (!result || typeof result !== 'object') {
            res.status(502).json({ 
              success: false, 
              error: 'Formato de respuesta inválido de Google Sheets' 
            });
            return;
          }
          
          res.status(200).json(result);
        } catch (parseError) {
          // Si no es JSON válido, intentar retornar como error descriptivo
          console.error('❌ Error parseando respuesta de Google Sheets en POST:', text.substring(0, 200));
          res.status(502).json({ 
            success: false, 
            error: `Respuesta no válida de Google Sheets: ${text.substring(0, 200)}` 
          });
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          res.status(504).json({ 
            success: false, 
            error: 'Timeout: Google Sheets no respondió a tiempo' 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: `Error de conexión: ${fetchError.message || String(fetchError)}` 
          });
        }
      }
      return;
    }

    res.status(405).json({ success: false, error: 'Método no permitido' });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: `Error inesperado: ${error.message || String(error)}` 
    });
  }
}
