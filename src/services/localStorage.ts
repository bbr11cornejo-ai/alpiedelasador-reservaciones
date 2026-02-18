import { Booking } from '@/types/booking';

// Ya NO usamos localStorage, pero dejamos esta función por compatibilidad
export const exportToCSV = (bookings: Booking[]): void => {
  try {
    if (bookings.length === 0) {
      alert('No hay reservaciones para exportar');
      return;
    }
    
    // Crear encabezados
    const headers = [
      'ID',
      'Fecha',
      'Cliente',
      'Telefono',
      'Cantidad reservada $',
      'Horario',
      'Tipo de Evento',
      'Duración',
      'Costo',
      'Estado',
      'Creado',
      'URL Comprobante',
      'ID Carpeta Drive'
    ];
    
    // Crear filas
    const rows = bookings.map(b => [
      b.id,
      b.date,
      b.clientName,
      b.phone,
      b.reservedQuantity,
      b.schedule,
      b.eventType,
      b.duration,
      b.rentalCost,
      b.status,
      b.createdAt,
      b.paymentProofUrl || '',
      b.clientFolderId || ''
    ]);
    
    // Combinar headers y rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reservaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Archivo CSV exportado');
  } catch (error) {
    console.error('❌ Error exportando CSV:', error);
    alert('Error al exportar: ' + error);
  }
};
