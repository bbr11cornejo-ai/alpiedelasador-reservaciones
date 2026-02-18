import { GOOGLE_CONFIG } from '@/config/google';

const DRIVE_FOLDER_ID = GOOGLE_CONFIG.driveFolderId;
const API_KEY = GOOGLE_CONFIG.apiKey;

// Crear carpeta de cliente en Google Drive
export const createClientFolder = async (clientName: string): Promise<string> => {
  // Por ahora, retornar un ID simulado
  // Para implementar esto correctamente necesitarías OAuth 2.0
  console.log('📁 Creando carpeta para:', clientName);
  return DRIVE_FOLDER_ID; // Usar la carpeta principal por ahora
};

// Subir comprobante de pago a Google Drive
export const uploadPaymentProof = async (
  file: File,
  folderId: string,
  clientName: string
): Promise<{ webViewLink: string }> => {
  // Por ahora, retornar un link simulado
  // Para implementar esto correctamente necesitarías OAuth 2.0
  console.log('📤 Subiendo comprobante para:', clientName);
  
  return {
    webViewLink: `https://drive.google.com/drive/folders/${folderId}`
  };
};
