import { X, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContractModalProps {
  pdfUrl: string;
  clientName: string;
  onClose: () => void;
}

export const ContractModal = ({ pdfUrl, clientName, onClose }: ContractModalProps) => {
  const handleDownload = async () => {
    try {
      // Convertir data URL a Blob para mejor compatibilidad
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrato_${clientName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Limpiar el objeto URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando contrato:', error);
      // Fallback: abrir en nueva pestaña
      window.open(pdfUrl, '_blank');
    }
  };

  const handleShare = async () => {
    // Convertir el data URL a Blob
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const file = new File([blob], `Contrato_${clientName.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Contrato de Arrendamiento - ${clientName}`,
          text: 'Contrato de arrendamiento de quinta'
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback: abrir en nueva pestaña
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] sm:h-[95vh] max-h-screen flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border-b border-border">
          <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground truncate pr-2">
            <span className="hidden sm:inline">Contrato de Arrendamiento - </span>
            <span className="sm:hidden">Contrato - </span>
            {clientName}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1 sm:gap-2 flex-1 sm:flex-initial"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1 sm:gap-2 flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-muted/20">
          <iframe
            src={pdfUrl}
            className="w-full h-full min-h-[500px] rounded-lg border border-border bg-white shadow-lg"
            title={`Contrato de ${clientName}`}
            style={{ minHeight: '500px' }}
          />
        </div>
      </div>
    </div>
  );
};

