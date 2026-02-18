import { Booking } from '@/types/booking';
import { uploadToCloudinary } from './cloudinary';
import { authService } from './auth';

const API_URL = '/api/gsheets';

// Función helper para agregar el token a las peticiones
function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Obtener todas las reservaciones desde Google Sheets (via Apps Script)
export const getBookingsFromSheets = async (): Promise<Booking[]> => {
  console.log('🚀 Iniciando carga de reservaciones desde Google Sheets...');
  console.log('🔗 URL de la API:', API_URL);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos timeout
    
    console.log('📤 Enviando petición GET a:', API_URL);
    const response = await fetch(API_URL, {
      method: 'GET',
      redirect: 'follow',
      headers: getAuthHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📥 Respuesta recibida:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      console.error('❌ Error HTTP:', response.status, response.statusText, errorText);
      // Lanzar error para que se vea en la UI
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📦 Resultado parseado:', {
      success: result.success,
      hasData: !!result.data,
      dataIsArray: Array.isArray(result.data),
      dataLength: result.data ? (Array.isArray(result.data) ? result.data.length : 'no es array') : 'no existe'
    });

    if (!result.success) {
      console.error('❌ Error del servidor:', result.error);
      throw new Error(result.error || 'Error desconocido del servidor');
    }

    if (result.data && Array.isArray(result.data)) {
      console.log('✅ Reservaciones obtenidas de Google Sheets:', result.data.length);
      console.log('📊 Datos brutos (primeros 2 elementos):', JSON.stringify(result.data.slice(0, 2), null, 2));
      
      // Si el array está vacío, retornar array vacío (no hay datos en la hoja)
      if (result.data.length === 0) {
        console.log('ℹ️ La hoja de Google Sheets está vacía. No hay reservaciones.');
        return [];
      }
      
      // Mapear los datos del Sheet a nuestro formato Booking
      const bookings: Booking[] = result.data.map((row: any, index: number) => {
        // Log del primer elemento para debug
        if (index === 0) {
          console.log('🔍 Mapeando primer elemento. Claves disponibles:', Object.keys(row));
          console.log('🔍 Valores del primer elemento:', row);
        }
        
        // Convertir fecha ISO a formato YYYY-MM-DD
        let dateStr = String(row.Fecha || row.date || '');
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0];
        }
        // Si la fecha viene como objeto Date de Google Sheets, convertirla
        if (dateStr === '' && row.Fecha) {
          try {
            const dateObj = new Date(row.Fecha);
            if (!isNaN(dateObj.getTime())) {
              dateStr = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn('⚠️ Error parseando fecha:', row.Fecha);
          }
        }
        
        // El backend ya filtró los datos según el token, así que mapeamos todo lo que viene
        // Si el usuario no es admin, el backend solo envió ID, Fecha, Estado
        // Si el usuario es admin, el backend envió todos los datos
        const booking: Booking = {
          id: String(row.ID || row.id || ''),
          date: dateStr,
          // Mapear todos los campos que vengan del backend (ya filtrados por el backend)
          clientName: String(row.Cliente || row.clientName || ''),
          phone: String(row['Teléfono'] || row['Telefono'] || row.Telefono || row.phone || ''),
          reservedQuantity: Number(
            row['Cant. reservada'] ||
            row['Cant reservada'] ||
            row['Cantidad reservada'] ||
            row['Cantidad reservada $'] ||
            row.reservedQuantity ||
            0
          ),
          schedule: String(row.Horario || row.schedule || ''),
          eventType: String(row['Tipo de Evento'] || row.eventType || ''),
          duration: String(row.Duración || row.Duracion || row.duration || ''),
          rentalCost: parseFloat(String(row.Costo || row.rentalCost || 0).replace(/[^0-9.-]/g, '')),
          status: (String(row.Estado || row.status || 'free').toLowerCase() as 'free' | 'reserved' | 'occupied') || 'free',
          createdAt: String(row.Creado || row.createdAt || ''),
          paymentProofUrl: String(row['URL Comprobante'] || row['URL Comprobant'] || row.paymentProofUrl || ''),
          clientFolderId: String(row['ID Carpeta Drive'] || row.clientFolderId || ''),
          paid: (
            row.Pagado === 'SÍ' || 
            row.Pagado === 'SI' || 
            row['Pagado '] === 'SÍ' ||  // Con espacio al final
            row['Pagado '] === 'SI' ||
            row.Pagado === true ||
            row.paid === true || 
            row.paid === 'true'
          ),
        };
        
        if (index === 0) {
          console.log('✅ Primer booking mapeado:', booking);
        }
        
        return booking;
      });
      
      return bookings;
    } else {
      // Si result.data no es un array, pero success es true, retornar vacío (no hay datos)
      console.log('ℹ️ No hay reservaciones en Google Sheets');
      return [];
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout obteniendo reservaciones de Google Sheets');
      throw new Error('Timeout: Google Sheets no respondió a tiempo. Intenta de nuevo.');
    } else {
      console.error('❌ Error obteniendo reservaciones:', error.message || error);
      // Re-lanzar el error para que se muestre en la UI
      throw error;
    }
  }
};

