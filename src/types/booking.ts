export type BookingStatus = 'free' | 'reserved' | 'paid';

export interface Booking {
  id: string;
  date: string;
  clientName: string;
  phone: string;
  reservedQuantity: number;
  schedule: string;
  eventType: string;
  duration: string;
  rentalCost: number;
  status: BookingStatus;
  createdAt: string;
  paid?: boolean; // Nuevo campo para marcar como pagado
  // Nuevos campos para Google Drive
  paymentProofUrl?: string; // URL de la foto en Drive
  clientFolderId?: string; // ID de la carpeta del cliente en Drive
  paymentProofFileName?: string; // Nombre del archivo
}

export interface CalendarDay {
  date: Date;
  status: BookingStatus;
  booking?: Booking;
}
