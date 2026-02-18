import { X, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContractModalProps {
  pdfUrl: string;
  clientName: string;
  onClose: () => void;
}

export const ContractModal = ({ pdfUrl, clientName, onClose }: ContractModalProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Contrato_${clientName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        className="bg-card rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Contrato de Arrendamiento - {clientName}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden p-6 bg-muted/20">
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-lg border border-border bg-white shadow-lg"
            title={`Contrato de ${clientName}`}
          />
        </div>
      </div>
    </div>
  );
};