// Guardar una reservación en Google Sheets con foto en Cloudinary
export const saveBookingToSheets = async (
  booking: Booking,
  paymentProofFile?: File
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📤 Guardando reservación en Google Sheets...', booking);
    
    let paymentProofUrl = '';
    
    // Subir foto a Cloudinary si existe
    if (paymentProofFile) {
      console.log('📷 Subiendo foto a Cloudinary...');
      try {
        paymentProofUrl = await uploadToCloudinary(paymentProofFile);
        console.log('✅ Foto subida a Cloudinary:', paymentProofUrl);
      } catch (cloudinaryError) {
        console.error('❌ Error subiendo a Cloudinary:', cloudinaryError);
        return { 
          success: false, 
          error: 'No se pudo subir la foto. Intenta de nuevo.' 
        };
      }
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: booking.id,
        date: booking.date,
        clientName: booking.clientName,
        phone: booking.phone,
        reservedQuantity: booking.reservedQuantity,
        schedule: booking.schedule,
        eventType: booking.eventType,
        duration: booking.duration,
        rentalCost: booking.rentalCost,
        status: booking.status,
        createdAt: booking.createdAt,
        paymentProofUrl: paymentProofUrl,
      }),
    });

    console.log('📥 Respuesta recibida:', response.status, response.statusText);

    // Verificar si la respuesta es exitosa antes de parsear JSON
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      console.error('❌ Error HTTP:', response.status, response.statusText, errorText);
      
      // Intentar parsear como JSON si es posible
      try {
        const errorJson = JSON.parse(errorText);
        return { 
          success: false, 
          error: errorJson.error || `Error ${response.status}: ${response.statusText}` 
        };
      } catch {
        return { 
          success: false, 
          error: `Error ${response.status}: ${response.statusText}. ${errorText.substring(0, 100)}` 
        };
      }
    }

    const result = await response.json();
    console.log('📦 Resultado parseado:', result);

    if (result.success) {
      console.log('✅ Reservación guardada en Google Sheets');
      return { success: true };
    } else {
      console.error('❌ Error del servidor:', result.error);
      return { success: false, error: result.error || 'Error desconocido del servidor' };
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error);
    return { success: false, error: String(error) };
  }
};

// Eliminar una reservación de Google Sheets
export const deleteBookingFromSheets = async (
  bookingId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Eliminando reservación de Google Sheets...', bookingId);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'delete',
        bookingId: bookingId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Reservación eliminada de Google Sheets');
      return { success: true };
    } else {
      console.error('❌ Error del servidor:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error);
    return { success: false, error: String(error) };
  }
};

// Marcar una reservación como pagada en Google Sheets
export const markBookingAsPaid = async (
  bookingId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('💰 Marcando reservación como pagada en Google Sheets...', bookingId);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'markPaid',
        bookingId: bookingId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Reservación marcada como pagada');
      return { success: true };
    } else {
      console.error('❌ Error del servidor:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error);
    return { success: false, error: String(error) };
  }
};
